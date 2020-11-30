
import { StandardDto } from "../data/models";
import {Utils} from "../libs/utils";
import {StandardModel, Exception} from "../models";
import { StandardTableSchema } from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";

export class StandardUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = StandardDto;
    }

    public create(standard:StandardModel):Promise<any> {
        return Promise.then(() => {
            return this.findByQuery(q => {
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_NAME}`, standard.standardName);
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        })
        .then(object => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.void;
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_STANDARD_ALREADY_EXISTS,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(() => {
                return StandardDto.create(StandardDto, standard.toDto()).save();
        })
        .catch(err => {
            console.log('ejhd', err);
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateById(id:string, standard:StandardModel):Promise<any> {
        let adminuser:any;
        return Promise.then(() => {
            return this.findById(id);
        })
        .then(object => {
            if (object) {
                adminuser = object;
                return this.findByQuery(q => {
                    q.whereNot(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.RID}`, id);
                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_NAME}`, standard.standardName);
            }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null && object.models.length ==0 ) {
                    let data = standard.toDto();
                    return adminuser.save(data, {patch: true});
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.DUPLICATE_RESOURCE,
                MessageInfo.MI_STANDARD_ALREADY_EXISTS,
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
                    userData[StandardTableSchema.FIELDS.IS_DELETED] = 1;
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
}
export default new StandardUseCase();
