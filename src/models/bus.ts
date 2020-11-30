
import {BusTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class BusModel extends BaseModel {
    public id:number;
    public busName:string;
    public busNumber:string;

    public static fromRequest(req:Request):BusModel {
        if (req != null && req.body) {
            let bus = new BusModel();
            bus.rid = BusModel.getString(req.body.rid);
            bus.id = BusModel.getNumber(req.body.id);
            bus.busName = BusModel.getString(req.body.busName);
            bus.busNumber = BusModel.getString(req.body.busNumber);
            return bus;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):BusModel {
        if (object != null) {
                let rid = object.get(BusTableSchema.FIELDS.RID);
                let createdDate = object.get(BusTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(BusTableSchema.FIELDS.UPDATED_DATE);
                let id = object.get(BusTableSchema.FIELDS.ID);
                let busName = object.get(BusTableSchema.FIELDS.BUS_NAME);
                let busNumber = object.get(BusTableSchema.FIELDS.BUS_NUMBER);

                let ret = new BusModel();
                ret.rid = rid != null ? rid : "";
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.busName = busName != null && busName !== "" ? busName : "";
                ret.busNumber = busNumber != null && busNumber !== "" ? busNumber : "";
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
        obj[BusTableSchema.FIELDS.ID] = this.id;
        obj[BusTableSchema.FIELDS.BUS_NAME] = this.busName;
        obj[BusTableSchema.FIELDS.BUS_NUMBER] = this.busNumber;
        return obj;
    }
}

export default BusModel;
