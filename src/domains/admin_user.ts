
import {AdminUserDto,AuthorizationRoleDto, ClassStudentsDto} from "../data/models";
import {AuthorizationRoleUseCase, ClassStudentsUseCase, ClassUseCase} from "../domains";
import {Utils} from "../libs/utils";
import {AdminUserModel, AuthorizationRoleModel, Exception} from "../models";
import {AdminUserTableSchema,AuthorizationRoleTableSchema, ClassTableSchema} from "../data/schemas";
import {Promise} from "thenfail";
import * as Bookshelf from "bookshelf";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";
import ClassStudentsModel from "../models/class_student";

export class AdminUserUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = AdminUserDto;
    }

    public create(user:AdminUserModel):Promise<any> {
        let userId;
        return Promise.then(() => {
            return this.findByQuery(q => {
                q.select(`${AdminUserTableSchema.TABLE_NAME}.*`, `ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`);
                q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`, user.createdBy);
                q.andWhereRaw(`ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID} != 4`);
                q.innerJoin(`${AuthorizationRoleTableSchema.TABLE_NAME} as ar`,
                `ar.${AuthorizationRoleTableSchema.FIELDS.USER_ID}`,
                `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`);
                q.limit(1);
            }, []);
        })
        .then(object => {
            if (object != null && object.models != null && object.models[0] != null) {
                if (user.roleId === '3') {
                    if (object.models[0].get('role_id') != 1
                    && object.models[0].get('role_id') != 2) {
                        return Promise.reject(new Exception(
                            ErrorCode.RESOURCE.USER_NOT_FOUND,
                            MessageInfo.MI_NOT_PERMISSION_ACCESS,
                            false,
                            HttpStatus.BAD_REQUEST
                        ));
                    }
                    return Promise.resolve(object);
                } else if(user.roleId === '1'
                || user.roleId === '2') {
                    return Promise.reject(new Exception(
                        ErrorCode.RESOURCE.USER_NOT_FOUND,
                        MessageInfo.MI_NOT_PERMISSION_ACCESS,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                } else {
                    return Promise.resolve(object);
                }
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null && object.models != null && object.models[0] != null) {
                return this.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.PHONE_NUMBER, user.phoneNumber);
                    q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                    q.limit(1);
                }, []);
            }

            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null && object.models != null && !object.models[0]) {
                return this.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.EMAIL, user.email);
                    q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                    q.limit(1);
                }, []);
            }

            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.INVALID_PHONE,
                MessageInfo.MI_PHONE_NUMBER_ALREADY_USE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null && object.models != null && object.models.length === 0) {
                return AdminUserDto.create(AdminUserDto, user.toDto()).save();
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.DUPLICATE_RESOURCE,
                MessageInfo.MI_EMAIL_WAS_BE_USED,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }).then((object) => {
            if (object) {
                return this.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.RID, object.get('rid'));
                    q.limit(1);
                });
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_CREATION_FAILED,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }).then((object) => {
            if (object && object.models.length) {
                const roles = {
                    body: {
                        roleId: user.roleId,
                        userId: object.models[0].get('user_id'),
                        permission: 1,
                    },
                }
                userId = object.models[0].get('user_id');
                const rolesObj = AuthorizationRoleModel.fromRequest(roles);
                return AuthorizationRoleDto.create(AuthorizationRoleDto, rolesObj.toDto()).save();
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }).then((object) => {
            if (object) {
                if (parseInt(user.roleId, 10) === 4) {
                    return ClassUseCase.findByQuery(q => {
                        q.where(ClassTableSchema.FIELDS.STANDARD_ID, user.standardId);
                        q.where(ClassTableSchema.FIELDS.SECTION_ID, user.sectionId);
                        q.where(ClassTableSchema.FIELDS.IS_DELETED, 0);
                        q.limit(1);
                    });          
                }
                return Promise.break;
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_USER_CREATION_FAILED,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        })
        .then((object) => {
            if (object && object.models.length) {
                const classStudents = {
                    body: {
                        classId: object.models[0].get('class_id'),
                        userId: userId,
                    },
                }
                const obj = ClassStudentsModel.fromRequest(classStudents);
                return ClassStudentsDto.create(ClassStudentsDto, obj.toDto()).save();

            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_CLASS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }

    public find(limit?:number, related?:string[]):Promise<any> {
        return Promise.then(() => {
            let sub = related != null ? related : [];
            return AdminUserDto.create(AdminUserDto).query(q => {
                if (limit != null) {
                    q.limit(limit);
                }
            }).fetchAll({withRelated: sub});
        })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    public updateById(id:string, user:AdminUserModel):Promise<any> {
        let adminuser:any;
        let userId: any;
        return Promise.then(() => {
            return this.findById(id);
        })
        .then(object => {
            if (object) {
                adminuser = object;
                return this.findByQuery(q => {
                    q.select(`${AdminUserTableSchema.TABLE_NAME}.*`, `ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`);
                    q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`, user.createdBy);
                    q.innerJoin(`${AuthorizationRoleTableSchema.TABLE_NAME} as ar`,
                    `ar.${AuthorizationRoleTableSchema.FIELDS.USER_ID}`,
                    `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`);
                    q.limit(1);
            }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null && object.models != null && object.models[0] != null) {
                if (user.roleId === '3') {
                    if (object.models[0].get('role_id') != 1
                    && object.models[0].get('role_id') != 2) {
                        return Promise.reject(new Exception(
                            ErrorCode.RESOURCE.USER_NOT_FOUND,
                            MessageInfo.MI_NOT_PERMISSION_ACCESS,
                            false,
                            HttpStatus.BAD_REQUEST
                        ));
                    }
                    return Promise.resolve(object);
                } else if(user.roleId === '1'
                || user.roleId === '2') {
                    return Promise.reject(new Exception(
                        ErrorCode.RESOURCE.USER_NOT_FOUND,
                        MessageInfo.MI_NOT_PERMISSION_ACCESS,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                } else {
                    return Promise.resolve(object);
                }
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            return this.findByQuery(q => {
                q.where(AdminUserTableSchema.FIELDS.PHONE_NUMBER, user.phoneNumber);
                q.whereNot(AdminUserTableSchema.FIELDS.RID, id);
                q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                q.limit(1);
            }, []);
        })
        .then(object => {
            if (object != null && object.models.length ==0 ) {
            return this.findByQuery(q => {
                q.where(AdminUserTableSchema.FIELDS.EMAIL, user.email);
                q.whereNot(AdminUserTableSchema.FIELDS.RID, id);
                q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                q.limit(1);
            }, []);
        }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.INVALID_PHONE,
                MessageInfo.MI_PHONE_NUMBER_NOT_VALID,
                false,
                HttpStatus.BAD_REQUEST
            )); 
        })
        .then(object => {
            if (object != null && object.models.length ==0 ) {
                    delete user.password;
                    let data = user.toDto();
                    return adminuser.save(data, {patch: true});
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.DUPLICATE_RESOURCE,
                MessageInfo.MI_EMAIL_WAS_BE_USED,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then((object) => {
            if (object) {
                return this.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.RID, object.get('rid'));
                    q.limit(1);
                });
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_CREATION_FAILED,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }).then((object) => {
            if (object && object.models.length) {
                return AuthorizationRoleUseCase.findByUserId(object.models[0].get('user_id'));
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }).then((object) => {
            if (object) {
                const roles = {
                    body: {
                        roleId: user.roleId,
                        userId: object.get('user_id'),
                        permission: 1,
                    },
                }
                const rolesObj = AuthorizationRoleModel.fromRequest(roles);
                const userData = object;
                return userData.save(rolesObj.toDto(), {patch: true});
            }
        })
        .then((object) => {
            if (object) {
                if (parseInt(user.roleId, 10) === 4) {
                    return ClassUseCase.findByQuery(q => {
                        q.where(ClassTableSchema.FIELDS.STANDARD_ID, user.standardId);
                        q.where(ClassTableSchema.FIELDS.SECTION_ID, user.sectionId);
                        q.where(ClassTableSchema.FIELDS.IS_DELETED, 0);
                        q.limit(1);
                    });          
                }
                return Promise.break;
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_USER_CREATION_FAILED,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        }).then((object) => {
            if (object && object.models.length) {
                return ClassStudentsUseCase.findByUserId(object.models[0].get('class_id'));
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_CLASS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }).then((object) => {
            if (object) {
                const classStudents = {
                    body: {
                        classId: object.models[0].get('class_id'),
                        userId: userId,
                    },
                }
                const obj = ClassStudentsModel.fromRequest(classStudents);
                const userData = object;
                return userData.save(obj.toDto(), {patch: true});
            }
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }

    public updateByPid(id:string, user:AdminUserModel):Promise<any> {
        let userData:any;
        return Promise.then(() => {
            return this.findByQuery(q => {
                q.where(AdminUserTableSchema.FIELDS.USER_ID, id);
                q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                q.limit(1);
            }, []);
        })
        .then(object => {
            if(object.models[0]!=null) {
                userData = object.models[0];
                let data = user.toDto();   
                return this.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.EMAIL, data[AdminUserTableSchema.FIELDS.EMAIL]);
                    q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                    q.whereNot(AdminUserTableSchema.FIELDS.USER_ID, id);                    
                    q.limit(1);
                }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_OBJECT_ITEM_NOT_EXIST_OR_DELETED,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if(object.models[0]==null) {               
                let data = user.toDto();                
                let adminUserData = {};
                adminUserData[AdminUserTableSchema.FIELDS.FIRSTNAME] = data[AdminUserTableSchema.FIELDS.FIRSTNAME];
                adminUserData[AdminUserTableSchema.FIELDS.LASTNAME] = data[AdminUserTableSchema.FIELDS.LASTNAME];
                adminUserData[AdminUserTableSchema.FIELDS.EMAIL] = data[AdminUserTableSchema.FIELDS.EMAIL];
                adminUserData[AdminUserTableSchema.FIELDS.PHONE_NUMBER] = data[AdminUserTableSchema.FIELDS.PHONE_NUMBER];
                console.log("user Data ==================")
                return userData.save(adminUserData, {patch: true});
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.INVALID_EMAIL,
                MessageInfo.MI_EMAIL_WAS_BE_USED,
                false,
                HttpStatus.BAD_REQUEST
            )); 
                
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }

    public destroyById(rid:string,createdBy:number, roleId):any {
        let adminUser: any;
        return Promise.then(() => {
            return this.findById(rid);
        })
        .then(object => {
            if (object) {
                adminUser = object;
                return this.findByQuery(q => {
                    q.select(`${AdminUserTableSchema.TABLE_NAME}.*`, `ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`);
                    q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`, createdBy);
                    q.innerJoin(`${AuthorizationRoleTableSchema.TABLE_NAME} as ar`,
                    `ar.${AuthorizationRoleTableSchema.FIELDS.USER_ID}`,
                    `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`);
                    q.limit(1);
            }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null && object.models != null && object.models[0] != null) {
                if (roleId === 3) {
                    if (object.models[0].get('role_id') != 1
                    && object.models[0].get('role_id') != 2) {
                        return Promise.reject(new Exception(
                            ErrorCode.RESOURCE.USER_NOT_FOUND,
                            MessageInfo.MI_NOT_PERMISSION_ACCESS,
                            false,
                            HttpStatus.BAD_REQUEST
                        ));
                    }
                    return Promise.resolve(object);
                } else if(roleId === 1
                || roleId === 2) {
                    return Promise.reject(new Exception(
                        ErrorCode.RESOURCE.USER_NOT_FOUND,
                        MessageInfo.MI_NOT_PERMISSION_ACCESS,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                } else {
                    return Promise.resolve(object);
                }
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object) {
                    let userData = {};
                    userData[AdminUserTableSchema.FIELDS.IS_DELETED] = 1;
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

    public updatePasswordById(id: string, oldPassword: string, newPassword: string): Promise<any> {
        let adminuser: Bookshelf.Model<any>;
        return Promise.then(() => {
                return this.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.USER_ID, id);
                    q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                    q.limit(1);
                }, []);
            })
            .then(object => {
                
                let adminuserData = AdminUserModel.fromDto(object.models[0]);
                adminuser = object.models[0];
                let hash = adminuserData.password;
                return Utils.compareHash(oldPassword, hash);
            })
            .then(object => {
                if (!object) {
                    return Promise.reject(new Exception(
                        ErrorCode.AUTHENTICATION.WRONG_USER_NAME_OR_PASSWORD,
                        MessageInfo.MI_INCORRECT_OLD_PASSWORD,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                }

                let data = {};
                data[AdminUserTableSchema.FIELDS.PASSWORD] = Utils.hashPassword(newPassword);
                return adminuser.save(data, {patch: true});
            })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    public resetPassword(id: string, newPassword: string): Promise<any> {
        let adminuser: Bookshelf.Model<any>;
        return Promise.then(() => {
                return this.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.USER_ID, id);
                    q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                    q.limit(1);
                }, []);
            })
            .then(object => {                
                adminuser = object.models[0];
                let data = {};
                data[AdminUserTableSchema.FIELDS.PASSWORD] = Utils.hashPassword(newPassword);
                return adminuser.save(data, {patch: true});
            })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    public createMerchant(user:AdminUserModel):Promise<any> {
        let roleInfo:any;
        return Promise.then(() => {
            return this.findByQuery(q => {
                q.where(AdminUserTableSchema.FIELDS.USER_ID, user.createdBy);
                q.limit(1);
            }, []);
        })
        .then(object => {
            if (object != null && object.models != null && object.models[0] != null) {
                return this.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.EMAIL, user.email);
                    q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                    q.limit(1);
                }, []);
            }

            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null && object.models.length == 0) {
                return AuthorizationRoleUseCase.findByQuery(q => {
                    q.where(AuthorizationRoleTableSchema.FIELDS.ROLE_ID, user.roleId);
                    q.where(AuthorizationRoleTableSchema.FIELDS.ROLE_TYPE, 'G');
                    q.limit(1);
                }, []);
            }

            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.INVALID_EMAIL,
                MessageInfo.MI_EMAIL_ALREADY_USE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null && object.models != null && object.models[0] != null) {
                roleInfo = AuthorizationRoleModel.fromDto(object.models[0]);
                user.approvalStatus = -1;
                user.status = 0;
                return AdminUserDto.create(AdminUserDto, user.toDto()).save();
            }
            return Promise.reject(new Exception(
                ErrorCode.ROLE.NO_ROLE_FOUND,
                MessageInfo.MI_ROLE_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null) {
                return this.findByQuery(q => {
                    q.where(AdminUserTableSchema.FIELDS.RID, object.id);
                    q.limit(1);
                }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.USER.CREATE_USER_FAILED,
                MessageInfo.MI_CREATE_USER_FAILED,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
           
            if (object != null && object.models != null && object.models[0] != null) {
                let userData = AdminUserModel.fromDto(object.models[0]);
                let authRole = new AuthorizationRoleModel();
                authRole.userId = userData.userId;
                authRole.roleType = 'U';
                authRole.createdBy = user.createdBy;
                authRole.parentId = user.roleId;
                authRole.roleName = roleInfo["roleName"];
                AuthorizationRoleDto.create(AuthorizationRoleDto, authRole.toDto()).save();
                let data = {};
                data["userId"] = userData.userId;
                data["rid"] = userData.rid;
                return  data;
            }
            return Promise.reject(new Exception(
                ErrorCode.USER.CREATE_USER_FAILED,
                MessageInfo.MI_CREATE_USER_FAILED,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateMerchant(user:AdminUserModel):Promise<any> {
        let userInfo:any;
        return Promise.then(() => {
            return this.findByQuery(q => {
                q.where(AdminUserTableSchema.FIELDS.USER_ID, user.createdBy);
                q.limit(1);
            }, []);
        })
        .then(object => {
            if (object != null && object.models != null && object.models[0] != null) {
                return this.findOne(q => {
                    q.where(AdminUserTableSchema.FIELDS.RID, user.rid)
                }, []);
            }

            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object=> {
            if (object != null) {  
                userInfo =   object;
                return this.findOne(q => {
                    q.where(AdminUserTableSchema.FIELDS.EMAIL, user.email);
                    q.whereNot(AdminUserTableSchema.FIELDS.RID, user.rid);
                    q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
                    q.limit(1);
                }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object == null) {               
                if(userInfo.get(AdminUserTableSchema.FIELDS.APPROVAL_STATUS)==-1 || userInfo.get(AdminUserTableSchema.FIELDS.APPROVAL_STATUS)==4) {
                    let data = user.toDto();

                    return userInfo.save(data, {patch: true});
                } else  {
                    return Promise.reject(new Exception(
                        ErrorCode.RESOURCE.INVALID_EMAIL,
                        MessageInfo.MI_MERCHANT_NOT_UPDATE,
                        false,
                        HttpStatus.BAD_REQUEST
                    )); 
                }
            
                
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.INVALID_EMAIL,
                MessageInfo.MI_EMAIL_WAS_BE_USED,
                false,
                HttpStatus.BAD_REQUEST
            )); 
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }

    public getMerchantRoleId():any {

           return "18";
    }

    public checkStoreId(rid: string):any {
        return this.findOne(q => {
            q.where(AdminUserTableSchema.FIELDS.RID, rid);
            q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
        }, []);
    }

    public getUserInfo(userId: any):any {
        return this.findOne(q => {
            q.where(AdminUserTableSchema.FIELDS.USER_ID, userId);
            q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
        }, []);
    }

    public getUserDetail(rid: string):any {
        return this.findOne(q => {
            q.where(AdminUserTableSchema.FIELDS.RID, rid);
            q.where(AdminUserTableSchema.FIELDS.IS_DELETED, 0);
        }, []);
    }

    public updateApprovalStatus(rid: string, status: number): any {
        return Promise.then(() => {
            return this.findById(rid);
        }).then(object => {
            if (object) {
                let userData = AdminUserModel.fromDto(object);
                let adminUser = {};
                adminUser[AdminUserTableSchema.FIELDS.APPROVAL_STATUS] = status;
                return object.save(adminUser, { patch: true });
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

export default new AdminUserUseCase();
