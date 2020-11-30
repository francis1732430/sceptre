
import {AuthorizationRoleTableSchema} from "../data/schemas";
import BaseModel from "./base";
import * as express from "express";
import {Utils} from "../libs/utils";

export class AuthorizationRoleModel extends BaseModel {
    public userId: number;
    public roleId: number;
    public ruleId: number;
    public permission: number;

    public static fromRequest(req:express.Request):AuthorizationRoleModel {
        if (req != null && req.body) {
            let role = new AuthorizationRoleModel();
            role.rid = AuthorizationRoleModel.getString(req.body.rid);
            role.userId = AuthorizationRoleModel.getNumber(req.body.userId);
            role.roleId = AuthorizationRoleModel.getNumber(req.body.roleId);
            role.ruleId = AuthorizationRoleModel.getNumber(req.body.ruleId);
            role.permission = AuthorizationRoleModel.getNumber(req.body.permission);
            return role;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):AuthorizationRoleModel {
        if (object != null) {
            let rid = object.get(AuthorizationRoleTableSchema.FIELDS.RID);
            if (rid != null && rid !== "") {
                let userId = object.get(AuthorizationRoleTableSchema.FIELDS.USER_ID);
                let roleId = object.get(AuthorizationRoleTableSchema.FIELDS.ROLE_ID);
                let ruleId = object.get(AuthorizationRoleTableSchema.FIELDS.RULE_ID);
                let permission = object.get(AuthorizationRoleTableSchema.FIELDS.PERMISSION);
                let ret = new AuthorizationRoleModel();
                ret.rid = rid;
                ret.roleId = roleId != null ? roleId : undefined;
                ret.ruleId = ruleId != null ? ruleId : undefined;
                ret.userId = userId != null && userId !== "" ? userId : undefined;
                ret.permission = permission != null ? permission : undefined;
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
        if(this.rid) {
            obj[AuthorizationRoleTableSchema.FIELDS.RID] = this.rid;
        }
        obj[AuthorizationRoleTableSchema.FIELDS.USER_ID] = this.userId;
        obj[AuthorizationRoleTableSchema.FIELDS.RULE_ID] = this.ruleId;
        obj[AuthorizationRoleTableSchema.FIELDS.ROLE_ID] = this.roleId;
        obj[AuthorizationRoleTableSchema.FIELDS.PERMISSION] = this.permission;
        return obj;
    }
}

export default AuthorizationRoleModel;
