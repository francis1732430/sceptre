
import { AttendanceUseCase, ClassUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, AttendanceModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { AttendanceTableSchema,
         AdminUserTableSchema,
         ClassTableSchema,
         ClassStudentsTableSchema,
         ExamTableSchema,
         SubjectTableSchema,
         StandardTableSchema,
         SectionTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";

export class AttendanceHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let check = false;
        const evalutionList = [];
        if (req.body.attendanceList) {
            req.body.attendanceList.forEach((evalution) => {
                if (!check && (!evalution.standardId || !evalution.studentId
                    || !evalution.sectionId || !evalution.attendanceDate)) {
                    check = true;
                } else {
                    evalution.attendanceDate = Utils.getDateFormat(evalution.attendanceDate);
                    const evalutionData = {
                        body: evalution
                    }
                    let marks = AttendanceModel.fromRequest(evalutionData);
                    evalutionList.push(marks);
                }
            });
        }
        console.log(check);
        if (check) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_ATTENDANCE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
                ));
        }
        return Promise.then(() => {
            return AttendanceUseCase.create(evalutionList);
        })
        .then(object => {
            let data  ={};
            data["message"] = "Created successfully";
            res.json(data);
        })
        .catch(err => {
            Utils.responseError(res, err);
        });
    }

    public static list(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let offset = parseInt(req.query.offset) || null;
        let limit = parseInt(req.query.limit) || null;
        let sortKey;
        let sortValue;
        let searchobj = [];
        for (let key in req.query) {
            if(key=='sortKey'){
                sortKey = req.query[key];
            }
            else if(key=='sortValue'){
                sortValue = req.query[key];
            } else if(req.query[key]!='' && key!='limit' && key!='offset' && key!='sortKey' && key!='sortValue'){
                searchobj[key] = req.query[key];
            }
        }
        let adminuser:any;

        let total = 0;
        return Promise.then(() => {
            return AttendanceUseCase.countByQuery(q => {
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.ID}`, searchobj['examId']);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STUDENT_ID}`);
                q.innerJoin(`${ExamTableSchema.TABLE_NAME} as ex`, `ex.${ExamTableSchema.FIELDS.EXAM_ID}`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STANDARD_ID}`);
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return AttendanceUseCase.findByQuery(q => {
                    q.select(`${ExamTableSchema.TABLE_NAME}.*`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME}`,
                    `ex.${ExamTableSchema.FIELDS.EXAM_ID} as examId`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_ID} as subjectId`,
                    `su.${ExamTableSchema.FIELDS.SUBJECTS} as subjectName`,);
                    q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.ID}`, searchobj['examId']);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STUDENT_ID}`);
                q.innerJoin(`${ExamTableSchema.TABLE_NAME} as ex`, `ex.${ExamTableSchema.FIELDS.EXAM_ID}`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STANDARD_ID}`);
                    if (offset != null) {
                        q.offset(offset);
                    }
                    if (limit != null) {
                        q.limit(limit);
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    object.models.forEach(obj => {
                        let markEvolutionData = AttendanceModel.fromDto(obj);
                        markEvolutionData['userId'] = obj.get('user_id');
                        markEvolutionData['studentName'] = obj.get('firstName');
                        markEvolutionData['examId'] = obj.get('examId');
                        markEvolutionData['subjectId'] = obj.get('subjectId');
                        markEvolutionData['subjectName'] = obj.get('subjectName');
                        ret.push(markEvolutionData);
                    });
                }
                

                res.header(Properties.HEADER_TOTAL, total.toString(10));

                if (offset != null) {
                    res.header(Properties.HEADER_OFFSET, offset.toString(10));
                }
                if (limit != null) {
                    res.header(Properties.HEADER_LIMIT, limit.toString(10));
                }

                res.json(ret);
            })
            .catch(err => {
                console.log(err);
                Utils.responseError(res, err);
            });
    }
 
    public static update(req: express.Request, res: express.Response): any {
        let check = false;
        const evalutionList = [];
        if (req.body.attendanceList) {
            req.body.attendanceList.forEach((evalution) => {
                if (!check && (!evalution.standardId || !evalution.studentId
                    || !evalution.sectionId || !evalution.id || !evalution.attendanceDate)) {
                    check = true;
                } else {
                    evalution.attendanceDate = Utils.getDateFormat(evalution.attendanceDate);
                    const evalutionData = {
                        body: evalution
                    }
                    let marks = AttendanceModel.fromRequest(evalutionData);
                    evalutionList.push(marks);
                }
            });
        }
        if (check) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_ATTENDANCE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
                ));
        }
        return Promise.then(() => {
            return AttendanceUseCase.updateById(evalutionList);
        })
            .then(object => {
                let userData = {};
                userData["message"] = "Updated successfully";
                res.json(userData);
            })
            .catch(err => {
                Utils.responseError(res, err);
            });
    }

    public static getById(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let standardId = req.params.standardId || "";
        let sectionId = req.params.sectionId || "";
        let attendanceDate = req.params.attendanceDate || "";
        attendanceDate = Utils.getDateFormat(attendanceDate);
        let evalutionList = [];
        return Promise.then(() => {
            return AttendanceUseCase.findByQuery((q) => {
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STANDARD_ID}`, standardId);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.SECTION_ID}`, sectionId);
                q.select(`${AttendanceTableSchema.TABLE_NAME}.*`,
                `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME}`);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                const condition = `(${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.ATTENDANCE_DATE} LIKE "%${attendanceDate}%")`
                q.andWhereRaw(condition);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STUDENT_ID}`);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.SECTION_ID}`);
            })
        }).then((object) => {
            if (object && 0 < object.models.length) {
                object.models.forEach((obj) => {
                    let attendanceData = AttendanceModel.fromDto(obj);
                        attendanceData['studentName'] = obj.get('firstname');
                        attendanceData['standardName'] = obj.get('standardName');
                        attendanceData['sectionName'] = obj.get('sectionName');
                        evalutionList.push(attendanceData);
                });
                res.json(evalutionList);
                return Promise.break;
            } else {
                return ClassUseCase.findByQuery(q => {
                    q.select(
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID} as studentId`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as studentName`);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, sectionId);
                    q.innerJoin(`${ClassStudentsTableSchema.TABLE_NAME} as cs`, `cs.${ClassStudentsTableSchema.FIELDS.CLASS_ID}`,
                    `${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.CLASS_ID}`);
                    q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `cs.${ClassStudentsTableSchema.FIELDS.USER_ID}`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID}`);
                    q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`cs.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                })
            }
        }).then((objects) => {
            if (objects && objects.models.length) {
                res.json(objects.models);
            } else {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_ATTENDANCE_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            }
        })
        .catch(err => {
            console.log(err);
            Utils.responseError(res, err);
        });
    }

    public static getAttendanceByStudentId(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let studentId = req.params.studentId || "";
        let evalutionList = [];
        return Promise.then(() => {
            return AttendanceUseCase.findByQuery((q) => {
                q.select(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.FORENOON} as forenoon`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.AFTERNOON} as afternoon`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.ATTENDANCE_DATE} as attendanceDate`,)
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STUDENT_ID}`, studentId);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then((object) => {
            if (object && 0 < object.models.length) {
                object.models.forEach((obj) => {
                    let attendanceData = {};
                    attendanceData['forenoon'] = obj.get('forenoon');
                    attendanceData['afternoon'] = obj.get('afternoon');
                    attendanceData['attendanceDate'] = obj.get('attendanceDate');
                    evalutionList.push(attendanceData);
                });
                res.json(evalutionList);
            } else {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_ATTENDANCE_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;      
            }
        })
        .catch(err => {
            console.log(err);
            Utils.responseError(res, err);
        });
    }

    public static getAttendanceList(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let attendanceDate = req.body.attendanceDate || "";
        attendanceDate = Utils.getDateFormat(attendanceDate);
        return Promise.then(() => {
            return AttendanceUseCase.countByQuery((q) => {
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                const condition = `(${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.ATTENDANCE_DATE} LIKE "%${attendanceDate}%")`
                q.andWhereRaw(condition);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STUDENT_ID}`);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                `${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.SECTION_ID}`);
            })
        }).then((object) => {
          res.json(object);  
        })
        .catch(err => {
            console.log(err);
            Utils.responseError(res, err);
        });
    }
}

export default AttendanceHandler;
