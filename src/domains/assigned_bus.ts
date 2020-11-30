
import { BusAssignedDto } from "../data/models";
import {Utils} from "../libs/utils";
import {AssignedBusModel, Exception} from "../models";
import { AssignedBusTableSchema, BusTableSchema, AdminUserTableSchema } from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";
import { BusUseCase, AdminUserUseCase } from ".";

export class AssignedBusUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = BusAssignedDto;
    }

    public create(bus:AssignedBusModel):Promise<any> {
        return Promise.then(() => {
            return BusUseCase.findByQuery(q => {
                q.where(`${BusTableSchema.TABLE_NAME}.${BusTableSchema.FIELDS.ID}`, bus.busId);
                q.where(`${BusTableSchema.TABLE_NAME}.${BusTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        })
        .then(object => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_BUS_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            } else {
                return AdminUserUseCase.findByQuery(q => {
                    q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`, bus.driverId);
                    q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            }
            
        })
        .then(object => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_USER_NOT_EXIST,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            } else {
                return this.deleteIdIfExists(bus.busId, bus.driverId).then((object) => {
                    return Promise.void;
                });            }
            
        })
        .then(() => {
                return BusAssignedDto.create(BusAssignedDto, bus.toDto()).save();
        })
        .catch(err => {
            console.log('ejhd', err);
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateById(id:string, bus:AssignedBusModel):Promise<any> {
        let adminuser:any;
        return Promise.then(() => {
            return this.findById(id);
        })
        .then((object) => {
            if (object) {
                adminuser = object;
                return BusUseCase.findByQuery(q => {
                    q.where(`${BusTableSchema.TABLE_NAME}.${BusTableSchema.FIELDS.ID}`, bus.busId);
                    q.where(`${BusTableSchema.TABLE_NAME}.${BusTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_BUS_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        })
        .then(object => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_BUS_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            } else {
                return AdminUserUseCase.findByQuery(q => {
                    q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`, bus.driverId);
                    q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            }
            
        })
        .then(object => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_USER_NOT_EXIST,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            } else {
                return this.deleteIdIfExists(bus.busId, bus.driverId).then((object) => {
                    return Promise.void;
                });    
            }
        })
        .then(() => {
            let data = bus.toDto();
            data['is_active'] = 1;
            return adminuser.save(data, {patch: true});
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public destroyById(rid:string):any {
        let adminUser: any;
        return Promise.then(() => {
            return this.findById(rid);
        })
        .then(object => {
            if (object) {
                    adminUser = object;
                    let userData = {};
                    userData[AssignedBusTableSchema.FIELDS.IS_DELETED] = 1;
                    return adminUser.save(userData, {patch: true});
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_OBJECT_ITEM_NOT_EXIST_OR_DELETED,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        }).catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        }).enclose();
    }

    private deleteIdIfExists(id, driverId): any {

        return new Promise((resolve) => {
            return Promise.then(() => {
                return this.findByQuery((q) => {
                    q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.BUS_ID}`, id);
                    q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.IS_ACTIVE}`, 1);
                });
            }).then((object) => {
                if (object && object.models && 0 < object.models.length) {
                    return this.updateByConditionComma(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.BUS_ID}`, `${AssignedBusTableSchema.FIELDS.IS_ACTIVE}`, id, 0);
                }
            })
            .then(() => {
                return this.findByQuery((q) => {
                    q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.DRIVER_ID}`, driverId);
                    q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.IS_ACTIVE}`, 1);
                });
            })
            .then((object) => {
                if (object && object.models && 0 < object.models.length) {
                    return this.updateByConditionComma(`${AssignedBusTableSchema.TABLE_NAME}.${AssignedBusTableSchema.FIELDS.DRIVER_ID}`, `${AssignedBusTableSchema.FIELDS.IS_ACTIVE}`, driverId, 0);
                }
            })
            .then(() => {
                resolve(true);
            })
        });
    }
}
export default new AssignedBusUseCase();
