
import { ExamEvalutionUseCase, HomeWorkUseCase, ClassUseCase, ExamUseCase, SubjectUseCase, AdminUserUseCase, AttendanceUseCase, PaidFeesUseCase, FeesUseCase, FeesStandardsUseCase, FeesSectionsUseCase, ClassStudentsUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, ExamEvalutionModel, ClassModel, ExamModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { ExamEvalutionTableSchema,
         HomeWorkTableSchema,
         AdminUserTableSchema,
         ClassTableSchema,
         ClassStudentsTableSchema,
         ExamTableSchema,
         SubjectTableSchema,
         ExamTypeTableSchema,
         StandardTableSchema,
         SectionTableSchema,
         AttendanceTableSchema,
         PaidFeesTableSchema,
         FeesTypeTableSchema,
         FeesTableSchema,
         FeesAssigneesTableSchema,
         FeesStandardsTableSchema,
         FeesSectionsTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";
import standard from "../../domains/standard";
import pdf from '../../libs/createTable';
import exam from "../../domains/exam";
import UserHandler from "../user/user.handler";
import * as knex from 'knex';
import * as formidable from "formidable";
import {Uploader} from "../../libs";
import * as UUID from "node-uuid";

var QRCode = require('qrcode');
var fs = require('fs')
var path = require('path')

export class ExamEvolutionHandler extends BaseHandler {
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
                if (!check && (!evalution.examId || !evalution.studentId
                    || !evalution.subjectId || !evalution.examDate)) {
                    check = true;
                } else {
                    evalution.examDate = Utils.getDateFormat(evalution.examDate);
                }
                const evalutionData = {
                    body: evalution
                }
                let marks = ExamEvalutionModel.fromRequest(evalutionData);
                evalutionList.push(marks);
            });
        }
        if (check) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EXAM_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
                ));
        }
        return Promise.then(() => {
            return ExamEvalutionUseCase.create(evalutionList);
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
            return ExamEvalutionUseCase.countByQuery(q => {
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`, searchobj['examId']);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`);
                q.innerJoin(`${ExamTableSchema.TABLE_NAME} as ex`, `ex.${ExamTableSchema.FIELDS.EXAM_ID}`,
                `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`);
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return ExamEvalutionUseCase.findByQuery(q => {
                    q.select(`${ExamTableSchema.TABLE_NAME}.*`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME}`,
                    `ex.${ExamTableSchema.FIELDS.EXAM_ID} as examId`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_ID} as subjectId`,
                    `su.${ExamTableSchema.FIELDS.SUBJECTS} as subjectName`,);
                    q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`, searchobj['examId']);
                    q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`);
                    q.innerJoin(`${ExamTableSchema.TABLE_NAME} as ex`, `ex.${ExamTableSchema.FIELDS.EXAM_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`);
                    q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`); 

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
                        let markEvolutionData = ExamEvalutionModel.fromDto(obj);
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
        if (req.body.evalutionList) {
            req.body.evalutionList.forEach((evalution) => {
                if (!check && (!evalution.examId || !evalution.studentId
                    || !evalution.subjectId
                    || !evalution.examDate)) {
                    check = true;
                } else {
                    evalution.examDate = Utils.getDateFormat(evalution.examDate);
                }
                const evalutionData = {
                    body: evalution
                }
                let marks = ExamEvalutionModel.fromRequest(evalutionData);
                evalutionList.push(marks);
            });
        }
        if (check) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EXAM_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
                ));
        }
        return Promise.then(() => {
            return ExamEvalutionUseCase.updateById(evalutionList);
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
        let examId = req.params.examId || "";
        let standardId = req.params.standardId || "";
        let sectionId = req.params.sectionId || "";
        let subjectId = req.params.subjectId || "";
        let evalutionList = [];
        return Promise.then(() => {
            return ExamEvalutionUseCase.findByQuery((q) => {
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`, examId);
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                q.select(`${ExamEvalutionTableSchema.TABLE_NAME}.*`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME}`,
                    `ex.${ExamTableSchema.FIELDS.EXAM_ID} as examId`,
                    `ex.${ExamTableSchema.FIELDS.EXAM_DATE} as examDate`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_ID} as subjectId`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                    `et.${ExamTypeTableSchema.FIELDS.ID} as examTypeId`,
                    `et.${ExamTypeTableSchema.FIELDS.EXAM_TYPE} as examType`,);
                    q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`);
                    q.innerJoin(`${ExamTableSchema.TABLE_NAME} as ex`, `ex.${ExamTableSchema.FIELDS.EXAM_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`);
                    q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`);
                    q.innerJoin(`${ExamTypeTableSchema.TABLE_NAME} as et`, `et.${ExamTypeTableSchema.FIELDS.ID}`,
                    `ex.${ExamTableSchema.FIELDS.EXAM_TYPE}`); 
                    q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`ex.${ExamTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`su.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`et.${ExamTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const existingExamIds = {};
                Promise.then(() => {
                object.models.forEach((obj) => {
                    let currentDate = '';
                    if (obj.get('examDate')) {
                         currentDate = JSON.parse(obj.get('examDate')) ? JSON.parse(JSON.parse(obj.get('examDate')))['date' + subjectId] : '';
                    }
                    let examEvolutionData = ExamEvalutionModel.fromDto(obj);
                        examEvolutionData['userId'] = obj.get('user_id');
                        examEvolutionData['studentName'] = obj.get('firstname');
                        examEvolutionData['examId'] = obj.get('examId');
                        examEvolutionData['subjectId'] = obj.get('subjectId');
                        examEvolutionData['subjectName'] = obj.get('subjectName');
                        examEvolutionData['examTypeId'] = obj.get('examTypeId');
                        examEvolutionData['examType'] = obj.get('examType');
                        examEvolutionData['examDate'] = currentDate;
                        evalutionList.push(examEvolutionData);

                        existingExamIds['student' + obj.get('user_id')] = obj.get('user_id');

                });
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
                }).then((objects) => {
                    if (objects && objects.models.length) {
                        objects.models.forEach((obj) => {
                            let examEvolutionData = {};
                            if (!existingExamIds['student' + obj.get('userId')]) {
                                examEvolutionData['userId'] = obj.get('userId');
                                examEvolutionData['studentName'] = obj.get('studentName');
                                examEvolutionData['examId'] = examId;
                                examEvolutionData['subjectId'] = subjectId;
                                evalutionList.push(examEvolutionData);
                            }
                        });
                    }

                    res.json(evalutionList);
                });
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
                    MessageInfo.MI_EXAM_NOT_FOUND,
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
    public static viewStudentMarks(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let studentId = req.body.studentId || "";
        let subjectId = req.body.subjectId || "";
        let standardId = req.body.standardId || "";
        let sectionId = req.body.sectionId || "";
        const ret = [];
        let studentList = [];
        const standardList = [];
        const sectionList = [];
        const schoolList = [];
        const feesTypes = {};
        const reports = {};
        reports['pendingFeesAmount'] = 0;
        reports['collectedFeesAmount'] = 0;
        return Promise.then(() => {
            return AdminUserUseCase.findByQuery((q) => {
                q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`, studentId);
                q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
            });
        }).then((object) => {
            if (object && object.models.length) {
                return SubjectUseCase.findByQuery((q) => {
                    q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                    q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                }); 
            } else {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_USER_NOT_EXIST,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            }
        }).then((object) => {
            if (object && object.models.length) {
                return ExamEvalutionUseCase.findByQuery((q) => {
                    q.select(`${ExamEvalutionTableSchema.TABLE_NAME}.*`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID} as studentId`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME}`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_ID} as subjectId`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                    `ext.${ExamTypeTableSchema.FIELDS.EXAM_TYPE} as typeName`);
                    q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`, studentId);
                    q.whereRaw(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.MARKS} != 0`);
                    if (subjectId) {
                        q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                    }
                    q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`);
                    q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`);
                    q.innerJoin(`${ExamTableSchema.TABLE_NAME} as et`, `et.${ExamTableSchema.FIELDS.EXAM_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`);
                    q.innerJoin(`${ExamTypeTableSchema.TABLE_NAME} as ext`, `et.${ExamTableSchema.FIELDS.EXAM_TYPE}`,
                    `ext.${ExamTypeTableSchema.FIELDS.ID}`);
                })
            } else {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_SUBJECT_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            }
        }).then((objects) => {
            const ret = []; 
            if (objects && objects.models.length) {
                    const studentIds = {};
                    objects.models.forEach((obj) => {
                            if (studentIds[obj.get('exam_id')] && studentIds[obj.get('exam_id')][obj.get('studentId')]) {
                                const studentObj = studentIds[obj.get('exam_id')][obj.get('studentId')].exams[0];
                                studentObj.subjects.push({
                                    subjectId: obj.get('subjectId'),
                                    subjectName: obj.get('subjectName'),
                                    examPaperName: obj.get('file_name'),
                                    marks: obj.get('marks')
                                });
                            }
                            else {
                                studentIds[obj.get('exam_id')] = {};
                                studentIds[obj.get('exam_id')][obj.get('studentId')] = {
                                firstName: obj.get('firstname'),
                                studentId: obj.get('studentId'),
                                exams: [{
                                    examId: obj.get('exam_id'),
                                    examName: obj.get('typeName'),
                                    subjects: [{
                                        subjectId: obj.get('subjectId'),
                                        subjectName: obj.get('subjectName'),
                                        marks: obj.get('marks'),
                                        examPaperName: obj.get('file_name'),
                                        examDate: obj.get('exam_date')
                                    }],
                                }],
                            };
                            ret.push(studentIds[obj.get('exam_id')][obj.get('studentId')]);
                        }
                    });
                    reports['examReport'] = ret;
                } else {
                reports['examReport'] = ret;
            }
        }).then(() => {
            return AttendanceUseCase.countByQuery(q => {
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.FORENOON}`, 1);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.AFTERNOON}`, 1);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STUDENT_ID}`, studentId);
            });
        })
        .then((obj) => {
            reports['attendance'] = {};
            reports['attendance']['fullDayPresentCount'] = obj;
            return AttendanceUseCase.countByQuery(q => {
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.FORENOON}`, 1);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STUDENT_ID}`, studentId);
            });
        })
        .then((obj) => {
            reports['attendance']['foreNoonPresentCount'] = obj;
            return AttendanceUseCase.countByQuery(q => {
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.AFTERNOON}`, 1);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STUDENT_ID}`, studentId);
            });
        })
        .then((obj) => {
            reports['attendance']['afterNoonPresentCount'] = obj;
            return AttendanceUseCase.countByQuery(q => {
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.FORENOON}`, 3);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.AFTERNOON}`, 3);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STUDENT_ID}`, studentId);
            });
        })
        .then((obj) => {
            reports['attendance']['fullDayAbsentCount'] = obj;
            return AttendanceUseCase.countByQuery(q => {
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.FORENOON}`, 3);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STUDENT_ID}`, studentId);
            });
        })
        .then((obj) => {
            reports['attendance']['foreNoonAbsentCount'] = obj;
            return AttendanceUseCase.countByQuery(q => {
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.AFTERNOON}`, 3);
                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.STUDENT_ID}`, studentId);
            });
        })
        .then((obj) => {
            reports['attendance']['afterNoonAbsentCount'] = obj;
            return PaidFeesUseCase.findByQuery((q) => {
                q.select(`${PaidFeesTableSchema.TABLE_NAME}.*`,
                `fe.${FeesTableSchema.FIELDS.FEES_AMOUNT} as totalFeesAmount`,
                `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as studentName`,
                `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`,
                `cb.${AdminUserTableSchema.FIELDS.FIRSTNAME} as createdByName`,)
                if (standardId) {
                    q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STANDARD_ID}`, standardId);
                }
                if (sectionId) {
                    q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.SECTION_ID}`, sectionId);
                }
                if (studentId) {
                    q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STUDENT_ID}`, studentId);
                }
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.SECTION_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STUDENT_ID}`);
                q.innerJoin(`${FeesTableSchema.TABLE_NAME} as fe`, `fe.${FeesTableSchema.FIELDS.ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.FEES_ID}`);
                q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`, `fe.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as cb`, `cb.${AdminUserTableSchema.FIELDS.USER_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.CREATED_BY}`);
    
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`cb.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`fe.${FeesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.orderBy(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
            })
        }).then((object) => {
            const ret = [];
                if (object && 0 < object.models.length) {
                    const studentIds = {};
                    
                            object.models.forEach((obj) => {
                                if (studentIds[obj.get('student_id')]) {
                                    const studentObj = studentIds[obj.get('student_id')];
                                    reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('totalFeesAmount')) - parseFloat(obj.get('fees_amount')));
                                    reports['collectedFeesAmount'] = reports['collectedFeesAmount'] +  parseFloat(obj.get('fees_amount'));
                                    studentObj.feesAmount.push({
                                        feesAmount: obj.get('fees_amount'),
                                        totalFeesAmount: obj.get('totalFeesAmount'),
                                        feesType: obj.get('feesType'),
                                        paidStatus: obj.get('paid_status'),
                                        transactionId: obj.get('transaction_id'),
                                        createdBy: obj.get('created_by'),
                                        paymentMode: obj.get('payment_mode'),
                                        id: obj.get('id'),
                                        rid: obj.get('rid'),
                                        feesId: obj.get('fees_id'),
                                        createdDate: obj.get('created_date'),
                                        updated_date: obj.get('updated_date')
                                    });
                                }
                                else {
                                    reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('totalFeesAmount')) - parseFloat(obj.get('fees_amount')));
                                    reports['collectedFeesAmount'] = reports['collectedFeesAmount'] +  parseFloat(obj.get('fees_amount'));
                                    studentIds[obj.get('student_id')] = {
                                    studentId: obj.get('student_id'),
                                    standardId: obj.get('standard_id'),
                                    sectionId: obj.get('section_id'),
                                    standardName: obj.get('standardName'),
                                    sectionName: obj.get('sectionName'),
                                    studentName: obj.get('studentName'),
                                    feesAmount: [{
                                        feesAmount: obj.get('fees_amount'),
                                        totalFeesAmount: obj.get('totalFeesAmount'),
                                        feesType: obj.get('feesType'),
                                        paidStatus: obj.get('paid_status'),
                                        transactionId: obj.get('transaction_id'),
                                        createdBy: obj.get('created_by'),
                                        paymentMode: obj.get('payment_mode'),
                                        id: obj.get('id'),
                                        rid: obj.get('rid'),
                                        feesId: obj.get('fees_id'),
                                        createdDate: obj.get('created_date'),
                                        updated_date: obj.get('updated_date')
                                    }],
                                };
                                ret.push(studentIds[obj.get('student_id')]);
                            }
                        });
                        reports['feesPaidList'] = ret;
                } else {
                    reports['feesPaidList'] = [];
                }
                // return FeesTableSchema.
                // res.json(reports);
                return FeesUseCase.findByQuery((q) => {
                    q.whereNotExists(knex.raw('SELECT *FROM paid_fees WHERE fees.id = paid_fees.fees_id'));
                    q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                    `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE}`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.STANDARD_ID}`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.SECTION_ID}`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID}`)
                    q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`,
                    `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                    q.innerJoin(`${FeesAssigneesTableSchema.TABLE_NAME} as fa`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.FEES_ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                    q.where(`fa.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID}`, studentId);
                    q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`fa.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                    // q.select(knex.raw('WHERE NOT EXISTS ( SELECT *FROM paid_fees WHERE fees.id = paid_fees.fees_id)'))
                })
        })
        .then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};
                        object.models.forEach((obj) => {
                            if (studentIds[obj.get('student_id')]) {
                                const studentObj = studentIds[obj.get('student_id')];
                                reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                                studentObj.feesAmount.push({
                                    feesAmount: obj.get('fees_amount'),
                                    feesTypeId: obj.get('fees_Type_Id'),
                                    feesType: obj.get('fees_Type'),
                                    createdBy: obj.get('created_by'),
                                    id: obj.get('id'),
                                    rid: obj.get('rid'),
                                    createdDate: obj.get('created_date'),
                                    updated_date: obj.get('updated_date')
                                });
                                feesTypes[obj.get('feesTypeId')] = obj.get('fees_Type_Id');
                            }
                            else {
                                reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                                studentIds[obj.get('student_id')] = {
                                studentId: obj.get('student_id'),
                                standardId: obj.get('standard_id'),
                                sectionId: obj.get('section_id'),
                                standardName: obj.get('standardName'),
                                sectionName: obj.get('sectionName'),
                                feesAmount: [{
                                    feesAmount: obj.get('fees_amount'),
                                    feesTypeId: obj.get('fees_Type_Id'),
                                    feesType: obj.get('fees_Type'),
                                    createdBy: obj.get('created_by'),
                                    id: obj.get('id'),
                                    rid: obj.get('rid'),
                                    createdDate: obj.get('created_date'),
                                    updated_date: obj.get('updated_date')
                                }],
                            };
                            feesTypes[obj.get('feesTypeId')] = obj.get('fees_Type_Id');
                            studentList.push(studentIds[obj.get('student_id')]);
                        }
                    });
            } 
            else {
                return FeesSectionsUseCase.findByQuery((q) => {
                    q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.SECTION_ID}`, sectionId);
                }); 
            }
        })
        .then((object) => {
            if (object && 0 < object.models.length) {
            return FeesUseCase.findByQuery((q) => {
                q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                `fs.${FeesSectionsTableSchema.FIELDS.STANDARD_ID} as standardId`,
                `fs.${FeesSectionsTableSchema.FIELDS.SECTION_ID} as sectionId`,
                `fs.${FeesSectionsTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                `fs.${FeesSectionsTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                q.where(`fs.${FeesSectionsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                q.where(`fs.${FeesSectionsTableSchema.FIELDS.SECTION_ID}`, sectionId);
                q.where(`fs.${FeesSectionsTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                q.whereNotExists(knex.raw('SELECT *FROM paid_fees WHERE fees.id = paid_fees.fees_id'));
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${FeesSectionsTableSchema.TABLE_NAME} as fs`, `fs.${FeesSectionsTableSchema.FIELDS.FEES_ID}`,
                `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
            });
        } else {
            return Promise.void;
        }
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};

                if (0 < studentList.length) {
                    object.models.forEach((obj, i) => {
                        studentList.forEach((obj2) => {
                            if (obj2) {
                                obj2.feesAmount.forEach((obj3) => {
                                    if (obj3.feesTypeId !== obj.get('fees_type_id') && !feesTypes[obj.get('fees_type_id')]) {
                                        if (studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')]) {
                                            reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                                            const studentObj = studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')];
                                            studentObj.feesAmount.push({
                                             feesAmount: obj.get('fees_amount'),
                                             feesTypeId: obj.get('fees_Type_Id'),
                                             feesType: obj.get('feesType'),
                                             createdBy: obj.get('created_by'),
                                             id: obj.get('id'),
                                             rid: obj.get('rid'),
                                             createdDate: obj.get('created_date'),
                                             updated_date: obj.get('updated_date')
                                            });
                                        }
                                        else {
                                            reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                                            studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')] = {
                                            standardId: obj.get('standardId'),
                                            sectionId: obj.get('sectionId'),
                                            standardName: obj.get('standardName'),
                                            sectionName: obj.get('sectionName'),
                                            feesAmount: [{
                                                feesAmount: obj.get('fees_amount'),
                                                feesTypeId: obj.get('fees_Type_Id'),
                                                feesType: obj.get('feesType'),
                                                createdBy: obj.get('created_by'),
                                                id: obj.get('id'),
                                                rid: obj.get('rid'),
                                                createdDate: obj.get('created_date'),
                                                updated_date: obj.get('updated_date')
                                            }],
                                        };
                                        obj2.feesAmount.push(studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')].feesAmount[i]);
                                    }
                                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                                    }
                                });
                            }
                        });
                });
                } else {
                    object.models.forEach((obj) => {
                        if (studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')]) {
                            const studentObj = studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')];
                            reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                            studentObj.feesAmount.push({
                                feesAmount: obj.get('fees_amount'),
                                feesTypeId: obj.get('fees_Type_Id'),
                                feesType: obj.get('feesType'),
                                createdBy: obj.get('created_by'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                createdDate: obj.get('created_date'),
                                updated_date: obj.get('updated_date')
                            });
                        }
                        else {
                            reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                            studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')] = {
                            standardId: obj.get('standardId'),
                            sectionId: obj.get('sectionId'),
                            standardName: obj.get('standardName'),
                            sectionName: obj.get('sectionName'),
                            feesAmount: [{
                                feesAmount: obj.get('fees_amount'),
                                feesTypeId: obj.get('fees_Type_Id'),
                                feesType: obj.get('feesType'),
                                createdBy: obj.get('created_by'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                createdDate: obj.get('created_date'),
                                updated_date: obj.get('updated_date')
                            }],
                        };
                        standardList.push(studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')]);
                    }
                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                    })
                }
            }
                if (studentList.length === 0) {
                    studentList = standardList;
                }
                return FeesStandardsUseCase.findByQuery((q) => {
                    q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                });
        }).then((object) => {
            if (object && 0 < object.models.length) {
            return FeesUseCase.findByQuery((q) => {
                q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                `fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID} as standardId`,
                `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                q.where(`fs.${FeesStandardsTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                q.whereNotExists(knex.raw('SELECT *FROM paid_fees WHERE fees.id = paid_fees.fees_id'));
                q.innerJoin(`${FeesStandardsTableSchema.TABLE_NAME} as fs`, `fs.${FeesStandardsTableSchema.FIELDS.FEES_ID}`,
                `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
            });
        } else {
            return Promise.void;
        }
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};
                if (0 < studentList.length) {
                    object.models.forEach((obj, i) => {
                        studentList.forEach((obj2) => {
                            if (obj2) {
                                obj2.feesAmount.forEach((obj3) => {
                                    if (obj3.feesType !== obj.get('feesType') && !feesTypes[obj.get('feesType')]) {
                                        if (studentIds[obj.get('standardId')]) {
                                            reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                                            const studentObj = studentIds[obj.get('standardId')];
                                            studentObj.feesAmount.push({
                                                feesAmount: obj.get('fees_amount'),
                                                feesTypeId: obj.get('fees_Type_Id'),
                                                feesType: obj.get('feesType'),
                                                createdBy: obj.get('created_by'),
                                                id: obj.get('id'),
                                                rid: obj.get('rid'),
                                                createdDate: obj.get('created_date'),
                                                updated_date: obj.get('updated_date')
                                            });
                                        }
                                        else {
                                            reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                                            studentIds[obj.get('standardId')] = {
                                            standardId: obj.get('standardId'),
                                            feesAmount: [{
                                                feesAmount: obj.get('fees_amount'),
                                                feesTypeId: obj.get('fees_Type_Id'),
                                                feesType: obj.get('feesType'),
                                                createdBy: obj.get('created_by'),
                                                id: obj.get('id'),
                                                rid: obj.get('rid'),
                                                createdDate: obj.get('created_date'),
                                                updated_date: obj.get('updated_date')
                                            }],
                                        };
                                        obj2.feesAmount.push(studentIds[obj.get('standardId')].feesAmount[i]);
                                    }
                                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                                    }
                                });
                            }
                        });
                });
                } else {
                    object.models.forEach((obj) => {
                        if (studentIds[obj.get('standardId')]) {
                            const studentObj = studentIds[obj.get('standardId')];
                            reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                            studentObj.feesAmount.push({
                                feesAmount: obj.get('fees_amount'),
                                feesTypeId: obj.get('fees_Type_Id'),
                                feesType: obj.get('feesType'),
                                createdBy: obj.get('created_by'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                createdDate: obj.get('created_date'),
                                updated_date: obj.get('updated_date')
                            });
                        }
                        else {
                            reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                            studentIds[obj.get('standardId')] = {
                            standardId: obj.get('standardId'),
                            feesAmount: [{
                                feesAmount: obj.get('fees_amount'),
                                feesTypeId: obj.get('fees_Type_Id'),
                                feesType: obj.get('feesType'),
                                createdBy: obj.get('created_by'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                createdDate: obj.get('created_date'),
                                updated_date: obj.get('updated_date')
                            }],
                        };
                        sectionList.push(studentIds[obj.get('standardId')]);
                    }
                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                });
                }
            }
            if (studentList.length === 0) {
                studentList = sectionList;
            }
            return FeesStandardsUseCase.findByQuery((q) => {
                q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`, standardId);
            });
        }).then((object) => {
            if (object && 0 < object.models.length) {
                return FeesUseCase.findByQuery((q) => {
                    q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                    `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                     q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                     q.whereNotExists(knex.raw('SELECT *FROM paid_fees WHERE fees.id = paid_fees.fees_id'));
                     q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_OPTION}`, 1);
                    q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                });
            } else {
                return Promise.void;
            }
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};
                if (0 < studentList.length) {
                    object.models.forEach((obj, i) => {
                        studentList.forEach((obj2) => {
                            if (obj2) {
                                obj2.feesAmount.forEach((obj3) => {
                                    if (obj3.feesType !== obj.get('feesType') && !feesTypes[obj.get('feesType')]) {
                                        if (studentIds[obj.get('id')]) {
                                            reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                                            const studentObj = studentIds[obj.get('id')];
                                            studentObj.feesAmount.push({
                                                feesAmount: obj.get('fees_amount'),
                                                feesTypeId: obj.get('fees_Type_Id'),
                                                feesType: obj.get('feesType'),
                                                createdBy: obj.get('created_by'),
                                                id: obj.get('id'),
                                                rid: obj.get('rid'),
                                                createdDate: obj.get('created_date'),
                                                updated_date: obj.get('updated_date')
                                            });
                                        }
                                        else {
                                            reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                                            studentIds[obj.get('id')] = {
                                            feesAmount: [{
                                                feesAmount: obj.get('fees_amount'),
                                                feesTypeId: obj.get('fees_Type_Id'),
                                                feesType: obj.get('feesType'),
                                                createdBy: obj.get('created_by'),
                                                id: obj.get('id'),
                                                rid: obj.get('rid'),
                                                createdDate: obj.get('created_date'),
                                                updated_date: obj.get('updated_date')
                                            }],
                                        };
                                        obj2.feesAmount.push(studentIds[obj.get('id')].feesAmount[i]);
                                    }
                                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                                    }
                                });
                            }
                        });
                });
                } else {
                    
                    object.models.forEach((obj) => {
                        if (studentIds[obj.get('id')]) {
                            const studentObj = studentIds[obj.get('id')];
                            reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                            studentObj.feesAmount.push({
                                feesAmount: obj.get('fees_amount'),
                                feesTypeId: obj.get('fees_Type_Id'),
                                feesType: obj.get('feesType'),
                                createdBy: obj.get('created_by'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                createdDate: obj.get('created_date'),
                                updated_date: obj.get('updated_date')
                            });
                        }
                        else {
                            reports['pendingFeesAmount'] = reports['pendingFeesAmount'] + (parseFloat(obj.get('fees_amount')));
                            studentIds[obj.get('id')] = {
                            feesAmount: [{
                                feesAmount: obj.get('fees_amount'),
                                feesTypeId: obj.get('fees_Type_Id'),
                                feesType: obj.get('feesType'),
                                createdBy: obj.get('created_by'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                createdDate: obj.get('created_date'),
                                updated_date: obj.get('updated_date')
                            }],
                        };
                        schoolList.push(studentIds[obj.get('id')]);
                    }
                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                });
                }
            }
            if (0 < studentList.length) {
                // res.json(studentList);
                reports['feesUnPaidList'] = studentList;
            } else if(0 < schoolList.length) {
                reports['feesUnPaidList'] = schoolList;
                // res.json(sectionList);
            } else {
                reports['feesUnPaidList'] = [];
            }
            res.json(reports);
        })
        .catch(err => {
            console.log(err);
            Utils.responseError(res, err);
        });
    }
    public static getExamBarCodes(req: express.Request, res: express.Response): any {
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
        return Promise.then(() => {
            return ExamEvalutionUseCase.findByQuery((q) => {
                q.select(`${ExamEvalutionTableSchema.TABLE_NAME}.*`,
                      `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                      `st.${StandardTableSchema.FIELDS.STANDARD_ID} as standardId`,
                      `sec.${SectionTableSchema.FIELDS.SECTION_ID} as sectionId`,
                      `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                      `ety.${ExamTypeTableSchema.FIELDS.EXAM_TYPE} as examType`,
                      `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                      `su.${SubjectTableSchema.FIELDS.SUBJECT_ID} as subjectId`,
                      `et.${ExamTableSchema.FIELDS.EXAM_ID} as studentExamId`,
                      `et.${ExamTableSchema.FIELDS.EXAM_TYPE} as examTypeId`,
                      `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as studentName`,
                      `et.${ExamTableSchema.FIELDS.TOTAL_MARK} as totalMark`,
                      `et.${ExamTableSchema.FIELDS.EXAM_DATE} as examDate`
                 );
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${ExamTableSchema.TABLE_NAME} as et`,
                `et.${ExamTableSchema.FIELDS.EXAM_ID}`,
                `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`,
                `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                `et.${ExamTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`,
                `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                `et.${ExamTableSchema.FIELDS.SECTION_ID}`);
                q.innerJoin(`${ExamTypeTableSchema.TABLE_NAME} as ety`,
                `ety.${ExamTypeTableSchema.FIELDS.ID}`,
                `et.${ExamTableSchema.FIELDS.EXAM_TYPE}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`,
                `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`,
                `ad.${AdminUserTableSchema.FIELDS.USER_ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`,
                `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`);
                    if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            if(key == 'examId') {
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'standardId'){
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'sectionId'){
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'examType'){
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'subjectId'){
                                condition = `(et.${ExamTableSchema.FIELDS.SUBJECTS} LIKE "%${searchval}%" and
                                ${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'totalMark'){
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'studentId'){
                                condition = `(${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'marks'){
                                condition = `(${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.MARKS}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'createdDate') {
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'updatedDate') {
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            }
                        }
                    }
                }
            })
            .then((object) => {
                let ret = [];
                if (object != null && 0 < object.models.length) {
                    return Promise.then(() => {
                        Promise.each(object.models, (obj: any, i) => {
                        let examData = ExamEvalutionModel.fromDto(obj);
                        examData['studentExamId'] = obj.get('studentExamId');
                        const barIds = `${examData.studentId},${examData['studentExamId']},${examData.subjectId}`;
                        QRCode.toDataURL(barIds)
                        .then(url => {
                            let currentDate = '';
                            if (obj.get('examDate')) {
                                currentDate = JSON.parse(obj.get('examDate')) ? JSON.parse(JSON.parse(obj.get('examDate')))['date' + obj.get('subjectId')] : '';
                            }
                        examData['standardName'] = obj.get('standardName');
                        examData['sectionName'] = obj.get('sectionName');
                        examData['examType'] = obj.get('examType');
                        examData['subjectName'] = obj.get('subjectName');
                        examData['studentExamId'] = obj.get('studentExamId');
                        examData['studentName'] = obj.get('studentName');
                        examData['standardId'] = obj.get('standardId');
                        examData['sectionId'] = obj.get('sectionId');
                        examData['examTypeId'] = obj.get('examTypeId');
                        examData['totalMark'] = obj.get('totalMark');
                        examData['totalMark'] = currentDate;
                        examData['barCodeUrl'] = url;
                        ret.push(examData);
                        if (object.models.length - 1 === i) {
                            res.json(ret);
                        }
                        });
                    })
                    }).catch(err => {
                        console.error(err)
                    });
                } else {
                    res.json([])
                }
            })
            .catch(err => {
                console.log(err);
                Utils.responseError(res, err);
            });
        });
    }

    public static getExamPdf(req: express.Request, res: express.Response): any {
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
        return Promise.then(() => {
            return ExamEvalutionUseCase.findByQuery((q) => {
                q.select(`${ExamEvalutionTableSchema.TABLE_NAME}.*`,
                      `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                      `st.${StandardTableSchema.FIELDS.STANDARD_ID} as standardId`,
                      `sec.${SectionTableSchema.FIELDS.SECTION_ID} as sectionId`,
                      `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                      `ety.${ExamTypeTableSchema.FIELDS.EXAM_TYPE} as examType`,
                      `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                      `et.${ExamTableSchema.FIELDS.EXAM_ID} as studentExamId`,
                      `et.${ExamTableSchema.FIELDS.EXAM_TYPE} as examTypeId`,
                      `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as studentName`,
                      `et.${ExamTableSchema.FIELDS.TOTAL_MARK} as totalMark`
                 );
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${ExamTableSchema.TABLE_NAME} as et`,
                `et.${ExamTableSchema.FIELDS.EXAM_ID}`,
                `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`,
                `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                `et.${ExamTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`,
                `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                `et.${ExamTableSchema.FIELDS.SECTION_ID}`);
                q.innerJoin(`${ExamTypeTableSchema.TABLE_NAME} as ety`,
                `ety.${ExamTypeTableSchema.FIELDS.ID}`,
                `et.${ExamTableSchema.FIELDS.EXAM_TYPE}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`,
                `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`,
                `ad.${AdminUserTableSchema.FIELDS.USER_ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`,
                `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`);
                    if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            if(key == 'examId') {
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'standardId'){
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'sectionId'){
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'examType'){
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'subjectId'){
                                condition = `(et.${ExamTableSchema.FIELDS.SUBJECTS} LIKE "%${searchval}%" and
                                ${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'totalMark'){
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'studentId'){
                                condition = `(${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'marks'){
                                condition = `(${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.MARKS}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'createdDate') {
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'updatedDate') {
                                condition = `(et.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            }
                        }
                    }
                }
            })
            .then((object) => {
                let ret = [];
                if (object != null && 0 < object.models.length) {
                    return Promise.then(() => {
                        Promise.each(object.models, (obj: any, i) => {
                        let examData = ExamEvalutionModel.fromDto(obj);
                        examData['studentExamId'] = obj.get('studentExamId');
                        const barIds = `${examData.studentId},${examData['studentExamId']},${examData.subjectId}`;
                        QRCode.toDataURL(barIds)
                        .then(url => {
                        examData['standardName'] = obj.get('standardName');
                        examData['sectionName'] = obj.get('sectionName');
                        examData['examType'] = obj.get('examType');
                        examData['subjectName'] = obj.get('subjectName');
                        examData['studentExamId'] = obj.get('studentExamId');
                        examData['studentName'] = obj.get('studentName');
                        examData['standardId'] = obj.get('standardId');
                        examData['sectionId'] = obj.get('sectionId');
                        examData['examTypeId'] = obj.get('examTypeId');
                        examData['totalMark'] = obj.get('totalMark');
                        examData['barCodeUrl'] = url;
                        ret.push(examData);
                        if (object.models.length - 1 === i) {
                            pdf.createTable(ret).then(() => {
                                res.json({
                                    message: "pdf created Successfully",
                                    path: 'public/build.pdf'
                                });
                            });
                        }
                        });
                    })
                    }).catch(err => {
                        console.error(err)
                    });
                } else {
                    res.json([])
                }
            })
            .catch(err => {
                console.log(err);
                Utils.responseError(res, err);
            });
        });
    }
    public static getExamPdf1(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let examId = req.params.examId || "";
        let standardId = req.params.standardId || "";
        let sectionId = req.params.sectionId || "";
        let subjectId = req.params.subjectId || "";
        let subjectName;
        let checkUpdate = false;
        return Promise.then(() => {
            return SubjectUseCase.findByQuery((q) => {
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
            });
        }).then((objects) => {
            if (0 === objects.models.length) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_SUBJECT_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                subjectName = objects.models[0].get('subject_name');
                return ExamEvalutionUseCase.findByQuery((q) => {
                    q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`, examId);
                    q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                    q.select(`${ExamEvalutionTableSchema.TABLE_NAME}.*`,
                        `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                        `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME}`,
                        `ex.${ExamTableSchema.FIELDS.EXAM_ID} as examId`,
                        `ex.${ExamTableSchema.FIELDS.EXAM_DATE} as examDate`,
                        `su.${SubjectTableSchema.FIELDS.SUBJECT_ID} as subjectId`,
                        `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                        `et.${ExamTypeTableSchema.FIELDS.ID} as examTypeId`,
                        `et.${ExamTypeTableSchema.FIELDS.EXAM_TYPE} as examType`,
                        `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                        `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,);
                        q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                        `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`);
                        q.innerJoin(`${ExamTableSchema.TABLE_NAME} as ex`, `ex.${ExamTableSchema.FIELDS.EXAM_ID}`,
                        `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`);
                        q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                        `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`);
                        q.innerJoin(`${ExamTypeTableSchema.TABLE_NAME} as et`, `et.${ExamTypeTableSchema.FIELDS.ID}`,
                        `ex.${ExamTableSchema.FIELDS.EXAM_TYPE}`);
                        q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                        `ex.${ExamTableSchema.FIELDS.STANDARD_ID}`);
                        q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                        `ex.${ExamTableSchema.FIELDS.SECTION_ID}`); 
                        q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`ex.${ExamTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`su.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`et.${ExamTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                })
            }
        }).then((object) => {
                let ret = [];
                if (object != null && 0 < object.models.length) {
                    return Promise.then(() => {
                        Promise.each(object.models, (obj: any, i) => {
                        let examEvolutionData = ExamEvalutionModel.fromDto(obj);
                        let currentDate = '';
                            if (obj.get('examDate')) {
                                currentDate = JSON.parse(obj.get('examDate')) ? JSON.parse(JSON.parse(obj.get('examDate')))['date' + subjectId] : '';
                            }
                        const barIds = `${obj.get('user_id')},${examId},${subjectId},${examEvolutionData.id},${currentDate}`;
                        QRCode.toDataURL(barIds)
                        .then(url => {
                            examEvolutionData['userId'] = obj.get('user_id');
                            examEvolutionData['studentName'] = obj.get('firstname');
                            examEvolutionData['examId'] = obj.get('examId');
                            examEvolutionData['subjectId'] = obj.get('subjectId');
                            examEvolutionData['subjectName'] = obj.get('subjectName');
                            examEvolutionData['examTypeId'] = obj.get('examTypeId');
                            examEvolutionData['examType'] = obj.get('examType');
                            examEvolutionData['standardName'] = obj.get('standardName');
                            examEvolutionData['sectionName'] = obj.get('sectionName');
                            examEvolutionData['marks'] = obj.get('marks');
                            examEvolutionData['barCodeUrl'] = url;
                        ret.push(examEvolutionData);
                        if (object.models.length - 1 === i) {
                            pdf.createTable(ret).then(() => {
                                res.json({
                                    message: "pdf created Successfully",
                                    path: 'public/build.pdf'
                                });
                            });
                        }
                        });
                    });
                    }).catch(err => {
                        console.error(err)
                    });
            } else {
                checkUpdate = true;
                return ClassUseCase.findByQuery(q => {
                    q.select(
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID} as userId`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as studentName`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `ex.${ExamTableSchema.FIELDS.EXAM_DATE} as examDate`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, sectionId);
                    q.innerJoin(`${ClassStudentsTableSchema.TABLE_NAME} as cs`, `cs.${ClassStudentsTableSchema.FIELDS.CLASS_ID}`,
                    `${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.CLASS_ID}`);
                    q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `cs.${ClassStudentsTableSchema.FIELDS.USER_ID}`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID}`);
                    q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`
                    ,`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`);
                    q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`
                    ,`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`);
                    q.innerJoin(`${ExamTableSchema.TABLE_NAME} as ex`, `ex.${ExamTableSchema.FIELDS.STANDARD_ID}`
                    ,`st.${StandardTableSchema.FIELDS.STANDARD_ID}`);
                    q.where(`ex.${ExamTableSchema.FIELDS.EXAM_ID}`, examId);
                    q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`cs.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                })
            }
        }).then((objects) => {
            let ret = [];
            if (checkUpdate) {
                if (objects != null && 0 < objects.models.length) {
                    return Promise.then(() => {
                        Promise.each(objects.models, (obj: any, i) => {
                        let examData = ExamEvalutionModel.fromDto(obj);
                        let currentDate = '';
                            if (obj.get('examDate')) {
                                currentDate = JSON.parse(obj.get('examDate')) ? JSON.parse(JSON.parse(obj.get('examDate')))['date' + subjectId] : '';
                            }
                        const barIds = `${obj.get('userId')},${examId},${subjectId},${currentDate}`;
                        QRCode.toDataURL(barIds)
                        .then(url => {
                        examData['barCodeUrl'] = url;
                        examData['studentName'] = obj.get('studentName');
                        examData['standardName'] = obj.get('standardName');
                        examData['sectionName'] = obj.get('sectionName');
                        examData['subjectName'] = subjectName;
                        ret.push(examData);
                        if (objects.models.length - 1 === i) {
                            pdf.createTable(ret).then(() => {
                                res.json({
                                    message: "pdf created Successfully",
                                    path: 'public/build.pdf'
                                });
                            });
                        }
                        });
                    })
                    }).catch(err => {
                        console.error(err)
                    });
                } else {
                    Utils.responseError(res, new Exception(
                        ErrorCode.RESOURCE.NOT_FOUND,
                        MessageInfo.MI_EXAM_NOT_FOUND,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                }
            }
        })
        .catch(err => {
            console.log(err);
            Utils.responseError(res, err);
        });
    }
    public static getPdfContent(req: express.Request, res: express.Response): any {
        fs.stat(path.resolve('./src/assets/build.pdf'), function(err, stats) {
            if (err) {
              res.statusCode = 500;
              return res.end();
            }
            res.writeHead(200, {
              "Content-Type"        : "application/pdf",
            });
            fs.createReadStream(path.resolve('./src/assets/build.pdf')).pipe(res);
          });
    }


    public static getMarksByClass(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let examId = req.params.examId || "";
        let standardId = req.params.standardId || "";
        let sectionId = req.params.sectionId || "";
        let subjectId = req.params.subjectId || "";
        let evalutionList = [];
        return Promise.then(() => {
            return ExamEvalutionUseCase.findByQuery((q) => {
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`, examId);
                q.where(`ex.${ExamTableSchema.FIELDS.STANDARD_ID}`, standardId);
                q.where(`ex.${ExamTableSchema.FIELDS.SECTION_ID}`, sectionId);
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                q.select(`${ExamEvalutionTableSchema.TABLE_NAME}.*`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME}`,
                    `ex.${ExamTableSchema.FIELDS.EXAM_ID} as examId`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_ID} as subjectId`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                    `et.${ExamTypeTableSchema.FIELDS.ID} as examTypeId`,
                    `et.${ExamTypeTableSchema.FIELDS.EXAM_TYPE} as examType`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,);
                    q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`);
                    q.innerJoin(`${ExamTableSchema.TABLE_NAME} as ex`, `ex.${ExamTableSchema.FIELDS.EXAM_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`);
                    q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`);
                    q.innerJoin(`${ExamTypeTableSchema.TABLE_NAME} as et`, `et.${ExamTypeTableSchema.FIELDS.ID}`,
                    `ex.${ExamTableSchema.FIELDS.EXAM_TYPE}`);
                    q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                    `ex.${ExamTableSchema.FIELDS.STANDARD_ID}`);
                    q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                    `ex.${ExamTableSchema.FIELDS.SECTION_ID}`); 
                    q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`ex.${ExamTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`su.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`et.${ExamTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then((object) => {
            if (object && 0 < object.models.length) {
                object.models.forEach((obj) => {
                    let examEvolutionData = ExamEvalutionModel.fromDto(obj);
                        examEvolutionData['userId'] = obj.get('user_id');
                        examEvolutionData['studentName'] = obj.get('firstname');
                        examEvolutionData['examId'] = obj.get('examId');
                        examEvolutionData['subjectId'] = obj.get('subjectId');
                        examEvolutionData['subjectName'] = obj.get('subjectName');
                        examEvolutionData['examTypeId'] = obj.get('examTypeId');
                        examEvolutionData['examType'] = obj.get('examType');
                        examEvolutionData['standardName'] = obj.get('standardName');
                        examEvolutionData['sectionName'] = obj.get('sectionName');
                        evalutionList.push(examEvolutionData);
                });
                res.json(evalutionList);
            } else {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_EXAM_NOT_FOUND,
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
    public static getWeakStudentMarksClass(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let standardId = req.params.standardId || "";
        let sectionId = req.params.sectionId || "";
        let subjectId = req.params.subjectId || "";
        let evalutionList = [];
        return Promise.then(() => {
            return ExamEvalutionUseCase.findByQuery((q) => {
                q.where(`ex.${ExamTableSchema.FIELDS.STANDARD_ID}`, standardId);
                q.where(`ex.${ExamTableSchema.FIELDS.SECTION_ID}`, sectionId);
                q.andWhereRaw(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.MARKS} < 50`);
                q.andWhereRaw(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.MARKS} > 0`);
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                q.select(`${ExamEvalutionTableSchema.TABLE_NAME}.*`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME}`,
                    `ex.${ExamTableSchema.FIELDS.EXAM_ID} as examId`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_ID} as subjectId`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                    `et.${ExamTypeTableSchema.FIELDS.ID} as examTypeId`,
                    `et.${ExamTypeTableSchema.FIELDS.EXAM_TYPE} as examType`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,);
                    q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`);
                    q.innerJoin(`${ExamTableSchema.TABLE_NAME} as ex`, `ex.${ExamTableSchema.FIELDS.EXAM_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`);
                    q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                    `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`);
                    q.innerJoin(`${ExamTypeTableSchema.TABLE_NAME} as et`, `et.${ExamTypeTableSchema.FIELDS.ID}`,
                    `ex.${ExamTableSchema.FIELDS.EXAM_TYPE}`);
                    q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                    `ex.${ExamTableSchema.FIELDS.STANDARD_ID}`);
                    q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                    `ex.${ExamTableSchema.FIELDS.SECTION_ID}`); 
                    q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`ex.${ExamTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`su.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`et.${ExamTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then((object) => {
            const ret = [];
            if (object && 0 < object.models.length) {
                const studentIds = {};
                        object.models.forEach((obj) => {
                            if (studentIds[obj.get('student_id')]) {
                                const studentObj = studentIds[obj.get('student_id')];
                                studentObj.examMarks.push({
                                    subjectName: obj.get('subjectName'),
                                    examTypeName: obj.get('examType'),
                                    examDate: obj.get('exam_date'),
                                    marks: obj.get('marks'),
                                });
                            }
                            else {
                                studentIds[obj.get('student_id')] = {
                                studentName: obj.get('firstname'),
                                studentId: obj.get('student_id'),
                                examMarks: [{
                                    subjectName: obj.get('subjectName'),
                                    examTypeName: obj.get('examType'),
                                    examDate: obj.get('exam_date'),
                                    marks: obj.get('marks')
                                }],
                            };
                            ret.push(studentIds[obj.get('student_id')]);
                        }
                    });
                    res.json(ret);
            } else {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_EXAM_NOT_FOUND,
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
    public static getStudentMarks(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let studentId = req.body.studentId || "";
        let subjectId = req.body.subjectId || "";

        return Promise.then(() => {
            return ExamEvalutionUseCase.findByQuery((q) => {
                q.select(`${ExamEvalutionTableSchema.TABLE_NAME}.*`,
                `ad.${AdminUserTableSchema.FIELDS.USER_ID} as studentId`,
                `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME}`,
                `su.${SubjectTableSchema.FIELDS.SUBJECT_ID} as subjectId`,
                `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                `ext.${ExamTypeTableSchema.FIELDS.EXAM_TYPE} as typeName`);
                q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`, studentId);
                q.whereRaw(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.MARKS} != 0`);
                if (subjectId) {
                    q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                }
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`);
                q.innerJoin(`${ExamTableSchema.TABLE_NAME} as et`, `et.${ExamTableSchema.FIELDS.EXAM_ID}`,
                `${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`);
                q.innerJoin(`${ExamTypeTableSchema.TABLE_NAME} as ext`, `et.${ExamTableSchema.FIELDS.EXAM_TYPE}`,
                `ext.${ExamTypeTableSchema.FIELDS.ID}`);
            })
        }).then((objects) => {
            const ret = []; 
            if (objects && objects.models.length) {
                    const studentIds = {};
                    objects.models.forEach((obj) => {
                            if (studentIds[obj.get('exam_id')] && studentIds[obj.get('exam_id')][obj.get('studentId')]) {
                                const studentObj = studentIds[obj.get('exam_id')][obj.get('studentId')].exams[0];
                                studentObj.subjects.push({
                                    subjectId: obj.get('subjectId'),
                                    subjectName: obj.get('subjectName'),
                                    marks: obj.get('marks')
                                });
                            }
                            else {
                                studentIds[obj.get('exam_id')] = {};
                                studentIds[obj.get('exam_id')][obj.get('studentId')] = {
                                firstName: obj.get('firstname'),
                                studentId: obj.get('studentId'),
                                exams: [{
                                    examId: obj.get('exam_id'),
                                    examName: obj.get('typeName'),
                                    subjects: [{
                                        subjectId: obj.get('subjectId'),
                                        subjectName: obj.get('subjectName'),
                                        marks: obj.get('marks'),
                                        examDate: obj.get('exam_date')
                                    }],
                                }],
                            };
                            ret.push(studentIds[obj.get('exam_id')][obj.get('studentId')]);
                        }
                    });
                    res.json(ret);
            } else {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_MARKS_NOT_FOUND,
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

    public static getExamList(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let studentId = req.params.studentId || "";
        let standardId;
        let sectionId;
        return Promise.then(() => {
            return ClassStudentsUseCase.findByQuery((q) => {

                q.select(`${ClassStudentsTableSchema.TABLE_NAME}.*`,
                `cl.${ClassTableSchema.FIELDS.STANDARD_ID} as standardId`,
                `cl.${ClassTableSchema.FIELDS.SECTION_ID} as sectionId`,);
                q.innerJoin(`${ClassTableSchema.TABLE_NAME} as cl`, `cl.${ClassTableSchema.FIELDS.CLASS_ID}`,
                `${ClassStudentsTableSchema.TABLE_NAME}.${ClassStudentsTableSchema.FIELDS.CLASS_ID}`);
                q.where(`${ClassStudentsTableSchema.TABLE_NAME}.${ClassStudentsTableSchema.FIELDS.USER_ID}`, studentId);
                q.limit(1);
            });
        }).then((objects) => {
            if (objects && objects.models.length) {
                standardId = objects.models[0].get('standardId');
                sectionId = objects.models[0].get('sectionId');
                return ExamUseCase.findByQuery((q) => {
                    q.select(`${ExamTableSchema.TABLE_NAME}.*`);
                    q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.SECTION_ID}`, sectionId);
                })
            } else {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_CLASS_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            }
        })
        .then((objects) => {
            const ret = [];
            if (objects && objects.models.length) {
                objects.models.forEach((obj) => {
                    let exam = ExamModel.fromDto(obj);
                    ret.push(exam);
                });
            }

            res.json(ret);
        })
        .catch(err => {
            Utils.responseError(res, err);
        });
    }

    public static uploadFile(req:express.Request, res:express.Response):any {
        let form = new formidable.IncomingForm();
        let exp = new RegExp("^pdf$")
        form.parse(req, (err:any, fields:formidable.Fields, files:formidable.Files) => {
            
            let avatar = files[Properties.FORM_FILE];
            if (avatar == null || avatar.path == null || avatar.name == null) {
                return res.json(new Exception(
                    ErrorCode.RESOURCE.INVALID_REQUEST,
                    MessageInfo.MI_FILE_UPLOAD_NOT_EMPTY,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }

            if (!exp.test(Utils.extractType(avatar.type))) {
                return res.json(new Exception(
                    ErrorCode.RESOURCE.INVALID_REQUEST,
                    MessageInfo.MI_UPLOAD_PDF,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }

            return Promise.then(() => {
                let ext = Utils.extractType(avatar.type);
                let name = UUID.v4();
                return Uploader.uploadExamPdf(avatar.path, `${name}.${ext}`);
            })
            .then(exportLink => {
                let data = {};
                data["link"] = exportLink.key;
                res.json(data);
            })
            .catch(error => {
                Utils.responseError(res, error);
            });
        });
}

public static viewExamPdf(req: express.Request, res: express.Response): any {
    let session: BearerObject = req[Properties.SESSION];
    
    const name = req.body.fileName;
    Uploader.getS3Object(name).createReadStream().on('error', err => {
        res.json({message: 'The specified key does not exist'});
    }).pipe(res);
}
}

export default ExamEvolutionHandler;
