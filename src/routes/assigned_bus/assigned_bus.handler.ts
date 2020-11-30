
import { AssignedBusUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, AssignedBusModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { BusTrackingTableSchema, BusTableSchema, AssignedBusTableSchema, AdminUserTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";

export class BusTrackingHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let bus = AssignedBusModel.fromRequest(req);
        if (!Utils.requiredCheck(bus.busId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_BUS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(bus.driverId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return AssignedBusUseCase.create(bus);
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
            return AssignedBusUseCase.countByQuery(q => {
                q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.IS_ACTIVE}`, 1);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);

                q.innerJoin(`${BusTableSchema.TABLE_NAME} as bus`, `bus.${BusTableSchema.FIELDS.ID}`, `${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.BUS_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`, `${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.DRIVER_ID}`);
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            if(key == 'busId') {
                                condition = `(${BusTrackingTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'busName'){
                                condition = `(bus.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'driverId'){
                                condition = `(${AssignedBusTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'createdDate') {
                                condition = `(${BusTrackingTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            } else if(key == 'updatedDate') {
                                condition = `(${BusTrackingTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                q.andWhereRaw(condition);
                            }
                        }
                    }
                }  
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return AssignedBusUseCase.findByQuery(q => {
                    q.select(`${AssignedBusTableSchema.TABLE_NAME}.*`,
                    `bus.${BusTableSchema.FIELDS.BUS_NAME} as busName`,
                    `bus.${BusTableSchema.FIELDS.BUS_NAME} as busNumber`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID} as driverId`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as driverName`);

                q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.IS_ACTIVE}`, 1);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);

                q.innerJoin(`${BusTableSchema.TABLE_NAME} as bus`, `bus.${BusTableSchema.FIELDS.ID}`, `${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.BUS_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`, `${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.DRIVER_ID}`);
                    if (searchobj) {
                        for (let key in searchobj) {
                            if(searchobj[key]!=null && searchobj[key]!=''){
                                let searchval = searchobj[key];
                                let ColumnKey = Utils.changeSearchKey(key);
                                let condition;
                                if(key == 'busId') {
                                    condition = `(${BusTrackingTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'busName'){
                                    condition = `(bus.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'driverId'){
                                    condition = `(${AssignedBusTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'createdDate') {
                                    condition = `(${BusTrackingTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'updatedDate') {
                                    condition = `(${BusTrackingTableSchema.TABLE_NAME}.${ColumnKey} LIKE "%${searchval}%")`;
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
                            if (sortKey == 'busId') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'busName') {
                                q.orderBy(`bus.${ColumnSortKey}`, sortValue);
                            }
                        } else {
                            q.orderBy(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                        }
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    object.models.forEach(obj => {
                        let busData = AssignedBusModel.fromDto(obj);
                        busData['driverId'] = obj.get('driverId');
                        busData['driverName'] = obj.get('driverName');
                        busData['busName'] = obj.get('busName');
                        busData['busNumber'] = obj.get('busNumber');
                        ret.push(busData);
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
            return AssignedBusUseCase.findByQuery(q => {
                q.select(`${AssignedBusTableSchema.TABLE_NAME}.*`,
                    `bt.${BusTrackingTableSchema.FIELDS.LAT} as lat`,
                    `bt.${BusTrackingTableSchema.FIELDS.LANG} as lang`,
                    `bus.${BusTableSchema.FIELDS.BUS_NAME} as busName`,
                    `bus.${BusTableSchema.FIELDS.BUS_NAME} as busNumber`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID} as driverId`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as driverName`);

                q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.IS_ACTIVE}`, 1);
                q.where(`bt.${BusTrackingTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`bt.${BusTrackingTableSchema.FIELDS.IS_ACTIVE}`, 1);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);

                q.innerJoin(`${BusTableSchema.TABLE_NAME} as bus`, `bus.${BusTableSchema.FIELDS.ID}`, `${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.BUS_ID}`);
                q.innerJoin(`${BusTrackingTableSchema.TABLE_NAME} as bt`, `bus.${BusTableSchema.FIELDS.ID}`, `bt.${BusTrackingTableSchema.FIELDS.BUS_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`, `${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.DRIVER_ID}`);
            }) 
        })
        .then((object) => {
            adminuser = object;
            if (adminuser && adminuser.models.length === 0) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_BUS_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                let busData = AssignedBusModel.fromDto(adminuser.models[0]);
                 busData['driverId'] = adminuser.models[0].get('driverId');
                 busData['driverName'] = adminuser.models[0].get('driverName');
                 busData['lat'] = adminuser.models[0].get('lat');
                 busData['lang'] = adminuser.models[0].get('lang');
                 busData['busName'] = adminuser.models[0].get('busName');
                 busData['busNumber'] = adminuser.models[0].get('busNumber');
                res.json(busData);
            }
        })
        .catch(err => {
            console.log(err);
            Utils.responseError(res, err);
        });
    }

    public static update(req: express.Request, res: express.Response): any {
        let rid = req.params.rid || "";
        let bus = AssignedBusModel.fromRequest(req);
        if (!Utils.requiredCheck(bus.busId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_BUS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(bus.driverId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return AssignedBusUseCase.findById(rid);
        })
            .then(object => {
                if (object == null) {
                    Utils.responseError(res, new Exception(
                        ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                        MessageInfo.MI_BUS_NOT_FOUND,
                        false, 
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                } else {
                    return AssignedBusUseCase.updateById(rid, bus);
                }
            })
            .then(object => {
                let userData = AssignedBusModel.fromDto(object);
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
            return AssignedBusUseCase.findByQuery(q => {
                q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.RID}`, rid);
                q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then(object => {
            if (object && object.models.length) {
                return AssignedBusUseCase.destroyById(rid);
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

export default BusTrackingHandler;
