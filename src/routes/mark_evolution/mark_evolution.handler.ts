
import { MarkEvalutionUseCase, HomeWorkUseCase, ClassUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, MarkEvalutionModel, ClassModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { MarkEvalutionTableSchema,
         HomeWorkTableSchema,
         AdminUserTableSchema,
         ClassTableSchema,
         ClassStudentsTableSchema,
         StandardTableSchema,
         SectionTableSchema,
         SubjectTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";
import standard from "../../domains/standard";

export class MarkEvolutionHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let check = false;
        const evalutionList = [];
        if (req.body.evalutionList) {
            req.body.evalutionList.forEach((evalution) => {
                if (!check && (!evalution.homeWorkId || !evalution.studentId)) {
                    check = true;
                }
                const evalutionData = {
                    body: evalution
                }
                let marks = MarkEvalutionModel.fromRequest(evalutionData);
                evalutionList.push(marks);
            });
        }
        if (check) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_MARKS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
                ));
        }
        return Promise.then(() => {
            return MarkEvalutionUseCase.create(evalutionList);
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
            return MarkEvalutionUseCase.countByQuery(q => {
                q.where(`${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.HOME_WORK_ID}`, searchobj['homeWorkId']);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                `${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.STUDENT_ID}`);
                q.innerJoin(`${HomeWorkTableSchema.TABLE_NAME} as hw`, `hw.${HomeWorkTableSchema.FIELDS.ID}`,
                `${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.HOME_WORK_ID}`);
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return MarkEvalutionUseCase.findByQuery(q => {
                    q.select(`${HomeWorkTableSchema.TABLE_NAME}.*`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME}`,
                    `hw.${HomeWorkTableSchema.FIELDS.ID} as homeWorkId`,);
                    q.where(`${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.HOME_WORK_ID}`, searchobj['homeWorkId']);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                `${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.STUDENT_ID}`);
                q.innerJoin(`${HomeWorkTableSchema.TABLE_NAME} as hw`, `hw.${HomeWorkTableSchema.FIELDS.ID}`,
                `${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.HOME_WORK_ID}`); 

                    if (offset != null) {
                        q.offset(offset);
                    }
                    if (limit != null) {
                        q.limit(limit);
                    }
                        q.orderBy(`${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    object.models.forEach(obj => {
                        let markEvolutionData = MarkEvalutionModel.fromDto(obj);
                        markEvolutionData['userId'] = obj.get('user_id');
                        markEvolutionData['studentName'] = obj.get('firstName');
                        markEvolutionData['homeWorkId'] = obj.get('homeWorkId');
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
        if (req.body.evalutionList) {
            req.body.evalutionList.forEach((evalution) => {
                if (!check && (!evalution.homeWorkId || !evalution.studentId
                    || !evalution.evalutionId)) {
                    check = true;
                }
                const evalutionData = {
                    body: evalution
                }
                let marks = MarkEvalutionModel.fromRequest(evalutionData);
                evalutionList.push(marks);
            });
        }
        if (check) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_MARKS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
                ));
        }
        return Promise.then(() => {
            return MarkEvalutionUseCase.updateById(evalutionList);
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
        let homeWorkId = req.params.homeWorkId || "";
        let standardId = req.params.standardId || "";
        let sectionId = req.params.sectionId || "";
        let evalutionList = [];
        return Promise.then(() => {
            return MarkEvalutionUseCase.findByQuery((q) => {
                q.where(`${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.HOME_WORK_ID}`, homeWorkId);
                q.where(`${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.select(`${MarkEvalutionTableSchema.TABLE_NAME}.*`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME}`,
                    `hw.${HomeWorkTableSchema.FIELDS.ID} as homeWorkId`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                `${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.STUDENT_ID}`);
                q.innerJoin(`${HomeWorkTableSchema.TABLE_NAME} as hw`, `hw.${HomeWorkTableSchema.FIELDS.ID}`,
                `${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.HOME_WORK_ID}`);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`hw.${HomeWorkTableSchema.FIELDS.IS_DELETED}`, 0); 
            })
        }).then((object) => {
            if (object && 0 < object.models.length) {
                object.models.forEach((obj) => {
                    let markEvolutionData = MarkEvalutionModel.fromDto(obj);
                        markEvolutionData['userId'] = obj.get('user_id');
                        markEvolutionData['studentName'] = obj.get('firstname');
                        markEvolutionData['homeWorkId'] = obj.get('homeWorkId');
                        evalutionList.push(markEvolutionData);
                });
                res.json(evalutionList);
                return Promise.break;
            } else {
                return ClassUseCase.findByQuery(q => {
                    q.select(
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID} as userId`,
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
                    MessageInfo.MI_HOME_WORK_NOT_FOUND,
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

    public static getMarkDetailsByStudentId(req: express.Request, res: express.Response): any {

        let studentId = req.params.studentId || "";

        return Promise.then(() => {

            return MarkEvalutionUseCase.findByQuery(q => {
                q.select(`${MarkEvalutionTableSchema.TABLE_NAME}.*`,
                          `hw.${HomeWorkTableSchema.FIELDS.RID} as homeWorkRid`,
                          `hw.${HomeWorkTableSchema.FIELDS.ID} as homeWorkId`,
                          `hw.${HomeWorkTableSchema.FIELDS.HOME_WORK_DATE} as homeWorkDate`,
                          `hw.${HomeWorkTableSchema.FIELDS.SUBMISSION_DATE} as submissionDate`,
                          `hw.${HomeWorkTableSchema.FIELDS.MARKS} as totalMark`,
                          `hw.${HomeWorkTableSchema.FIELDS.DESCRIPTION} as description`,
                          `st.${StandardTableSchema.FIELDS.STANDARD_ID} as standardId`,
                          `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                          `sec.${SectionTableSchema.FIELDS.SECTION_ID} as sectionId`,
                          `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                          `su.${SubjectTableSchema.FIELDS.SUBJECT_ID} as subjectId`,
                          `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                          `ad.${AdminUserTableSchema.FIELDS.USER_ID} as userId`,
                          `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as firstName`,);
                q.where(`${ MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.STUDENT_ID}`, studentId);
                q.where(`${ MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${HomeWorkTableSchema.TABLE_NAME} as hw`, `hw.${HomeWorkTableSchema.FIELDS.ID}`,
                `${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.HOME_WORK_ID}`);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                `hw.${HomeWorkTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                `hw.${HomeWorkTableSchema.FIELDS.SECTION_ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                `hw.${HomeWorkTableSchema.FIELDS.SUBJECT_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                `${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.STUDENT_ID}`);
            }).then((object) => {
                const ret = [];
            if (object && 0 < object.models.length) {
                const studentIds = {};
                        object.models.forEach((obj) => {
                            if (studentIds[obj.get('student_id')]) {
                                const studentObj = studentIds[obj.get('student_id')];
                                studentObj.homeWorks.push({
                                    rid: obj.get('rid'),
                                    evalutionId: obj.get('evalution_id'),
                                    homeWorkId: obj.get('home_work_id'),
                                    marks: obj.get('marks'),
                                    totalMark: obj.get('totalMark'),
                                    comments: obj.get('comments'),
                                    homeWorkStatus: obj.get('home_work_status'),
                                    homeWorkRid: obj.get('homeWorkRid'),
                                    homeWorkDate: obj.get('homeWorkDate'),
                                    submissionDate: obj.get('submissionDate'),
                                    description: obj.get('description'),
                                });
                            }
                            else {
                                studentIds[obj.get('student_id')] = {
                                studentName: obj.get('firstname'),
                                studentId: obj.get('student_id'),
                                standardName: obj.get('standardName'),
                                standardId: obj.get('standardId'),
                                sectionName: obj.get('sectionName'),
                                sectionId: obj.get('sectionId'),
                                homeWorks: [{
                                    rid: obj.get('rid'),
                                    evalutionId: obj.get('evalution_id'),
                                    homeWorkId: obj.get('home_work_id'),
                                    marks: obj.get('marks'),
                                    totalMark: obj.get('totalMark'),
                                    comments: obj.get('comments'),
                                    homeWorkStatus: obj.get('home_work_status'),
                                    homeWorkRid: obj.get('homeWorkRid'),
                                    homeWorkDate: obj.get('homeWorkDate'),
                                    submissionDate: obj.get('submissionDate'),
                                    description: obj.get('description'),
                                    subjectName: obj.get('subjectName'),
                                    subjectId: obj.get('subjectId'),
                                }],
                            };
                            ret.push(studentIds[obj.get('student_id')]);
                        }
                    });
                    res.json(ret);
            } else {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_HOME_WORK_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            }
            });
        });
    }
    
}

export default MarkEvolutionHandler;
