
import {AssignedBusTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class AssignedBusModel extends BaseModel {
    public id:number;
    public busId:number;
    public driverId:number;
    public isActive:number;

    public static fromRequest(req:Request):AssignedBusModel {
        if (req != null && req.body) {
            let bus = new AssignedBusModel();
            bus.rid = AssignedBusModel.getString(req.body.rid);
            bus.id = AssignedBusModel.getNumber(req.body.standardId);
            bus.busId = AssignedBusModel.getNumber(req.body.busId);
            bus.driverId = AssignedBusModel.getNumber(req.body.driverId);
            bus.isActive = AssignedBusModel.getNumber(req.body.isActive);
            return bus;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):AssignedBusModel {
        if (object != null) {
                let rid = object.get(AssignedBusTableSchema.FIELDS.RID);
                let createdDate = object.get(AssignedBusTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(AssignedBusTableSchema.FIELDS.UPDATED_DATE);
                let id = object.get(AssignedBusTableSchema.FIELDS.ID);
                let busId = object.get(AssignedBusTableSchema.FIELDS.BUS_ID);
                let driverId = object.get(AssignedBusTableSchema.FIELDS.DRIVER_ID);
                let isActive = object.get(AssignedBusTableSchema.FIELDS.IS_ACTIVE);

                let ret = new AssignedBusModel();
                ret.rid = rid != null ? rid : "";
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.busId = busId != null && busId !== "" ? busId : "";
                ret.driverId = driverId != null && driverId !== "" ? driverId : "";
                ret.isActive = isActive != null && isActive !== "" ? isActive : "";
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
        obj[AssignedBusTableSchema.FIELDS.ID] = this.id;
        obj[AssignedBusTableSchema.FIELDS.BUS_ID] = this.busId;
        obj[AssignedBusTableSchema.FIELDS.DRIVER_ID] = this.driverId;
        obj[AssignedBusTableSchema.FIELDS.IS_ACTIVE] = this.isActive;
        return obj;
    }
}

export default AssignedBusModel;
