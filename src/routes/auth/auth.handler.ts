
import {AdminUserSessionUseCase, AdminUserUseCase} from "../../domains";
import {AdminUserTableSchema,AuthorizationRoleTableSchema, RolesTableSchema} from "../../data/schemas";
import {BearerObject, Jwt, Logger, Mailer} from "../../libs";
import {ErrorCode, HttpStatus, Properties, MessageInfo,WebUrl} from "../../libs/constants";
import {Utils} from "../../libs/utils";
import {Exception, AdminUserSessionModel} from "../../models";
import {Request, Response} from "express";
import {Promise} from "thenfail";
import {BaseHandler} from "../base.handler";
import {AdminUserModel} from "../../models/admin_user";


export class AuthHandler extends BaseHandler {
    
    constructor() {
        super();
    }
    public static logout(req:Request, res:Response):any {
        let session:BearerObject = req[Properties.SESSION];
        return Promise.then(() => {
            return AdminUserSessionUseCase.disableToken(session.token);
        })
            .then(() => {   
                res.message = MessageInfo.MI_LOGOUT;
                res.end();
            })
            .catch(err => {
                Utils.responseError(res, err);
            });
    }

    public static login(req:Request, res:Response):any {
        let emailorPhone = req.body.emailorPhone || "";
        let password = req.body.password || "";
        let deviceType = req.body.deviceType || "";
        if (!Utils.requiredCheck(emailorPhone)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EMAIL_OR_PHONE_NUMBER_REQUIRED,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.validatePhoneNumber(emailorPhone) && !Utils.validateEmail(emailorPhone)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.INVALID_PHONE,
                MessageInfo.MI_PHONE_NUMBER_NOT_VALID,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        

        let userId;
        let userInfo;
        let firstname;
        let lastname;
        let roleName;
        let imageUrl;
        let rid;
        let email;
        let roleId;
        let driverId;
        let accountantId;
        return Promise.then(() => {
           return AdminUserUseCase.findByQuery(q => {
                q.select(`${AdminUserTableSchema.TABLE_NAME}.*`,
                `ro.${RolesTableSchema.FIELDS.ROLE_NAME} as roleName`,
                `au.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID} as roleId`
                );
                q.innerJoin(`${AuthorizationRoleTableSchema.TABLE_NAME} as au`,
                `au.${AuthorizationRoleTableSchema.FIELDS.USER_ID}`,
                `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`);
                q.innerJoin(`${RolesTableSchema.TABLE_NAME} as ro`,
                `ro.${RolesTableSchema.FIELDS.ROLE_ID}`,
                `au.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`)
                q.where(AdminUserTableSchema.FIELDS.PHONE_NUMBER, emailorPhone);
                q.orWhere(AdminUserTableSchema.FIELDS.EMAIL, emailorPhone);
                q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ro.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
            
        })
            .then(object => {
                if (object != null && object.models != null && object.models[0] != null && object.models[0].relations != null) {
                    userInfo = AdminUserModel.fromDto(object.models[0]);
                    roleId = object.models[0].get('roleId');
                    if (roleId === 4 && deviceType != 'mobile') {
                        Utils.responseError(res, new Exception(
                            ErrorCode.AUTHENTICATION.NOT_ACTIVE,
                            MessageInfo.MI_ASSIGNED_ROLE_NOT_FOUND,
                            false,
                            HttpStatus.BAD_REQUEST
                        ));
                        return Promise.break;
                    }
                    if(object.models[0].get(AdminUserTableSchema.FIELDS.IS_ACTIVE)==1) {
                        if(object.models[0].get(AuthorizationRoleTableSchema.FIELDS.IS_DELETED)==0) {
                            userId = object.models[0].get(AdminUserTableSchema.FIELDS.USER_ID);
                            emailorPhone = object.models[0].get(AdminUserTableSchema.FIELDS.PHONE_NUMBER);
                            rid = object.models[0].get(AdminUserTableSchema.FIELDS.RID);
                            email = object.models[0].get(AdminUserTableSchema.FIELDS.EMAIL);
                            firstname = object.models[0].get(AdminUserTableSchema.FIELDS.FIRSTNAME);
                            lastname = object.models[0].get(AdminUserTableSchema.FIELDS.LASTNAME);
                            roleName = object.models[0].get('roleName');
                            imageUrl = object.models[0].get(AdminUserTableSchema.FIELDS.IMAGE_URL);
                            roleId = object.models[0].get('roleId');
                            if (roleId === 6) {
                                driverId = object.models[0].get(AdminUserTableSchema.FIELDS.USER_ID);
                            }
                            if (roleId === 5) {
                                accountantId = object.models[0].get(AdminUserTableSchema.FIELDS.USER_ID);
                            }
                            let hash = object.models[0].get(AdminUserTableSchema.FIELDS.PASSWORD);
                            return Utils.compareHash(password, hash);
                        } else {
                            Utils.responseError(res, new Exception(
                                ErrorCode.AUTHENTICATION.NOT_ACTIVE,
                                MessageInfo.MI_ASSIGNED_ROLE_NOT_FOUND,
                                false,
                                HttpStatus.BAD_REQUEST
                            ));
                            return Promise.break;
                        }

                    } else {
                        Utils.responseError(res, new Exception(
                            ErrorCode.AUTHENTICATION.NOT_ACTIVE,
                            MessageInfo.MI_USER_NOT_ACTIVE,
                            false,
                            HttpStatus.BAD_REQUEST
                        ));
                        return Promise.break;
                    }
                    
                } else {
                    Utils.responseError(res, new Exception(
                        ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                        MessageInfo.MI_USER_NOT_EXIST,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                }
            })
            .then(object => {
                if (object == null || !object) {
                    Utils.responseError(res, new Exception(
                        ErrorCode.AUTHENTICATION.WRONG_USER_NAME_OR_PASSWORD,
                        MessageInfo.MI_WRONG_USERNAME_OR_PASSWORD,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                }
                   let adminUserSession = new AdminUserSessionModel();
                    adminUserSession.userId = userId;
                    adminUserSession.status = 1;
                    adminUserSession.deviceId = '1';
                    adminUserSession.ip = '127.0.0.1';
                    adminUserSession.sessionId = Jwt.encode(adminUserSession, req.header(Properties.HEADER_DEVICE_ID));
                    return AdminUserSessionUseCase.create(adminUserSession);
            })
            .then(object => {
                let data = AdminUserSessionModel.fromDto(object);
                data.userInfo = {};
                data.userInfo.firstName = firstname; 
                data.userInfo.lastName = lastname;
                data.userInfo.phoneNumber = emailorPhone;
                data.userInfo.roleName = roleName;
                data.userInfo.imageUrl = imageUrl;
                data.userInfo.rid = rid;
                data.userInfo.email = email;
                if (driverId) {
                    data.userInfo.driverId = driverId;
                }
                if (accountantId) {
                    data.userInfo.accountantId = accountantId;
                }
                data.message = MessageInfo.MI_LOGIN;
                res.json(data);

                
            })
            .catch(err => {
                Utils.responseError(res, err);
            });
    }

    public static resetPassword(req:Request, res:Response):any {
        let session:BearerObject = req[Properties.SESSION];
        let newPassword = req.body.newPassword || "";
        let rpToken = req.params.rpToken || "";
        if (rpToken == null || rpToken === "") {
            return Utils.responseError(res, new Exception(
                ErrorCode.AUTHENTICATION.INVALID_TOKEN,
                MessageInfo.MI_TOKEN_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (newPassword === "") {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.INVALID_PASSWORD,
                MessageInfo.MI_NEW_PASSWORD_NOT_EMPTY,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        let user: any;
        let userId: string;
        return Promise.then(() => {
                return AdminUserUseCase.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.RP_TOKEN, rpToken);
                    q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                }, []);
            })
            .then(object => {
                if (object != null && object.models != null && object.models[0] != null) {
                    user = object.models[0];
                    userId = user.get(AdminUserTableSchema.FIELDS.USER_ID);
                    let current = Date.now();
                    let jwtObject = Jwt.decode(rpToken);
                    if (current < jwtObject.exp) {
                        return true;
                    } else {
                        Utils.responseError(res, new Exception(
                            ErrorCode.AUTHENTICATION.TOKEN_EXPIRE,
                            MessageInfo.MI_TOKEN_EXPIRED,
                            false,
                            HttpStatus.BAD_REQUEST
                        ));
                    }
                }

                Utils.responseError(res, new Exception(
                    ErrorCode.AUTHENTICATION.INVALID_TOKEN,
                    MessageInfo.MI_TOKEN_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            })
            .then(() => {
                AdminUserUseCase.resetPassword(userId, newPassword);
            })
            .then(() => {
                let data = {} ;
                data['message'] = MessageInfo.MI_PASSWORD_UPDATED;
                res.json(data);
            })
            .catch(err => {
                Utils.responseError(res, err);
            });
    }

    public static sendOtp(req:Request, res:Response):any {
        let phone = req.body.phoneNumber || "";
        if (phone == null || phone === "") {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_PHONE_NUMBER_NOT_EMPTY,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        let user: any;
        let userName: string;
        let userId: string;
        let otp:string;
        return Promise.then(() => {
                return AdminUserUseCase.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.PHONE_NUMBER, phone);
                    q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                }, []);
            })
            .then(object => {
                if (object != null && object.models != null && object.models[0] != null) {
                    user = object.models[0];
                    userId = user.get(AdminUserTableSchema.FIELDS.USER_ID);
                    userName = user.get(AdminUserTableSchema.FIELDS.FIRSTNAME);
                    otp = userId+Math.floor(Math.random() * (9999 - 1111 + 1)) + 1111;
                    return AdminUserUseCase.findByQuery(q => {
                        q.whereNot(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_RESET_PASSWORD}`, 1);
                        q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.PHONE_NUMBER}`, phone);
                    });
                }

                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_PHONE_NUMBER_NOT_EXIST,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            })
            .then(object => {              
                if (object && object.models != null && object.models[0] != null) {
                    const token = Jwt.encodeResetOtp(userId,otp,0);
                    let adminUserData = {};
                    adminUserData[AdminUserTableSchema.FIELDS.IS_RESET_PASSWORD] = 1;
                    adminUserData[AdminUserTableSchema.FIELDS.RP_TOKEN] = token;
                    user.save(adminUserData, {patch: true});
                    res.json({token: token, otp: otp, message: MessageInfo.MI_SEND_RESETPWD_TOKEN});
                } else {
                    Utils.responseError(res, new Exception(
                        ErrorCode.RESOURCE.USER_NOT_FOUND,
                        MessageInfo.MI_OTP_ALREADY_SEND,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                }
            })
            .catch(err => {
                Utils.responseError(res, err);
            });
    }

    public static resendOtp(req:Request, res:Response):any {

        let rpToken = req.params.rpToken || "";
        if (rpToken == null || rpToken === "") {
            return Utils.responseError(res, new Exception(
                ErrorCode.AUTHENTICATION.INVALID_TOKEN,
                MessageInfo.MI_TOKEN_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        let user: any;
        let userId:string;
        let otp:string;
        return Promise.then(() => {
                return AdminUserUseCase.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.RP_TOKEN, rpToken);
                    q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                }, []);
            })
            .then(object => {
                if (object != null && object.models != null && object.models[0] != null) {
                    user = object.models[0];
                    userId = user.get(AdminUserTableSchema.FIELDS.USER_ID);
                    let jwtObject = Jwt.decode(rpToken);
                    userId = jwtObject.userId;
                    otp = userId+Math.floor(Math.random() * (9999 - 1111 + 1)) + 1111;
                    return AdminUserUseCase.findByQuery(q => {
                        q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_RESET_PASSWORD}`, 1);
                        q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`, userId);
                    });
                    
                }

                Utils.responseError(res, new Exception(
                    ErrorCode.AUTHENTICATION.INVALID_TOKEN,
                    MessageInfo.MI_TOKEN_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            })
            .then(object => {
                if (object && object.models != null && object.models.length) {
                const token = Jwt.encodeResetOtp(userId,otp,0);
                let adminUserData = {};
                    adminUserData[AdminUserTableSchema.FIELDS.IS_RESET_PASSWORD] = 1;
                    adminUserData[AdminUserTableSchema.FIELDS.RP_TOKEN] = token;
                    user.save(adminUserData, {patch: true});

                res.json({token: token, otp: otp, message: MessageInfo.MI_SEND_RESETPWD_TOKEN});
                }
            })
            .catch(err => {
                Utils.responseError(res, err);
            });
    }

    public static verifyOtp(req:Request, res:Response):any {
        let rpToken = req.params.rpToken || "";
        if (rpToken == null || rpToken === "") {
            return Utils.responseError(res, new Exception(
                ErrorCode.AUTHENTICATION.INVALID_TOKEN,
                MessageInfo.MI_TOKEN_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        let otpText = req.body.otpText || "";
        if (otpText == null || otpText === "") {
            return Utils.responseError(res, new Exception(
                ErrorCode.AUTHENTICATION.INVALID_CODE,
                MessageInfo.MI_OTP_EMPTY,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        
        let user: any;
        let userId:string;
        return Promise.then(() => {
                return AdminUserUseCase.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.RP_TOKEN, rpToken);
                    q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                }, []);
            })
            .then(object => {
                if (object != null && object.models != null && object.models[0] != null) {
                    user = object.models[0];
                    userId = user.get(AdminUserTableSchema.FIELDS.USER_ID);
                    let jwtObject = Jwt.decode(rpToken);
                    let current = Date.now();
                    if(jwtObject.otp == otpText) {
                        if (current < jwtObject.exp) {
                            return Jwt.encodeResetOtp(userId,jwtObject.otp,1);
                            
                        } else {
                            Utils.responseError(res, new Exception(
                                ErrorCode.AUTHENTICATION.TOKEN_EXPIRE,
                                MessageInfo.MI_TOKEN_EXPIRED,
                                false,
                                HttpStatus.BAD_REQUEST
                            ));
                        }
                        
                    }
                    Utils.responseError(res, new Exception(
                        ErrorCode.AUTHENTICATION.INVALID_TOKEN,
                        MessageInfo.MI_INCORRECT_OTP,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                    
                }

                Utils.responseError(res, new Exception(
                    ErrorCode.AUTHENTICATION.INVALID_TOKEN,
                    MessageInfo.MI_TOKEN_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            })
            .then(token => {              
                let adminUserData = {};
                adminUserData[AdminUserTableSchema.FIELDS.RP_TOKEN] = token;
                user.save(adminUserData, {patch: true});

                let data = {} ;
                data['status'] = 1;
                data['token'] = token;
                res.json(data);
                // res.status(HttpStatus.NO_CONTENT);
                res.json(data);
            })
            .catch(err => {
                Utils.responseError(res, err);
            });
    }    
}

export default new AuthHandler();
