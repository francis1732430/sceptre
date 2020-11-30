/**
 *      on 7/24/16.
 */
import {AdminUserSessionTableSchema} from "../data/schemas";
import BaseModel from "./base";
import * as express from "express";
import {Utils} from "../libs/utils";

export class AdminUserSessionModel extends BaseModel {
    public userId:string;
    public sessionId:string;
    public deviceId:string;
    public deviceToken:string;
    public platform:number;
    public ip:string;
    public userInfo:any;
    public message:string;

    public static fromRequest(req:express.Request):AdminUserSessionModel {
        if (req != null && req.body) {
            let session = new AdminUserSessionModel();
            session.rid = AdminUserSessionModel.getString(req.body.rid);
            session.userId = AdminUserSessionModel.getString(req.body.userId);
            session.deviceId = AdminUserSessionModel.getString(req.body.deviceId);
            session.deviceToken = AdminUserSessionModel.getString(req.body.deviceToken);
            session.platform = AdminUserSessionModel.getNumber(req.body.platform);
            session.status = AdminUserSessionModel.getNumber(req.body.status, 0);
            return session;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):AdminUserSessionModel {
        console.log("dfddsfsd...................11");
        if (object != null) {
            console.log("dfddsfsd...................");
            let id = object.get(AdminUserSessionTableSchema.FIELDS.RID);
            if (id != null && id !== "") {
                console.log("dfddsfsd...................");
                let createdDate = object.get(AdminUserSessionTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(AdminUserSessionTableSchema.FIELDS.UPDATED_DATE);
                let userId = object.get(AdminUserSessionTableSchema.FIELDS.USER_ID);
                let sessionId = object.get(AdminUserSessionTableSchema.FIELDS.SESSION_ID);
                let deviceId = object.get(AdminUserSessionTableSchema.FIELDS.DEVICE_ID);
                let deviceToken = object.get(AdminUserSessionTableSchema.FIELDS.DEVICE_TOKEN);
                let platform = object.get(AdminUserSessionTableSchema.FIELDS.PLATFORM);
                let status = object.get(AdminUserSessionTableSchema.FIELDS.STATUS);
                status = parseInt(status, 10);
                let ip = object.get(AdminUserSessionTableSchema.FIELDS.IP);

                let ret = new AdminUserSessionModel();
                //ret.id = id;
                //ret.createdDate = createdDate != null ? createdDate : undefined;
                //ret.updatedDate = updatedDate != null ? updatedDate : undefined;
                //ret.userId = userId != null && userId !== "" ? userId : undefined;
                ret.sessionId = sessionId != null && sessionId !== "" ? sessionId : undefined;
                //ret.deviceId = deviceId != null && deviceId !== "" ? deviceId : undefined;
               // ret.ip = isNaN(ip) ? undefined : ip;
                //ret.status = isNaN(status) ? undefined : status;
                //ret.message = 'Your Password has been updated successfully';
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
            obj[AdminUserSessionTableSchema.FIELDS.RID] = this.rid;
        }
        obj[AdminUserSessionTableSchema.FIELDS.USER_ID] = this.userId;
        obj[AdminUserSessionTableSchema.FIELDS.SESSION_ID] = this.sessionId;
        obj[AdminUserSessionTableSchema.FIELDS.DEVICE_ID] = this.deviceId;
        obj[AdminUserSessionTableSchema.FIELDS.DEVICE_TOKEN] = this.deviceToken;
        obj[AdminUserSessionTableSchema.FIELDS.IP] = this.ip;
        obj[AdminUserSessionTableSchema.FIELDS.STATUS] = this.status;
        return obj;
    }
}

export default AdminUserSessionModel;
