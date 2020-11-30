
import { HomeWorkUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, HomeWorkModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { HomeWorkTableSchema,
    StandardTableSchema,
    SectionTableSchema,
    SubjectTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";

export class HomeWorkHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let homeWork = HomeWorkModel.fromRequest(req);
        if (!Utils.requiredCheck(homeWork.homeWorkDate)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_HOME_WORK_DATE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(homeWork.submissionDate)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_HOME_WORK_SUBMISSION_DATE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(homeWork.standardId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(homeWork.sectionId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SECTION_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(homeWork.subjectId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (homeWork.homeWorkDate) {
            homeWork.homeWorkDate = Utils.getDateFormat(homeWork.homeWorkDate);
        }
        if (homeWork.submissionDate) {
            homeWork.submissionDate = Utils.getDateFormat(homeWork.submissionDate);
        }
        return Promise.then(() => {
            return HomeWorkUseCase.create(homeWork);
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
            return HomeWorkUseCase.countByQuery(q => {
                if (searchobj['standardId']) {
                q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.STANDARD_ID}`, searchobj['standardId']);
                }
                if (searchobj['sectionId']) {
                    q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.SECTION_ID}`, searchobj['sectionId']);
                }
                if (searchobj['subjectId']) {
                    q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.SUBJECT_ID}`, searchobj['subjectId']);
                }
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                `${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                `${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.SECTION_ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                `${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.SUBJECT_ID}`);
                q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`su.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''
                        && key !== 'standardId' && key !== 'sectionId' && key !== 'subjectId'){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            condition = `(st.${StandardTableSchema.FIELDS.STANDARD_NAME} LIKE "%${searchval}%" or
                                    sec.${SectionTableSchema.FIELDS.SECTION_NAME} LIKE "%${searchval}%" or
                                    su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} LIKE "%${searchval}%" or
                                    ${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.MARKS} LIKE "%${searchval}%" or
                                    ${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.HOME_WORK_DATE} LIKE "%${searchval}%" or
                                    ${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.SUBMISSION_DATE} LIKE "%${searchval}%")`
                                    q.andWhereRaw(condition)
                                }
                    }
                } 
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return HomeWorkUseCase.findByQuery(q => {
                    q.select(`${HomeWorkTableSchema.TABLE_NAME}.*`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`)
                    if (searchobj['standardId']) {
                        q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.STANDARD_ID}`, searchobj['standardId']);
                        }
                        if (searchobj['sectionId']) {
                            q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.SECTION_ID}`, searchobj['sectionId']);
                        }
                        if (searchobj['subjectId']) {
                            q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.SUBJECT_ID}`, searchobj['subjectId']);
                        }
                        q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                        `${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.STANDARD_ID}`);
                        q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                        `${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.SECTION_ID}`);
                        q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                        `${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.SUBJECT_ID}`);
                        q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`su.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                        if (searchobj) {
                            for (let key in searchobj) {
                                if(searchobj[key]!=null && searchobj[key]!=''
                                && key !== 'standardId' && key !== 'sectionId' && key !== 'subjectId'){
                                    let  searchval = searchobj[key];
                                    let ColumnKey = Utils.changeSearchKey(key);
                                    let condition;
                                    condition = `(st.${StandardTableSchema.FIELDS.STANDARD_NAME} LIKE "%${searchval}%" or
                                    sec.${SectionTableSchema.FIELDS.SECTION_NAME} LIKE "%${searchval}%" or
                                    su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} LIKE "%${searchval}%" or
                                    ${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.MARKS} LIKE "%${searchval}%" or
                                    ${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.HOME_WORK_DATE} LIKE "%${searchval}%" or
                                    ${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.SUBMISSION_DATE} LIKE "%${searchval}%")`
                                    q.andWhereRaw(condition)
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
                            } else if (sortKey == 'subjectName') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'marks') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'homeWorkDate') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'submissionDate') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'evalutionDate') {
                                q.orderBy(ColumnSortKey, sortValue);
                            }
                        } else {
                            q.orderBy(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                        }
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    object.models.forEach(obj => {
                        let homeWorkData = HomeWorkModel.fromDto(obj);
                        homeWorkData['standardName'] = obj.get('standardName');
                        homeWorkData['sectionName'] = obj.get('sectionName');
                        homeWorkData['subjectName'] = obj.get('subjectName');
                        ret.push(homeWorkData);
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
            return HomeWorkUseCase.findByQuery(q => {
                q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.RID}`, rid);
                q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.IS_DELETED}`, 0);
                q.select(`${HomeWorkTableSchema.TABLE_NAME}.*`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`);
                        q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                        `${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.STANDARD_ID}`);
                        q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                        `${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.SECTION_ID}`);
                        q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                        `${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.SUBJECT_ID}`);
                        q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`su.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                    });
        })
        .then((object) => {
            adminuser = object;
            if (adminuser && adminuser.models.length === 0) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_HOME_WORK_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                let adminUseData = HomeWorkModel.fromDto(adminuser.models[0]);
                adminUseData['standardName'] = adminuser.models[0].get('standardName');
                adminUseData['sectionName'] = adminuser.models[0].get('sectionName');
                adminUseData['subjectName'] = adminuser.models[0].get('subjectName');
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
        let homeWork = HomeWorkModel.fromRequest(req);
        if (!Utils.requiredCheck(homeWork.homeWorkDate)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_HOME_WORK_DATE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(homeWork.submissionDate)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_HOME_WORK_SUBMISSION_DATE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(homeWork.standardId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(homeWork.sectionId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SECTION_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(homeWork.subjectId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (homeWork.homeWorkDate) {
            homeWork.homeWorkDate = Utils.getDateFormat(homeWork.homeWorkDate);
        }
        if (homeWork.submissionDate) {
            homeWork.submissionDate = Utils.getDateFormat(homeWork.submissionDate);
        }
        return Promise.then(() => {
            return HomeWorkUseCase.findById(rid);
        })
            .then(object => {
                if (object == null) {
                    Utils.responseError(res, new Exception(
                        ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                        MessageInfo.MI_STANDARD_NOT_FOUND,
                        false, 
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                } else {
                    return HomeWorkUseCase.updateById(rid, homeWork);
                }
            })
            .then(object => {
                let userData = HomeWorkModel.fromDto(object);
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
            return HomeWorkUseCase.findByQuery(q => {
                q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.RID}`, rid);
                q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then(object => {
            if (object && object.models.length) {
                return HomeWorkUseCase.destroyById(rid);
            }
            Utils.responseError(res, new Exception(
                ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                MessageInfo.MI_HOME_WORK_NOT_FOUND,
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

export default HomeWorkHandler;
