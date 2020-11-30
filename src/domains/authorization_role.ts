
import {AuthorizationRoleDto} from "../data/models"; 
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {ErrorCode, MessageInfo, HttpStatus} from "../libs/constants";
import {Exception} from "../models";
import {AuthorizationRoleTableSchema,AdminUserTableSchema} from "../data/schemas";
import {Logger} from "../libs";


export class AuthorizationRoleUseCase extends BaseUseCase {
    
    constructor() {
        super();
        this.mysqlModel = AuthorizationRoleDto;
    }
    public verifyRole(userId:string, session):Promise<any> {
        if (userId == null) {
            return Promise.reject(new Error(MessageInfo.MI_INVALID_PARAMETER));
        }

        return Promise.then(() => {
            return this.findByQuery(q => {
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ar`, `ar.${AdminUserTableSchema.FIELDS.USER_ID}`,
                `${AuthorizationRoleTableSchema.TABLE_NAME}.${AuthorizationRoleTableSchema.FIELDS.USER_ID}`);
                q.where(`ar.${AdminUserTableSchema.FIELDS.USER_ID}`, userId);
                q.select(`${AuthorizationRoleTableSchema.TABLE_NAME}.*`);
                q.limit(1);
            }, []);
        })
                    .then(object => {
                        if (object != null && object.models != null && object.model.length != null && object.models.length === 1) {
                            session.roleId = String(object.models[0].get('role_id'));
                            return Promise.void;
                        } else {
                            let exception;
                            exception = new Exception(ErrorCode.ROLEAUTHENTICATION.NO_ROLE_ASSIGNED, MessageInfo.MI_NOT_PERMISSION_ACCESS, false);
                            exception.httpStatus = HttpStatus.UNAUTHORIZED;
                            return exception;
                        }
                    })
            .catch(err => {
                Logger.error(err.message, err);
                return false;
            })
            .enclose();
    }
}

export default new AuthorizationRoleUseCase();
