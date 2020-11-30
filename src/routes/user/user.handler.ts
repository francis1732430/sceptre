
import {AdminUserUseCase} from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, AdminUserModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { AdminUserTableSchema,AuthorizationRoleTableSchema, RolesTableSchema, ClassStudentsTableSchema, StandardTableSchema, ClassTableSchema, SectionTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";
import * as formidable from "formidable";
import {Uploader} from "../../libs";
import * as UUID from "node-uuid";

export class UserHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let user = AdminUserModel.fromRequest(req);
        let status = req.body.status;
        if (!Utils.requiredCheck(user.email)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EMAIL_NOT_EMPTY,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.validateEmail(user.email)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.INVALID_PHONE,
                MessageInfo.MI_EMAIL_NOT_EMPTY,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(user.phoneNumber)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.INVALID_PHONE,
                MessageInfo.MI_PHONE_NUMBER_NOT_EMPTY,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.validatePhoneNumber(user.phoneNumber)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.INVALID_PHONE,
                MessageInfo.MI_PHONE_NUMBER_NOT_VALID,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(user.password)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_PASSWORD_NOT_EMPTY,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        user.password =  Utils.hashPassword(user.password);
        if (!Utils.requiredCheck(user.firstname)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.USER.FIRSTNAME_EMPTY,
                MessageInfo.MI_FIRSTNAME_NOT_EMPTY,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(user.createdBy)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.USER.CREATEDBY_EMPTY,
                MessageInfo.MI_CREATEDBY_NOT_EMPTY,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(user.roleId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.ROLE.NO_ROLE_FOUND,
                MessageInfo.MI_ROLE_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        if (user.dob) {
            user.dob = Utils.getDateFormat(user.dob);
        }
        return Promise.then(() => {
            return AdminUserUseCase.create(user);
        })
        .then(object => {
            let data  ={};
            data["message"] = MessageInfo.MI_USER_ADDED;
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
        let roleId = parseInt(req.query.roleId) || null;
        let standardId = parseInt(req.query.standardId) || null;
        let sectionId = parseInt(req.query.sectionId) || null;
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
            return AdminUserUseCase.countByQuery(q => {
                q.innerJoin(`${AuthorizationRoleTableSchema.TABLE_NAME} AS ar`, `ar.${AuthorizationRoleTableSchema.FIELDS.USER_ID}`, `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`)
                q.innerJoin(`${RolesTableSchema.TABLE_NAME} AS arg`, `arg.${RolesTableSchema.FIELDS.ROLE_ID}`, `ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`);
                let condition;
                if ((session.roleId == '2' || session.roleId == '1') && (roleId === 3 || roleId === 4 || roleId === 5 || roleId === 6)) {
                    q.where(`ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`, roleId);
                } else if ((session.roleId == '3' || session.roleId == '5') && (roleId === 4)) {
                    q.where(`ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`, roleId);
                } else {
                    q.where(`ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`, '');
                }
                if (roleId === 4) {
                    q.innerJoin(`${ClassStudentsTableSchema.TABLE_NAME} as cs`, `cs.${ClassStudentsTableSchema.FIELDS.USER_ID}`,
                    `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`);
                    q.innerJoin(`${ClassTableSchema.TABLE_NAME} as cl`, `cl.${ClassTableSchema.FIELDS.CLASS_ID}`,
                    `cs.${ClassStudentsTableSchema.FIELDS.CLASS_ID}`);
                    if (standardId) {
                        q.where(`cl.${ClassTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    }
                    if (sectionId) {
                        q.where(`cl.${ClassTableSchema.FIELDS.SECTION_ID}`, sectionId);
                    }
                    q.where(`cl.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`cs.${ClassStudentsTableSchema.FIELDS.IS_DELETED}`, 0);

                }
                condition = `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED} = 0 and ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID} != 1`;
                q.andWhereRaw(condition);
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''
                        && key !== 'roleId' && key !== 'standardId'
                        && key !== 'sectionId'){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            condition = `(arg.${RolesTableSchema.FIELDS.ROLE_NAME} LIKE "%${searchval}%" or
                            ${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.PHONE_NUMBER} LIKE "%${searchval}%" or
                            ${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.FIRSTNAME} LIKE "%${searchval}%" or
                            ${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.LASTNAME} LIKE "%${searchval}%" or
                            ${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.EMAIL} LIKE "%${searchval}%")`
                            q.andWhereRaw(condition);
                        }
                    }
                }  
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return AdminUserUseCase.findByQuery(q => {
                    q.select(`${AdminUserTableSchema.TABLE_NAME}.*`,
                    `arg.${RolesTableSchema.FIELDS.ROLE_NAME}`,
                    `ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`,
                    `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.FIRSTNAME} AS createdByFname`,
                    `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.LASTNAME}  AS createdByLname`);
                    q.innerJoin(`${AuthorizationRoleTableSchema.TABLE_NAME} AS ar`, `ar.${AuthorizationRoleTableSchema.FIELDS.USER_ID}`, `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`)
                    q.innerJoin(`${RolesTableSchema.TABLE_NAME} AS arg`, `arg.${RolesTableSchema.FIELDS.ROLE_ID}`, `ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`);
                    let condition;
                    if ((session.roleId == '2' || session.roleId == '1') && (roleId === 3 || roleId === 4 || roleId === 5 || roleId === 6)) {
                        q.where(`ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`, roleId);
                    } else if ((session.roleId == '3' || session.roleId == '5') && (roleId === 4)) {
                        q.where(`ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`, roleId);
                    } else {
                        q.where(`ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`, '');
                    }
                    if (roleId === 4) {
                        q.innerJoin(`${ClassStudentsTableSchema.TABLE_NAME} as cs`, `cs.${ClassStudentsTableSchema.FIELDS.USER_ID}`,
                    `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`);
                    q.innerJoin(`${ClassTableSchema.TABLE_NAME} as cl`, `cl.${ClassTableSchema.FIELDS.CLASS_ID}`,
                    `cs.${ClassStudentsTableSchema.FIELDS.CLASS_ID}`);
                    if (standardId) {
                        q.where(`cl.${ClassTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    }
                    if (sectionId) {
                        q.where(`cl.${ClassTableSchema.FIELDS.SECTION_ID}`, sectionId);
                    }
                    q.where(`cl.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`cs.${ClassStudentsTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.select(`cl.${ClassTableSchema.FIELDS.STANDARD_ID} as standardId`,
                    `cl.${ClassTableSchema.FIELDS.SECTION_ID} as sectionId`);
                    }
                    condition = `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED} = 0 and ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID} != 1`;
                    q.andWhereRaw(condition);
                                  
                    if (searchobj) {
                        for (let key in searchobj) {
                            if(searchobj[key]!=null && searchobj[key]!=''
                            && key !== 'roleId' && key !== 'standardId'
                            && key !== 'sectionId'){
                                let searchval = searchobj[key];
                                let ColumnKey = Utils.changeSearchKey(key);
                                condition = `(arg.${RolesTableSchema.FIELDS.ROLE_NAME} LIKE "%${searchval}%" or
                            ${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.PHONE_NUMBER} LIKE "%${searchval}%" or
                            ${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.FIRSTNAME} LIKE "%${searchval}%" or
                            ${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.LASTNAME} LIKE "%${searchval}%" or
                            ${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.EMAIL} LIKE "%${searchval}%")`
                            q.andWhereRaw(condition);
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
                            if (sortKey == 'roleName') {
                                q.orderBy(`arg.${RolesTableSchema.FIELDS.ROLE_NAME}`, sortValue);
                            } else if (sortKey == 'createdByName') {
                                q.orderBy(`user.${AdminUserTableSchema.FIELDS.FIRSTNAME}`, sortValue);
                                q.orderBy(`user.${AdminUserTableSchema.FIELDS.LASTNAME}`, sortValue);
                            } else if (sortKey == 'status') {
                                q.orderBy(`user.${AdminUserTableSchema.FIELDS.IS_ACTIVE}`, sortValue);
                            } else if (sortKey == 'firstName') {
                                q.orderBy('firstname', sortValue);
                            } else if (sortKey == 'lastName') {
                                q.orderBy('lastname', sortValue);
                            } else if (sortKey == 'email') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'phoneNumber') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'createdDate') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'updatedDate') {
                                q.orderBy(ColumnSortKey, sortValue);
                            }
                        } else {
                            q.orderBy(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                        }
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    object.models.forEach(obj => {
                        let adminUseData = AdminUserModel.fromDto(obj, ["createdBy","password"]);
                        adminUseData['createdByFname'] = obj.get('createdByFname');
                        adminUseData['createdByLname'] = obj.get('createdByLname');
                        if (roleId === 4) {
                            adminUseData['standardId'] = obj.get('standardId');
                            adminUseData['sectionId'] = obj.get('sectionId');
                        }
                        ret.push(adminUseData);
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
        let roleId = parseInt(req.params.roleId, 10);
        let adminuser:any;
        return Promise.then(() => {
            return AdminUserUseCase.findByQuery(q => {
                q.select(`${AdminUserTableSchema.TABLE_NAME}.*`,
                    `arg.${RolesTableSchema.FIELDS.ROLE_NAME}`,
                    `ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`,
                    `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.FIRSTNAME} AS createdByFname`,
                    `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.LASTNAME}  AS createdByLname`);
                    q.innerJoin(`${AuthorizationRoleTableSchema.TABLE_NAME} AS ar`, `ar.${AuthorizationRoleTableSchema.FIELDS.USER_ID}`, `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`)
                    q.innerJoin(`${RolesTableSchema.TABLE_NAME} AS arg`, `arg.${RolesTableSchema.FIELDS.ROLE_ID}`, `ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`);
                    let condition;
                    if ((session.roleId == '2' || session.roleId == '1') && (roleId === 3 || roleId === 4 || roleId === 5 || roleId === 6)) {
                        q.where(`ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`, roleId);
                    } else if ((session.roleId == '3' || session.roleId == '5') && (roleId === 3 || roleId === 4)) {
                        q.where(`ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`, roleId);
                    } else {
                        q.where(`ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`, 4);
                    }
                    if (roleId === 4) {
                        q.innerJoin(`${ClassStudentsTableSchema.TABLE_NAME} as cs`, `cs.${ClassStudentsTableSchema.FIELDS.USER_ID}`,
                    `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`);
                    q.innerJoin(`${ClassTableSchema.TABLE_NAME} as cl`, `cl.${ClassTableSchema.FIELDS.CLASS_ID}`,
                    `cs.${ClassStudentsTableSchema.FIELDS.CLASS_ID}`);
                    q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`,
                    `cl.${ClassTableSchema.FIELDS.STANDARD_ID}`);
                    q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`,
                    `cl.${ClassTableSchema.FIELDS.SECTION_ID}`);
                    q.where(`cl.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`cs.${ClassStudentsTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.select(`cl.${ClassTableSchema.FIELDS.STANDARD_ID} as standardId`,
                    `cl.${ClassTableSchema.FIELDS.SECTION_ID} as sectionId`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`);
                    }
                    condition = `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED} = 0 and ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID} != 1`;
                    q.andWhereRaw(condition);
                    condition = `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.RID}="${rid}"` ;
                   q.andWhereRaw(condition); 
            }) 
        })
        .then((object) => {
            adminuser = object;
            if (adminuser && adminuser.models.length === 0 ||
                (adminuser && adminuser.models.length
                    && adminuser.models[0].get('user_id') !== session.userId && session.roleId === '3')) {
                Utils.responseError(res, new Exception(
                    ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                    MessageInfo.MI_USER_NOT_EXIST,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                let adminUseData = AdminUserModel.fromDto(adminuser.models[0], ["password","createdBy"]);
                adminUseData['createdByFname'] = adminuser.models[0].get('createdByFname');
                adminUseData['createdByLname'] = adminuser.models[0].get('createdByLname');
                if (roleId === 4) {
                    adminUseData['standardName'] = adminuser.models[0].get('standardName');
                    adminUseData['sectionName'] = adminuser.models[0].get('sectionName');
                    adminUseData['standardId'] = adminuser.models[0].get('standardId');
                    adminUseData['sectionId'] = adminuser.models[0].get('sectionId');
                }
                res.json(adminUseData);
            }
        })
        .catch(err => {
            console.log(err);
            Utils.responseError(res, err);
        });
    }

    public static update(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let rid = req.params.rid || "";
        let user = AdminUserModel.fromRequest(req);
        user.createdBy = parseInt(session.userId);
        if (user.dob) {
            user.dob = Utils.getDateFormat(user.dob);
        }
        return Promise.then(() => {
            return AdminUserUseCase.findById(rid);
        })
            .then(object => {
                if (object == null) {
                    Utils.responseError(res, new Exception(
                        ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                        MessageInfo.MI_USER_NOT_EXIST,
                        false, 
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                } else {
                    return AdminUserUseCase.updateById(rid, user);
                }
            })
            .then(object => {
                let userData = {};
                userData["message"] = MessageInfo.MI_USER_UPDATED;
                res.json(userData);
            })
            .catch(err => {
                Utils.responseError(res, err);
            });
    }

    public static destroy(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let createdBy = parseInt(session.userId);
        let rid = req.params.rid || "";
        return Promise.then(() => {
            return AdminUserUseCase.findByQuery(q => {
                q.select(`ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`);
                q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.RID}`, rid);
                q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${AuthorizationRoleTableSchema.TABLE_NAME} as ar`, 
                `ar.${AuthorizationRoleTableSchema.FIELDS.USER_ID}`,
                `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`)
            })
        }).then(object => {
            if (object && object.models.length) {
                return AdminUserUseCase.destroyById(rid,createdBy, object.models[0].get('role_id'));
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
    public static uploadFile(req:express.Request, res:express.Response):any {
        let form = new formidable.IncomingForm();
        form.parse(req, (err:any, fields:formidable.Fields, files:formidable.Files) => {
            
            let avatar = files[Properties.FORM_FILE];
            if (avatar == null || avatar.path == null || avatar.name == null) {
                return res.json(new Exception(
                    ErrorCode.RESOURCE.INVALID_REQUEST,
                    MessageInfo.MI_FILE_UPLOAD_NOT_EMPTY,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            return Promise.then(() => {
                let ext = Utils.extractType(avatar.type);
                let name = UUID.v4();
                return Uploader.uploadFile(avatar.path, `${name}.${ext}`);
            })
            .then(exportLink => {
                let data = {};
                data["link"] = exportLink.key;
                data["location"] = exportLink.Location;
                res.json(data);
            })
            .catch(error => {
                Utils.responseError(res, error);
            });
        });
}
public static getuserList(req: express.Request, res: express.Response): any {
    let session: BearerObject = req[Properties.SESSION];
    let roleId = req.body.roleId || "";
    let adminuser:any;

    return Promise.then(() => {
        return AdminUserUseCase.findByQuery(q => {
            q.select(`${AdminUserTableSchema.TABLE_NAME}.*`,
                `arg.${RolesTableSchema.FIELDS.ROLE_NAME}`,
                `ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`)
                q.innerJoin(`${AuthorizationRoleTableSchema.TABLE_NAME} AS ar`, `ar.${AuthorizationRoleTableSchema.FIELDS.USER_ID}`, `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`)
                q.innerJoin(`${RolesTableSchema.TABLE_NAME} AS arg`, `arg.${RolesTableSchema.FIELDS.ROLE_ID}`, `ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`);
                let condition;
                condition = `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED} = 0 and ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID} = ${roleId}`;
                q.andWhereRaw(condition);
        }) 
    })
    .then((object) => {
        adminuser = object;
        if (adminuser && adminuser.models.length === 0) {
            Utils.responseError(res, new Exception(
                ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
            return Promise.break;
        } else {
            let ret = [];
                if (object != null && object.models != null) {
                    object.models.forEach(obj => {
                        let adminUseData = AdminUserModel.fromDto(obj, ["password","createdBy"]);
                        ret.push(adminUseData);
                    });
                }
            
            res.json(ret);
        }
    })
    .catch(err => {
        console.log(err);
        Utils.responseError(res, err);
    });
}

public static getUserListCount(req: express.Request, res: express.Response): any {
    let session: BearerObject = req[Properties.SESSION];
    let roleId = req.body.roleId || "";

    return Promise.then(() => {
        return AdminUserUseCase.countByQuery(q => {
                q.innerJoin(`${AuthorizationRoleTableSchema.TABLE_NAME} AS ar`, `ar.${AuthorizationRoleTableSchema.FIELDS.USER_ID}`, `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`)
                q.innerJoin(`${RolesTableSchema.TABLE_NAME} AS arg`, `arg.${RolesTableSchema.FIELDS.ROLE_ID}`, `ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID}`);
                let condition;
                condition = `${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED} = 0 and ar.${AuthorizationRoleTableSchema.FIELDS.ROLE_ID} = ${roleId}`;
                q.andWhereRaw(condition);
        }) 
    })
    .then((object) => {
        res.json(object);
    })
    .catch(err => {
        Utils.responseError(res, err);
    });
}
}

export default UserHandler;
