
import { SectionUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, SectionModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { SectionTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";

export class SectionHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let section = SectionModel.fromRequest(req);
        if (!Utils.requiredCheck(section.sectionName)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_SECTION_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return SectionUseCase.create(section);
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
            return SectionUseCase.countByQuery(q => {
                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            if(key == 'sectionId') {
                                condition = `(${SectionTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'sectionName'){
                                condition = `(${SectionTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'createdDate') {
                                condition = `(${SectionTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'updatedDate') {
                                condition = `(${SectionTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            }
                        }
                    }
                }  
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return SectionUseCase.findByQuery(q => {
                    q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                    if (searchobj) {
                        for (let key in searchobj) {
                            if(searchobj[key]!=null && searchobj[key]!=''){
                                let searchval = searchobj[key];
                                let ColumnKey = Utils.changeSearchKey(key);
                                let condition;
                                if(key == 'sectionId') {
                                    condition = `(${SectionTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'sectionName'){
                                    condition = `(${SectionTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'createdDate') {
                                    condition = `(${SectionTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'updatedDate') {
                                    condition = `(${SectionTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
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
                            if (sortKey == 'sectionId') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'sectionName') {
                                q.orderBy(ColumnSortKey, sortValue);
                            }
                        } else {
                            q.orderBy(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                        }
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    object.models.forEach(obj => {
                        let sectionData = SectionModel.fromDto(obj);
                        ret.push(sectionData);
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
            return SectionUseCase.findByQuery(q => {
                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.RID}`, rid);
                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
            }) 
        })
        .then((object) => {
            adminuser = object;
            if (adminuser && adminuser.models.length === 0) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_SECTION_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                let adminUseData = SectionModel.fromDto(adminuser.models[0])
                res.json(adminUseData);
            }
        })
        .catch(err => {
            console.log(err);
            Utils.responseError(res, err);
        });
    }

    public static update(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let rid = req.params.rid || "";
        let section = SectionModel.fromRequest(req);
        if (!Utils.requiredCheck(section.sectionName)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_SECTION_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return SectionUseCase.findById(rid);
        })
            .then(object => {
                if (object == null) {
                    Utils.responseError(res, new Exception(
                        ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                        MessageInfo.MI_USER_NOT_EXIST,
                        false, 
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                } else {
                    return SectionUseCase.updateById(rid, section);
                }
            })
            .then(object => {
                let userData = SectionModel.fromDto(object);
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
            return SectionUseCase.findByQuery(q => {
                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.RID}`, rid);
                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then(object => {
            if (object && object.models.length) {
                return SectionUseCase.destroyById(rid);
            }
            Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_SECTION_NOT_FOUND,
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

export default SectionHandler;
