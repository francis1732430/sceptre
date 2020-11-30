/**
 *    on 22/05/18.
 */
import {AdminUserSessionDto} from "../data/models";
import {AdminUserSessionTableSchema} from "../data/schemas";
import {BearerObject, Logger} from "../libs";
import {ErrorCode, HttpStatus, Properties, MessageInfo} from "../libs/constants";
import {Utils} from "../libs/utils";
import {Exception, AdminUserSessionModel} from "../models";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";

export class AdminUserSessionUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = AdminUserSessionDto;
    }

    public destroyAllForId(accountId:string):Promise<any> {
        return Promise.then(() => {
            let data = {};
            data[AdminUserSessionTableSchema.FIELDS.STATUS] = 2;
            //noinspection TypeScriptUnresolvedFunction
            return AdminUserSessionDto.create(AdminUserSessionDto).query()
                .where(AdminUserSessionTableSchema.FIELDS.ACCOUNT_ID, accountId)
                .update(data);
        })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    public create(adminUserSession:AdminUserSessionModel):Promise<any> {
        return Promise.then(() => {
            return AdminUserSessionDto.create(AdminUserSessionDto, adminUserSession.toDto()).save();
        })
            .catch(err => {
                console.log("Eror..................", err);
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    public update(adminUserSession:AdminUserSessionModel):Promise<any> {
        return Promise.then(() => {
            return AdminUserSessionDto.create(AdminUserSessionDto, adminUserSession.toDto()).save();
        })
            .catch(err => {
                console.log("Eror..................");
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();

            
    }

    public updateStatus(id?: {}, data?: {}): Promise<any> {
        let data1 = {};
        data1[AdminUserSessionTableSchema.FIELDS.STATUS] = data.status;
        return AdminUserSessionDto.create(AdminUserSessionDto).query()
                .where(AdminUserSessionTableSchema.FIELDS.RID, id)
                .update(data1);
    }

    public disableToken(token:string):Promise<any> {
        if (token == null) {
            return Promise.reject(new Error(MessageInfo.MI_INVALID_PARAMETER));
        }
        return Promise.then(() => {
            return AdminUserSessionDto.create(AdminUserSessionDto).query(q => {
                q.where(AdminUserSessionTableSchema.FIELDS.SESSION_ID, token);
                q.limit(1);
            }).fetch();
        })
            .then(object => {
                if (object != null) {
                    let data = {};
                    data[AdminUserSessionTableSchema.FIELDS.STATUS] = 2;
                    return object.save(data, {patch: true});
                }

                let exception = new Exception(ErrorCode.AUTHENTICATION.NEED_ACCESS_CODE,
                    MessageInfo.MI_MISSING_ACCESS_CODE, false);
                exception.httpStatus = HttpStatus.UNAUTHORIZED;
                return Promise.reject(exception);
            })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    public enableToken(token:string):Promise<any> {
        if (token == null) {
            return Promise.reject(new Error(MessageInfo.MI_INVALID_PARAMETER));
        }
        return Promise.then(() => {
            return AdminUserSessionDto.create(AdminUserSessionDto).query(q => {
                q.where(AdminUserSessionTableSchema.FIELDS.SESSION_ID, token);
                q.limit(1);
            }).fetch();
        })
            .then(object => {
                if (object != null) {
                    let data = {};
                    data[AdminUserSessionTableSchema.FIELDS.STATUS] = 1;
                    return object.save(data, {patch: true});
                }

                let exception = new Exception(ErrorCode.AUTHENTICATION.NEED_ACCESS_CODE,
                    MessageInfo.MI_MISSING_ACCESS_CODE, false);
                exception.httpStatus = HttpStatus.UNAUTHORIZED;
                return Promise.reject(exception);
            })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    public verifyToken(token:BearerObject, val:string, url:string):Promise<any> {
        if (token == null) {
            return Promise.reject(new Error(MessageInfo.MI_INVALID_PARAMETER));
        }
        return Promise.then(() => {
            return AdminUserSessionDto.create(AdminUserSessionDto).query(q => {
                q.where(AdminUserSessionTableSchema.FIELDS.SESSION_ID, val);
                q.andWhere(AdminUserSessionTableSchema.FIELDS.USER_ID, token.userId);
                q.andWhere(AdminUserSessionTableSchema.FIELDS.STATUS, 1);
                q.limit(1);
            }).fetchAll();
        })
            .then(objects => {
                let exception;
                //noinspection TypeScriptUnresolvedVariable
                if (objects != null && objects.models != null && objects.models.length != null && objects.models.length === 1) {
                    //noinspection TypeScriptUnresolvedVariable
                    let status = objects.models[0].get(AdminUserSessionTableSchema.FIELDS.STATUS);
                    switch (status) {
                        case 0:
                            if (url.startsWith("/me/pin") || url.startsWith("/auth")) {
                                // If token was not active, those routes is still accessed;
                                return Promise.void;
                            } else {
                                if (token.role == Properties.ROLE.STUDENT) {
                                    exception = new Exception(ErrorCode.AUTHENTICATION.NEED_ACCESS_CODE, MessageInfo.MI_MISSING_ACCESS_CODE, false);
                                    exception.httpStatus = HttpStatus.UNAUTHORIZED;
                                    return exception;
                                } else {
                                    return Promise.void;
                                }
                            }
                        case 1:
                            return Promise.void;
                        default:
                            break;
                    }
                }

                exception = new Exception(ErrorCode.AUTHENTICATION.INVALID_TOKEN, MessageInfo.MI_INVALID_TOKEN, false);
                exception.httpStatus = HttpStatus.UNAUTHORIZED;
                return exception;
            })
            .catch(err => {
                Logger.error(err.message, err);
                return false;
            })
            .enclose();
    }

    public activeToken(token, pin):Promise<any> {
        return Promise.then(() => {
            return AdminUserSessionDto.create(AdminUserSessionDto).query(q => {
                q.where(AdminUserSessionTableSchema.FIELDS.SESSION_ID, token);
                q.limit(1);
            }).fetch();
        })
            .then(object => {
                if (object == null) {
                    let exception = new Exception(ErrorCode.AUTHENTICATION.INVALID_TOKEN, MessageInfo.MI_INVALID_TOKEN, false);
                    exception.httpStatus = HttpStatus.UNAUTHORIZED;
                    return Promise.reject(exception);
                }

                let code = object.get(AdminUserSessionTableSchema.FIELDS.PIN);
                if (code !== pin) {
                    let exception = new Exception(ErrorCode.AUTHENTICATION.INVALID_CODE, MessageInfo.MI_INVALID_ACCESS_CODE, false);
                    exception.httpStatus = HttpStatus.BAD_REQUEST;
                    return Promise.reject(exception);
                }

                let data = {};
                data[AdminUserSessionTableSchema.FIELDS.STATUS] = 1;
                return object.save(data, {patch: true});
            })
            .then(() => {
                return Promise.void;
            })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }
}

export default new AdminUserSessionUseCase();
