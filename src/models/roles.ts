
import {RolesTableSchema} from "../data/schemas";
import BaseModel from "./base";
import * as express from "express";


export class RoleModel extends BaseModel {
    public roleId:number;
    public roleName: string;

    public static fromRequest(req:express.Request):RoleModel {
        if (req != null && req.body) {
            let account = new RoleModel();
            account.roleId = RoleModel.getNumber(req.body.roleId);
            account.roleName = RoleModel.getString(req.body.roleName);
            return account;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):RoleModel {
        if (object != null) {
            let roleId = object.get(RolesTableSchema.FIELDS.ROLE_ID);
            if (roleId != null && roleId !== "") {
                let rid = object.get(RolesTableSchema.FIELDS.RID);
                let createdDate = object.get(RolesTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(RolesTableSchema.FIELDS.UPDATED_DATE);
                let roleName = object.get(RolesTableSchema.FIELDS.ROLE_NAME);
                let roleId = object.get(RolesTableSchema.FIELDS.ROLE_ID);

                let ret = new RoleModel();
                ret.rid = rid != null && rid !== "" ? rid : undefined;
                ret.roleId = roleId != null && roleId !== "" ? roleId : undefined;
                ret.roleName = roleName != null && roleName !== "" ? roleName : undefined;
                ret.createdDate = createdDate != null ? createdDate : undefined;
                ret.updatedDate = updatedDate != null ? updatedDate : undefined;
        
                if (filters != null) {
                    filters.forEach(filter => {
                        ret[filter] = undefined;
                    });
                }
                return ret;
            }
        }
        return null;
    }

    public toDto():any {
        let obj = {};
        obj[RolesTableSchema.FIELDS.ROLE_NAME] = this.roleName;
        obj[RolesTableSchema.FIELDS.ROLE_ID] = this.roleId;

        return obj;
    }
}

export default RoleModel;
