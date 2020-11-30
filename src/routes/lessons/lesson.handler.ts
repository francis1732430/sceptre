
import { LessonsUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, LessonsModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { LessonsTableSchema, StandardTableSchema, SubjectTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";

export class LessonsHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let lesson = LessonsModel.fromRequest(req);
        if (!Utils.requiredCheck(lesson.standardId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(lesson.subjectId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(req.body.lessons)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_LESSONS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return LessonsUseCase.create(lesson, req.body.lessons);
        })
        .then(object => {
            let data  ={};
            data["message"] = "Created successfully";
            res.json(data);
        })
        .catch(err => {
            console.log(err)
            Utils.responseError(res, err);
        });
    }

    public static list(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let offset = parseInt(req.query.offset) || null;
        let limit = parseInt(req.query.limit) || null;
        let standardId = parseInt(req.query.standardId) || null;
        let subjectId = parseInt(req.query.subjectId) || null;
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
            return LessonsUseCase.countByQuery(q => {
                q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`, `${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, `${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.SUBJECT_ID}`);
                if (standardId && subjectId) {
                    q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                }
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!='' && !standardId && !subjectId){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            condition = `(${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.LESSON_NAME} LIKE "%${searchval}%" or
                            ${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.STATUS} LIKE "%${searchval}%" or
                            ${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.CREATED_DATE} LIKE "%${searchval}%" or
                            ${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.UPDATED_DATE} LIKE "%${searchval}%" or
                            ${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.ID} LIKE "%${searchval}%")`
                            q.andWhereRaw(condition);
                        }
                    }
                }  
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return LessonsUseCase.findByQuery(q => {
                    q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.select(`${LessonsTableSchema.TABLE_NAME}.*`,
                    `${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,)
                    q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`, `${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, `${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.SUBJECT_ID}`);
                if (standardId && subjectId) {
                    q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                }
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!='' && !standardId && !subjectId){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            condition = `(${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.LESSON_NAME} LIKE "%${searchval}%" or
                            ${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.STATUS} LIKE "%${searchval}%" or
                            ${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.CREATED_DATE} LIKE "%${searchval}%" or
                            ${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.UPDATED_DATE} LIKE "%${searchval}%" or
                            ${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.ID} LIKE "%${searchval}%")`
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
                            if (sortKey == 'id') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'lessonName') {
                                q.orderBy(ColumnSortKey, sortValue);
                            }
                        } else {
                            q.orderBy(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                        }
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    const studentIds = {};
                        object.models.forEach((obj) => {
                            if (studentIds['st'+obj.get('standard_id')+'su'+obj.get('subject_id')]) {
                                const studentObj = studentIds['st'+obj.get('standard_id')+'su'+obj.get('subject_id')];
                                studentObj.lessons.push({
                                    id: obj.get('id'),
                                    rid: obj.get('rid'),
                                    createdDate: obj.get('createdDate'),
                                    updatedDate: obj.get('updatedDate'),
                                    status: obj.get('status'),
                                    lessonName: obj.get('lesson_name'),
                                });
                            }
                            else {
                                studentIds['st'+obj.get('standard_id')+'su'+obj.get('subject_id')] = {
                                subjectId: obj.get('subject_id'),
                                standardId: obj.get('standard_id'),
                                standardName: obj.get('standardName'),
                                subjectName: obj.get('subjectName'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                lessons: [{
                                    id: obj.get('id'),
                                    rid: obj.get('rid'),
                                    createdDate: obj.get('createdDate'),
                                    updatedDate: obj.get('updatedDate'),
                                    status: obj.get('status'),
                                    lessonName: obj.get('lesson_name'),
                                }],
                            };
                            ret.push(studentIds['st'+obj.get('standard_id')+'su'+obj.get('subject_id')]);
                        }
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
            return LessonsUseCase.findByQuery(q => {
                q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.RID}`, rid);
                q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
            }) 
        })
        .then((object) => {
            adminuser = object;
            if (adminuser && adminuser.models.length === 0) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_LESSON_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                let adminUseData = LessonsModel.fromDto(adminuser.models[0])
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
        let lesson = LessonsModel.fromRequest(req);
        if (!Utils.requiredCheck(lesson.standardId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(lesson.subjectId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(req.body.lessons)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_LESSONS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return LessonsUseCase.updateById(lesson, req.body.lessons);
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

    public static destroy(req: express.Request, res: express.Response): any {
        let rid = req.params.rid || "";
        return Promise.then(() => {
            return LessonsUseCase.findByQuery(q => {
                q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.RID}`, rid);
                q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then(object => {
            if (object && object.models.length) {
                return LessonsUseCase.destroyById(rid);
            }
            Utils.responseError(res, new Exception(
                ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
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

export default LessonsHandler;
