
import {RoleUseCase} from "../../domains"; 
import {ErrorCode, HttpStatus, MessageInfo, Properties,DATE_FORMAT} from "../../libs/constants";
import {Utils} from "../../libs/utils";
import {RolesTableSchema} from "../../data/schemas";
import {Exception, RoleModel} from "../../models";
import * as express from "express";
import {Promise} from "thenfail";
import * as formidable from "formidable";
import {BaseHandler} from "../base.handler";
import {BearerObject} from "../../libs/jwt";
let fs = require('fs'); 
import {Uploader} from "../../libs";
var dateFormat = require('dateformat');

export class RoleHandler extends BaseHandler {
    constructor() {
        super();
    }
    public static create(req:express.Request, res:express.Response):any {
        let session:BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let role = RoleModel.fromRequest(req);
        if (role == null || role.roleName == null) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.GENERIC,
                MessageInfo.MI_ROLE_NAME_NOT_EMPTY,
                false, HttpStatus.BAD_REQUEST
            ));
        }

        return Promise.then(() => {
            return RoleUseCase.findOne(q => {
                q.where(`${RolesTableSchema.TABLE_NAME}.${RolesTableSchema.FIELDS.ROLE_NAME}`, role.roleName);
                q.where(`${RolesTableSchema.TABLE_NAME}.${RolesTableSchema.FIELDS.IS_DELETED}`, 0);
            });
        }).then((object) => {
            if (!object) {
                return RoleUseCase.create(role);
            }
            Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.GENERIC,
                MessageInfo.MI_ROLE_NAME_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
            return Promise.break;
        }).then(object => {
            let data  = {};
            data["message"] = MessageInfo.MI_ROLE_ADDED;
            res.json(data);


        }).catch(err => {
            Utils.responseError(res, err);
        });
    }

    public static update(req:express.Request, res:express.Response):any {
        let session:BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let role = RoleModel.fromRequest(req);
        let rid = req.params.rid;
        if (role == null || role.roleName == null) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.GENERIC,
                MessageInfo.MI_ROLE_NAME_NOT_EMPTY,
                false, HttpStatus.BAD_REQUEST
            ));
        }

        return Promise.then(() => {
            return RoleUseCase.findOne((q) => {
                    q.where(`${RolesTableSchema.FIELDS.ROLE_NAME}`, role.roleName);
                    q.where(`${RolesTableSchema.FIELDS.IS_DELETED}`,0);

            }, []);
        }).then((object) => {
            if (object) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.DUPLICATE_RESOURCE,
                    MessageInfo.MI_ROLE_NAME_EXIST,
                    false, 
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                return RoleUseCase.updateById(rid, role);
            }
        }).then(object => {
            let data  = {};
            data["message"] = MessageInfo.MI_ROLE_UPDATED;
            res.json(data);


        }).catch(err => {
            Utils.responseError(res, err);
        });
        
    }


    public static view(req:express.Request, res:express.Response):any {
        let rid = req.params.rid;
        let role :any;
        
        return Promise.then(() => {
            return RoleUseCase.findByQuery(q => {
                q.where(`${RolesTableSchema.TABLE_NAME}.${RolesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${RolesTableSchema.TABLE_NAME}.${RolesTableSchema.FIELDS.RID}`, rid);
            });
        }).then((object) => {
            role = object;
            
            if (role == null) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_ROLE_NOT_EXIST,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                let roleData = RoleModel.fromDto(role.models[0], ["createdBy"])
                res.json(roleData);
            }
        })
        .catch(err => {
            Utils.responseError(res, err);
        });
    }

    
    public static list(req:express.Request, res:express.Response):any {
        let session:BearerObject = req[Properties.SESSION];
        let userId = session.userId;
        let role:any;
        let offset = parseInt(req.query.offset) || null;
        let limit = parseInt(req.query.limit) || null;
        let sortKey;
        let sortValue;
        let searchobj = [];
        let total = 0;
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
            return RoleUseCase.countByQuery(q => {
                q.where(RolesTableSchema.FIELDS.IS_DELETED, 0);
                if (session.roleId == '2') {
                    q.whereIn(`${RolesTableSchema.FIELDS.ROLE_ID}`, ['3', '4', '5', '6']);
                } else if (session.roleId === '3') {
                    q.whereIn(`${RolesTableSchema.FIELDS.ROLE_ID}`, ['4']);
                }
                let condition;
                if (searchobj) {
                    for (let key in searchobj) { 
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);

                            if(key === "roleId"){
                                condition = `(${RolesTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key === "roleName"){
                                condition = `(${RolesTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key === "updatedDate") {
                                condition = `(${RolesTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key === "createdDate") {
                                condition = `(${RolesTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            }
                        }
                    }
                } 
                
            });
        })
        .then((totalObject) => {
            total = totalObject;
            return RoleUseCase.findByQuery(q => {
                q.where(RolesTableSchema.FIELDS.IS_DELETED, 0);
                if (session.roleId == '2') {
                    q.whereIn(`${RolesTableSchema.FIELDS.ROLE_ID}`, ['3', '4', '5', '6']);
                } else if (session.roleId === '3') {
                    q.whereIn(`${RolesTableSchema.FIELDS.ROLE_ID}`, ['4']);
                }
                let condition;
                if (searchobj) {
                    for (let key in searchobj) { 
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            if(key === "roleId"){
                                condition = `(${RolesTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key === "roleName"){
                                condition = `(${RolesTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key === "updatedDate") {
                                condition = `(${RolesTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key === "createdDate") {
                                condition = `(${RolesTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
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
                        if (sortKey === "roleId") {
                            q.orderBy(ColumnSortKey, sortValue);
                        } else if (sortKey === "roleName") {
                            q.orderBy(ColumnSortKey, sortValue);
                        } else if (sortKey === "updatedDate") {
                            q.orderBy(ColumnSortKey, sortValue);
                        } else if (sortKey === "createdDate") {
                            q.orderBy(ColumnSortKey, sortValue);
                        }
                    } else {
                        q.orderBy(`${RolesTableSchema.TABLE_NAME}.${RolesTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                    }
                }
            });
        })
        .then(objects => {
            if (objects != null && objects.models != null && objects.models.length != null) {
                let ret = [];
                objects.models.forEach(object => {
                    ret.push(RoleModel.fromDto(object));
                });
                res.header(Properties.HEADER_TOTAL, total.toString(10));

                if (offset != null) {
                    res.header(Properties.HEADER_OFFSET, offset.toString(10));
                }
                if (limit != null) {
                    res.header(Properties.HEADER_LIMIT, limit.toString(10));
                }
    
                res.json(ret);
                
            }
            let exception;
            exception = new Exception(ErrorCode.ROLE.NO_ROLE_FOUND, MessageInfo.MI_NO_ROLE_FOUND, false);
            exception.httpStatus = HttpStatus.BAD_REQUEST;
            return exception;
        })
        .catch(err => {
            Utils.responseError(res, err);
        })
        .enclose();
    }

    public static destroy(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let createdBy = parseInt(session.userId);
        let rid = req.params.rid || "";
        return Promise.then(() => {
            return RoleUseCase.destroyById(rid);
        })
        .then(() => {
            res.status(HttpStatus.NO_CONTENT);
            res.json({});
        })
        .catch(err => {
            Utils.responseError(res, err);
        });
    }

}

export default RoleHandler;
