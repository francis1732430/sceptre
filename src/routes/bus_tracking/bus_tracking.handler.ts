
import { BusTrackingUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, BusTrackingModel} from "../../models";
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
        let bus = BusTrackingModel.fromRequest(req);
        if (!Utils.requiredCheck(bus.busId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_BUS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(bus.lat)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_LAT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(bus.lang)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_LANG_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return BusTrackingUseCase.create(bus);
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
            return BusTrackingUseCase.countByQuery(q => {
                q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.IS_ACTIVE}`, 1);
                q.innerJoin(`${BusTableSchema.TABLE_NAME} as bus`, `bus.${BusTableSchema.FIELDS.ID}`, `${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.BUS_ID}`);
                q.innerJoin(`${AssignedBusTableSchema.TABLE_NAME} as ab`, `bus.${BusTableSchema.FIELDS.ID}`, `ab.${AssignedBusTableSchema.FIELDS.BUS_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`, `ab.${AssignedBusTableSchema.FIELDS.DRIVER_ID}`);
                q.where(`bus.${BusTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
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
                return BusTrackingUseCase.findByQuery(q => {
                    q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.innerJoin(`${BusTableSchema.TABLE_NAME} as bus`, `bus.${BusTableSchema.FIELDS.ID}`, `${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.BUS_ID}`);
                    q.innerJoin(`${AssignedBusTableSchema.TABLE_NAME} as ab`, `bus.${BusTableSchema.FIELDS.ID}`, `ab.${AssignedBusTableSchema.FIELDS.BUS_ID}`);
                    q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`, `ab.${AssignedBusTableSchema.FIELDS.DRIVER_ID}`);
                    q.select(`${BusTrackingTableSchema.TABLE_NAME}.*`,
                    `bus.${BusTableSchema.FIELDS.BUS_NAME} as busName`,
                    `bus.${BusTableSchema.FIELDS.BUS_NUMBER} as busNumber`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as driverName`,);

                    q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.IS_ACTIVE}`, 1);
                    q.where(`bus.${BusTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
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
                            q.orderBy(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                        }
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    object.models.forEach(obj => {
                        let busData = BusTrackingModel.fromDto(obj);
                        busData['busName'] = obj.get('busName');
                        busData['busNumber'] = obj.get('busNumber');
                        busData['driverName'] = obj.get('driverName');
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
            return BusTrackingUseCase.findByQuery(q => {
                q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.RID}`, rid);
                    q.innerJoin(`${BusTableSchema.TABLE_NAME} as bus`, `bus.${BusTableSchema.FIELDS.ID}`, `${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.BUS_ID}`);
                    q.select(`${BusTrackingTableSchema.TABLE_NAME}.*`,
                    `bus.${BusTableSchema.FIELDS.BUS_NAME} as busName`,
                    `bus.${BusTableSchema.FIELDS.BUS_NUMBER} as busNumber`,);

                    q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.IS_ACTIVE}`, 1);
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
                let busData = BusTrackingModel.fromDto(adminuser.models[0]);
                busData['driverId'] = adminuser.models[0].get('driverId');
                busData['driverName'] = adminuser.models[0].get('driverName');
                busData['asssignedId'] = adminuser.models[0].get('asssignedId');
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
        let bus = BusTrackingModel.fromRequest(req);
        if (!Utils.requiredCheck(bus.busId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_BUS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(bus.lat)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_LAT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(bus.lang)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_LANG_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return BusTrackingUseCase.findById(rid);
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
                    return BusTrackingUseCase.updateById(rid, bus);
                }
            })
            .then(object => {
                let userData = BusTrackingModel.fromDto(object);
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
            return BusTrackingUseCase.findByQuery(q => {
                q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.RID}`, rid);
                q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then(object => {
            if (object && object.models.length) {
                return BusTrackingUseCase.destroyById(rid);
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
    public static getBusInfo(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let rid = req.params.busId || "";
        let adminuser:any;
        return Promise.then(() => {
            return BusTrackingUseCase.findByQuery(q => {
                q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.ID}`, rid);
                    q.innerJoin(`${BusTableSchema.TABLE_NAME} as bus`, `bus.${BusTableSchema.FIELDS.ID}`, `${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.BUS_ID}`);
                    q.innerJoin(`${AssignedBusTableSchema.TABLE_NAME} as abus`, `bus.${BusTableSchema.FIELDS.ID}`, `abus.${AssignedBusTableSchema.FIELDS.BUS_ID}`);
                    q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`, `abus.${AssignedBusTableSchema.FIELDS.DRIVER_ID}`);
                    q.select(`${BusTrackingTableSchema.TABLE_NAME}.*`,
                    `abus.${AssignedBusTableSchema.FIELDS.ID} as asssignedId`,
                    `abus.${AssignedBusTableSchema.FIELDS.DRIVER_ID} as driverId`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as driverName`,
                    `bus.${BusTableSchema.FIELDS.BUS_NAME} as busName`,
                    `bus.${BusTableSchema.FIELDS.BUS_NUMBER} as busNumber`,);
                    q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`abus.${AssignedBusTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`bus.${BusTableSchema.FIELDS.IS_DELETED}`, 0);

                    q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.IS_ACTIVE}`, 1);
                    q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.IS_ACTIVE}`, 1);
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
                let busData = BusTrackingModel.fromDto(adminuser.models[0]);
                busData['driverId'] = adminuser.models[0].get('driverId');
                busData['driverName'] = adminuser.models[0].get('driverName');
                busData['asssignedId'] = adminuser.models[0].get('asssignedId');
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

}

export default BusTrackingHandler;
