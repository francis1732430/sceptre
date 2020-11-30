
import { ExamUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, ExamModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { ExamTableSchema,
    StandardTableSchema,
    SectionTableSchema,
    SubjectTableSchema,
    ExamTypeTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";
import * as knex from "knex";

export class ExamHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let exam = ExamModel.fromRequest(req);
        if (!Utils.requiredCheck(exam.standardId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.sectionId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SECTION_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.examType)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EXAM_TYPE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.subjects)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.examStartDate)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EXAM_START_DATE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.examStartTime)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EXAM_START_TIME_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.totalMarks)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_TOTAL_MARKS_REQUIRED,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.examDate)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EXAM_DATE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (exam.examStartDate) {
            exam.examStartDate = Utils.getDateFormat(exam.examStartDate);
        }
        if (exam.examEndDate) {
            exam.examEndDate = Utils.getDateFormat(exam.examEndDate);
        }
        return Promise.then(() => {
            return ExamUseCase.create(exam);
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
            return ExamUseCase.countByQuery(q => {
                q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.IS_DELETED}`, 0);
                if (searchobj['standardId'] && searchobj['sectionId']) {
                q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.STANDARD_ID}`, searchobj['standardId']);
                q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.SECTION_ID}`, searchobj['sectionId']);
                }
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                `${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                `${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.SECTION_ID}`);
                q.innerJoin(`${ExamTypeTableSchema.TABLE_NAME} as et`, `et.${ExamTypeTableSchema.FIELDS.ID}`,
                `${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.EXAM_TYPE}`);
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`et.${ExamTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            condition = `(st.${StandardTableSchema.FIELDS.STANDARD_NAME} LIKE "%${searchval}%" or
                                    sec.${SectionTableSchema.FIELDS.SECTION_NAME} LIKE "%${searchval}%" or
                                    et.${ExamTypeTableSchema.FIELDS.EXAM_TYPE} LIKE "%${searchval}%" or
                                    ${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.TOTAL_MARK} LIKE "%${searchval}%" or
                                    ${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.EXAM_START_DATE} LIKE "%${searchval}%" or
                                    ${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.EXAM_END_DATE} LIKE "%${searchval}%")`
                                    q.andWhereRaw(condition);
                        }
                    }
                } 
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return ExamUseCase.findByQuery(q => {
                    q.select(`${ExamTableSchema.TABLE_NAME}.*`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                    `et.${ExamTypeTableSchema.FIELDS.ID} as examTypeId`,
                    `et.${ExamTypeTableSchema.FIELDS.EXAM_TYPE} as examType`,
                    knex.raw(`CONCAT(et.${ExamTypeTableSchema.FIELDS.EXAM_TYPE}, '-',
                    ${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.CREATED_DATE}) as examName`)
                    )
                    q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.IS_DELETED}`, 0);
                    if (searchobj['standardId'] && searchobj['sectionId']) {
                        q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.STANDARD_ID}`, searchobj['standardId']);
                        q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.SECTION_ID}`, searchobj['sectionId']);
                        }
                        q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                        `${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.STANDARD_ID}`);
                        q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                        `${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.SECTION_ID}`);
                        q.leftJoin(`${ExamTypeTableSchema.TABLE_NAME} as et`, `et.${ExamTypeTableSchema.FIELDS.ID}`,
                        `${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.EXAM_TYPE}`);
                        q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`et.${ExamTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                        if (searchobj['subjectId']) {
                            q.andWhereRaw(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.SUBJECTS} LIKE "%${searchobj['subjectId']}%"`);
                        }
                        if (searchobj) {
                            for (let key in searchobj) {
                                if(searchobj[key]!=null && searchobj[key]!=''
                                && key !=='standardId'
                                && key !=='sectionId'
                                && key !='subjectId'){
                                    let searchval = searchobj[key];
                                    let ColumnKey = Utils.changeSearchKey(key);
                                    let condition;
                                    condition = `(st.${StandardTableSchema.FIELDS.STANDARD_NAME} LIKE "%${searchval}%" or
                                    sec.${SectionTableSchema.FIELDS.SECTION_NAME} LIKE "%${searchval}%" or
                                    et.${ExamTypeTableSchema.FIELDS.EXAM_TYPE} LIKE "%${searchval}%" or
                                    ${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.TOTAL_MARK} LIKE "%${searchval}%" or
                                    ${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.EXAM_START_DATE} LIKE "%${searchval}%" or
                                    ${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.EXAM_END_DATE} LIKE "%${searchval}%")`
                                    q.andWhereRaw(condition);
                                }
                            }
                        } 

                    if (offset != null) {
                        q.offset(offset);
                    }
                    if (limit != null) {
                        q.limit(limit);
                    }
                    if (sortKey != null && sortValue != '') {
                        if (sortKey != null && (sortValue == 'ASC' || sortValue == 'DESC' || sortValue == 'asc' || sortValue == 'desc')) {
                            let ColumnSortKey = Utils.changeSearchKey(sortKey);
                            if (sortKey == 'sectionName') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'standardName') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'examType') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'totalMarks') {
                                q.orderBy(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.TOTAL_MARK}`, sortValue);
                            } else if (sortKey == 'examStartDate') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'examEndDate') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'examStartTime') {
                                q.orderBy(ColumnSortKey, sortValue);
                            }
                        } else {
                            q.orderBy(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                        }
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    object.models.forEach(obj => {
                        let examData = ExamModel.fromDto(obj);
                        examData['standardName'] = obj.get('standardName');
                        examData['sectionName'] = obj.get('sectionName');
                        examData['examType'] = obj.get('examType');
                        examData['examTypeId'] = obj.get('examTypeId');
                        examData['examName'] = obj.get('examName');
                        ret.push(examData);
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
 
    public static getById(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let rid = req.params.rid || "";
        let adminuser:any;
        return Promise.then(() => {
            return ExamUseCase.findByQuery(q => {
                q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.RID}`, rid);
                q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.IS_DELETED}`, 0);
                q.select(`${ExamTableSchema.TABLE_NAME}.*`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_NAME}`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_NAME}`,
                    `et.${ExamTypeTableSchema.FIELDS.ID} as examTypeId`,
                    `et.${ExamTypeTableSchema.FIELDS.EXAM_TYPE} as examType`)
                        q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                        `${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.STANDARD_ID}`);
                        q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                        `${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.SECTION_ID}`);
                        q.innerJoin(`${ExamTypeTableSchema.TABLE_NAME} as et`, `et.${ExamTypeTableSchema.FIELDS.ID}`,
                        `${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.EXAM_TYPE}`);
                        q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`et.${ExamTypeTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        })
        .then((object) => {
            adminuser = object;
            if (adminuser && adminuser.models.length === 0) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_EXAM_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                let adminUseData = ExamModel.fromDto(adminuser.models[0]);
                adminUseData['standardName'] = adminuser.models[0].get('standard_name');
                adminUseData['sectionName'] = adminuser.models[0].get('section_name');
                adminUseData['examTypeId'] = adminuser.models[0].get('examTypeId');
                adminUseData['examType'] = adminuser.models[0].get('examType');
                res.json(adminUseData);
            }
        })
        .catch(err => {
            console.log(err);
            Utils.responseError(res, err);
        });
    }

    public static update(req: express.Request, res: express.Response): any {
        let rid = req.params.rid || "";
        let exam = ExamModel.fromRequest(req);
        if (!Utils.requiredCheck(exam.standardId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.sectionId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SECTION_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.examType)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EXAM_TYPE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.subjects)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.examStartDate)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EXAM_START_DATE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.examStartTime)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EXAM_START_TIME_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(exam.examDate)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EXAM_DATE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (exam.examStartDate) {
            exam.examStartDate = Utils.getDateFormat(exam.examStartDate);
        }
        if (exam.examEndDate) {
            exam.examEndDate = Utils.getDateFormat(exam.examEndDate);
        }
        return Promise.then(() => {
            return ExamUseCase.findById(rid);
        })
            .then(object => {
                if (object == null) {
                    Utils.responseError(res, new Exception(
                        ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                        MessageInfo.MI_EXAM_NOT_FOUND,
                        false, 
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                } else {
                    return ExamUseCase.updateById(rid, exam);
                }
            })
            .then(object => {
                let userData = {}
                userData["message"] = "Updated successfully";
                res.json(userData);
            })
            .catch(err => {
                Utils.responseError(res, err);
            });
    }

    public static destroy(req: express.Request, res: express.Response): any {
        let rid = req.params.rid || "";
        return Promise.then(() => {
            return ExamUseCase.findByQuery(q => {
                q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.RID}`, rid);
                q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then(object => {
            if (object && object.models.length) {
                return ExamUseCase.destroyById(rid);
            }
            Utils.responseError(res, new Exception(
                ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                MessageInfo.MI_EXAM_NOT_FOUND,
                false, 
                HttpStatus.BAD_REQUEST
            ));
            return Promise.break;
        })
        .then(() => {
            res.status(HttpStatus.NO_CONTENT);
            res.json({});
        })
        .catch(err => {
            console.log(err)
            Utils.responseError(res, err);
        });
    }
}

export default ExamHandler;
