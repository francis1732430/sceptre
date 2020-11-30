
import {AdminUserTableSchema, RolesTableSchema, AuthorizationRoleTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class AdminUserModel extends BaseModel {
    public email:string;
    public userId:number;
    public firstname:string;
    public lastname:string;
    public createdBy:number;
    public phoneNumber:string;
    public password: string;
    public isDeleted: number;
    public roleId: string;
    public status:number;
    public roleName: string;
    public address: string;
    public dob: string;
    public expYear: number;
    public expMonth: number;
    public imageUrl: string;
    public standardId: string;
    public sectionId: string;

    public static fromRequest(req:Request):AdminUserModel {
        if (req != null && req.body) {
            let user = new AdminUserModel();
            user.rid = AdminUserModel.getString(req.body.rid);
            user.email = AdminUserModel.getString(req.body.email);
            user.firstname = AdminUserModel.getString(req.body.firstname);
            user.lastname = AdminUserModel.getString(req.body.lastname);
            user.createdBy = AdminUserModel.getNumber(req.body.createdBy);
            user.phoneNumber = AdminUserModel.getString(req.body.phoneNumber);
            user.roleId = AdminUserModel.getString(req.body.roleId);
            user.password = AdminUserModel.getString(req.body.password);
            user.userId = AdminUserModel.getNumber(req.body.userId);
            user.status = AdminUserModel.getNumber(req.body.status);
            user.address = AdminUserModel.getString(req.body.address);
            user.dob = AdminUserModel.getString(req.body.dob);
            user.expYear = AdminUserModel.getNumber(req.body.yearOfExperience);
            user.expMonth = AdminUserModel.getNumber(req.body.monthOfExperience);
            user.imageUrl = AdminUserModel.getString(req.body.imageUrl);
            user.standardId = AdminUserModel.getString(req.body.standardId);
            user.sectionId = AdminUserModel.getString(req.body.sectionId);
            return user;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):AdminUserModel {
        if (object != null) {
                let userId = object.get(AdminUserTableSchema.FIELDS.USER_ID);
                let rid = object.get(AdminUserTableSchema.FIELDS.RID);
                let createdDate = object.get(AdminUserTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(AdminUserTableSchema.FIELDS.UPDATED_DATE);
                let email = object.get(AdminUserTableSchema.FIELDS.EMAIL);
                let firstname = object.get(AdminUserTableSchema.FIELDS.FIRSTNAME);
                let lastname = object.get(AdminUserTableSchema.FIELDS.LASTNAME);
                let phoneNumber = object.get(AdminUserTableSchema.FIELDS.PHONE_NUMBER);
                let createdBy = object.get(AdminUserTableSchema.FIELDS.CREATED_BY);
                let password = object.get(AdminUserTableSchema.FIELDS.PASSWORD);
                let status = object.get(AdminUserTableSchema.FIELDS.IS_ACTIVE);
                let roleName = object.get(RolesTableSchema.FIELDS.ROLE_NAME);
                let roleId = object.get(AuthorizationRoleTableSchema.FIELDS.ROLE_ID);
                let address = object.get(AdminUserTableSchema.FIELDS.ADDRESS);
                let dob = object.get(AdminUserTableSchema.FIELDS.DOB);
                let expYear = object.get(AdminUserTableSchema.FIELDS.EXP_YEAR);
                let expMonth = object.get(AdminUserTableSchema.FIELDS.EXP_MONTH);
                let imageUrl = object.get(AdminUserTableSchema.FIELDS.IMAGE_URL);

                let ret = new AdminUserModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.email = email != null && email !== "" ? email : "";
                ret.firstname = firstname != null && firstname !== "" ? firstname : "";
                ret.lastname = lastname != null && lastname !== "" ? lastname : "";
                ret.userId = userId != null && userId !== "" ? userId : "";
                ret.phoneNumber = phoneNumber != null && phoneNumber !== "" ? phoneNumber : "";
                ret.rid = rid != null && rid !== "" ? rid : "";
                ret.createdBy = createdBy != null && createdBy !== "" ? createdBy : "";
                ret.status = status != null && status !== "" ? status : "";
                ret.roleName = roleName != null && roleName !== "" ? roleName : "";
                ret.roleId = roleId != null && roleId !== "" ? roleId : "";
                ret.address = address != null && address !== "" ? address : "";
                ret.dob = dob != null && dob !== "" ? dob : "";
                ret.expYear = expYear != null && expYear !== "" ? expYear : "";
                ret.expMonth = expMonth != null && expMonth !== "" ? expMonth : "";
                ret.imageUrl = imageUrl != null && imageUrl !== "" ? imageUrl : "";
                if (filters != null) {
                    filters.forEach(filter => {
                        ret[filter] = undefined;
                    });
                }
                return ret;
        }
        return null;
    }

    public toDto():any {
        let obj = {};
        obj[AdminUserTableSchema.FIELDS.USER_ID] = this.userId;
        obj[AdminUserTableSchema.FIELDS.EMAIL] = this.email;
        obj[AdminUserTableSchema.FIELDS.FIRSTNAME] = this.firstname;
        obj[AdminUserTableSchema.FIELDS.LASTNAME] = this.lastname;
        obj[AdminUserTableSchema.FIELDS.CREATED_BY] = this.createdBy;
        obj[AdminUserTableSchema.FIELDS.PHONE_NUMBER] = this.phoneNumber;
        obj[AdminUserTableSchema.FIELDS.PASSWORD] = this.password;
        obj[AdminUserTableSchema.FIELDS.IS_ACTIVE] = this.status;
        obj[AdminUserTableSchema.FIELDS.IS_DELETED] = 0;
        obj[AdminUserTableSchema.FIELDS.ADDRESS] = this.address;
        obj[AdminUserTableSchema.FIELDS.DOB] = this.dob;
        obj[AdminUserTableSchema.FIELDS.EXP_YEAR] = this.expYear;
        obj[AdminUserTableSchema.FIELDS.EXP_MONTH] = this.expMonth;
        obj[AdminUserTableSchema.FIELDS.IMAGE_URL] = this.imageUrl;
        return obj;
    }
}

export default AdminUserModel;
