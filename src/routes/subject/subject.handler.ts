
import { SubjectUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, SubjectModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { SubjectTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";

export class SubjectHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let subject = SubjectModel.fromRequest(req);
        if (!Utils.requiredCheck(subject.subjectName)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return SubjectUseCase.create(subject);
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
            return SubjectUseCase.countByQuery(q => {
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            if(key == 'subjectId') {
                                condition = `(${SubjectTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'subjectName'){
                                condition = `(${SubjectTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'createdDate') {
                                condition = `(${SubjectTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'updatedDate') {
                                condition = `(${SubjectTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            }
                        }
                    }
                }  
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return SubjectUseCase.findByQuery(q => {
                    q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                    if (searchobj) {
                        for (let key in searchobj) {
                            if(searchobj[key]!=null && searchobj[key]!=''){
                                let searchval = searchobj[key];
                                let ColumnKey = Utils.changeSearchKey(key);
                                let condition;
                                if(key == 'subjectId') {
                                    condition = `(${SubjectTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'subjectName'){
                                    condition = `(${SubjectTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'createdDate') {
                                    condition = `(${SubjectTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'updatedDate') {
                                    condition = `(${SubjectTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                }
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
                            if (sortKey == 'subjectId') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'subjectName') {
                                q.orderBy(ColumnSortKey, sortValue);
                            }
                        } else {
                            q.orderBy(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                        }
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    object.models.forEach(obj => {
                        let subjectData = SubjectModel.fromDto(obj);
                        ret.push(subjectData);
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
        let rid = req.params.rid || "";
        let adminuser:any;
        return Promise.then(() => {
            return SubjectUseCase.findByQuery(q => {
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.RID}`, rid);
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
            }) 
        })
        .then((object) => {
            adminuser = object;
            if (adminuser && adminuser.models.length === 0) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_SUBJECT_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                let adminUseData = SubjectModel.fromDto(adminuser.models[0])
                res.json(adminUseData);
            }
        })
        .catch(err => {
            Utils.responseError(res, err);
        });
    }

    public static update(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let rid = req.params.rid || "";
        let subject = SubjectModel.fromRequest(req);
        if (!Utils.requiredCheck(subject.subjectName)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return SubjectUseCase.findById(rid);
        })
            .then(object => {
                if (object == null) {
                    Utils.responseError(res, new Exception(
                        ErrorCode.RESOURCE.NOT_FOUND,
                        MessageInfo.MI_SUBJECT_NOT_FOUND,
                        false, 
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                } else {
                    return SubjectUseCase.updateById(rid, subject);
                }
            })
            .then(object => {
                let userData = SubjectModel.fromDto(object);
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
            return SubjectUseCase.findByQuery(q => {
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.RID}`, rid);
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then(object => {
            if (object && object.models.length) {
                return SubjectUseCase.destroyById(rid);
            }
            Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
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

export default SubjectHandler;
