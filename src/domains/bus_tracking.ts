
import { BusTrackingDto } from "../data/models";
import {Utils} from "../libs/utils";
import {BusTrackingModel, Exception} from "../models";
import { BusTrackingTableSchema, BusTableSchema } from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";
import { BusUseCase } from ".";

export class BusTrackingUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = BusTrackingDto;
    }

    public create(bus:BusTrackingModel):Promise<any> {
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
               return this.deleteIdIfExists(bus.busId).then((object) => {
                    return Promise.void;
                });
            }
            
        })
        .then(() => {
                return BusTrackingDto.create(BusTrackingDto, bus.toDto()).save();
        })
        .catch(err => {
            console.log('ejhd', err);
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateById(id:string, bus:BusTrackingModel):Promise<any> {
        let adminuser:any;
        return Promise.then(() => {
            return this.findById(id);
        })
        .then(object => {
            if (object) {
                adminuser = object;
                return BusUseCase.findByQuery(q => {
                    q.where(`${BusTableSchema.TABLE_NAME}.${BusTableSchema.FIELDS.ID}`, bus.busId);
                    q.where(`${BusTableSchema.TABLE_NAME}.${BusTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_BUS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null && 0 < object.models.length ) {
                    let data = bus.toDto();
                    return adminuser.save(data, {patch: true});
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.DUPLICATE_RESOURCE,
                MessageInfo.MI_BUS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
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
                    userData[BusTrackingTableSchema.FIELDS.IS_DELETED] = 1;
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

    private deleteIdIfExists(id): any {

        return new Promise((resolve) => {
            return Promise.then(() => {
                return this.findByQuery((q) => {
                    q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.BUS_ID}`, id);
                    q.where(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.IS_DELETED}`, 0);
                });
            }).then((object) => {
                if (object && object.models && 0 < object.models.length) {
                    return this.updateByConditionComma(`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.BUS_ID}`,`${BusTrackingTableSchema.TABLE_NAME}.${BusTrackingTableSchema.FIELDS.IS_ACTIVE}`, id, 0);
                }
            }).then(() => {
                resolve(true);
            })
        });
    }

}
export default new BusTrackingUseCase();
