
import { RolesDto } from "../data/models"; 
import {Utils} from "../libs/utils";
import {RoleModel} from "../models";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {ErrorCode, MessageInfo, HttpStatus} from "../libs/constants";
import {Exception} from "../models/exception";
import {RolesTableSchema,AdminUserTableSchema} from "../data/schemas";


export class RoleUseCase extends BaseUseCase {
    
    constructor() {
        super();
        this.mysqlModel = RolesDto;
    }

    public create(role:RoleModel):Promise<any> {
        return Promise.then(() => {
                return RolesDto.create(RolesDto, role.toDto()).save();
            })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    public updateById(id:string,role:RoleModel):Promise<any> {
        return Promise.then(() => {
            return this.findById(id);
        })
            .then(object => {
                let userData = RoleModel.fromDto(object);
                if(userData) {
                    let data = role.toDto();
                    return object.save(data, {patch: true});
                }
                return Promise.reject(new Exception(
                    ErrorCode.USER.ROLEID_EMPTY,
                    MessageInfo.MI_NO_ROLE_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                )); 
            })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    public updateUserRole(roleId:number, userId:number):Promise<any> {
        let roleInfo :any;
        return Promise.then(() => {
            return this.findOne(q => {
                q.where(RolesTableSchema.FIELDS.ROLE_ID,roleId);
            });
        })
            .then(object => {
                if (object == null) {
                    let exception = new Exception(
                        ErrorCode.RESOURCE.DUPLICATE_RESOURCE,
                        MessageInfo.MI_OBJECT_ITEM_EXISTED,
                        false,
                        HttpStatus.BAD_REQUEST
                    );
                    return Promise.reject(exception);
                }
                let roleData = RoleModel.fromDto(object);
                let data = roleData.toDto();
               
                return object.save(data, {patch: true});
            })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    public destroyById(rid:string):any {
        let userData:any;
        return Promise.then(() => {
            return this.findById(rid);
        }).then(object => {
            if (object) {
                userData = RoleModel.fromDto(object);
                if(userData){
                    let adminUser = {};
                    adminUser[RolesTableSchema.FIELDS.IS_DELETED] = 1;
                    return object.save(adminUser, {patch: true});
                } else {
                    return Promise.reject(new Exception(
                        ErrorCode.USER.NOT_ALLOWED_TO_DELETE,
                        MessageInfo.MI_NOT_ALLOWED_TO_DELETE,
                        false,
                        HttpStatus.BAD_REQUEST
                    )); 
                }
                
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

export default new RoleUseCase();
