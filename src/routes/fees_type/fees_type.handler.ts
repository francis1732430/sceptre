
import { FeesTypeUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, FeesTypeModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { FeesTypeTableSchema, FeesTableSchema } from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";

export class SubjectHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let feesType = FeesTypeModel.fromRequest(req);
        if (!Utils.requiredCheck(feesType.feesTypeName)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_FEES_TYPE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return FeesTypeUseCase.create(feesType);
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
            return FeesTypeUseCase.countByQuery(q => {
                q.where(`${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            condition = `(${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.FEES_TYPE} LIKE "%${searchval}%" or
                            ${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.CREATED_DATE} LIKE "%${searchval}%" or
                            ${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.UPDATED_DATE} LIKE "%${searchval}%" or
                            ${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.ID} LIKE "%${searchval}%")`
                            q.andWhereRaw(condition);
                        }
                    }
                }  
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return FeesTypeUseCase.findByQuery(q => {
                    q.where(`${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                    if (searchobj) {
                        for (let key in searchobj) {
                            if(searchobj[key]!=null && searchobj[key]!=''){
                                let searchval = searchobj[key];
                                let ColumnKey = Utils.changeSearchKey(key);
                                let condition;
                            condition = `(${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.FEES_TYPE} LIKE "%${searchval}%" or
                            ${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.CREATED_DATE} LIKE "%${searchval}%" or
                            ${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.UPDATED_DATE} LIKE "%${searchval}%" or
                            ${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.ID} LIKE "%${searchval}%")`
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
                            } else if (sortKey == 'FeesTypeName') {
                                q.orderBy(ColumnSortKey, sortValue);
                            }
                        } else {
                            q.orderBy(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                        }
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    object.models.forEach(obj => {
                        let FeesTypeData = FeesTypeModel.fromDto(obj);
                        ret.push(FeesTypeData);
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
            return FeesTypeUseCase.findByQuery(q => {
                q.where(`${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.RID}`, rid);
                q.where(`${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
            }) 
        })
        .then((object) => {
            adminuser = object;
            if (adminuser && adminuser.models.length === 0) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_FEES_TYPE_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                let adminUseData = FeesTypeModel.fromDto(adminuser.models[0])
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
        let feesType = FeesTypeModel.fromRequest(req);
        if (!Utils.requiredCheck(feesType.feesTypeName)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_FEES_TYPE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return FeesTypeUseCase.findById(rid);
        })
            .then(object => {
                if (object == null) {
                    Utils.responseError(res, new Exception(
                        ErrorCode.RESOURCE.NOT_FOUND,
                        MessageInfo.MI_FEES_TYPE_NOT_FOUND,
                        false, 
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                } else {
                    return FeesTypeUseCase.updateById(rid, feesType);
                }
            })
            .then(object => {
                let userData = FeesTypeModel.fromDto(object);
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
            return FeesTypeUseCase.findByQuery(q => {
                q.where(`${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.RID}`, rid);
                q.where(`${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then(object => {
            if (object && object.models.length) {
                return FeesTypeUseCase.destroyById(rid);
            }
            Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_FEES_TYPE_NOT_FOUND,
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
