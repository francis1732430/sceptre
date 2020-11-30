
import {BusTrackingTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class BusTrackingModel extends BaseModel {
    public id:number;
    public busId:number;
    public lat:string;
    public lang:string;
    public isActive:number;

    public static fromRequest(req:Request):BusTrackingModel {
        if (req != null && req.body) {
            let bus = new BusTrackingModel();
            bus.rid = BusTrackingModel.getString(req.body.rid);
            bus.id = BusTrackingModel.getNumber(req.body.standardId);
            bus.busId = BusTrackingModel.getNumber(req.body.busId);
            bus.lat = BusTrackingModel.getString(req.body.lat);
            bus.lang = BusTrackingModel.getString(req.body.lang);
            bus.isActive = BusTrackingModel.getNumber(req.body.isActive);
            return bus;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):BusTrackingModel {
        if (object != null) {
                let rid = object.get(BusTrackingTableSchema.FIELDS.RID);
                let createdDate = object.get(BusTrackingTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(BusTrackingTableSchema.FIELDS.UPDATED_DATE);
                let id = object.get(BusTrackingTableSchema.FIELDS.ID);
                let busId = object.get(BusTrackingTableSchema.FIELDS.BUS_ID);
                let lat = object.get(BusTrackingTableSchema.FIELDS.LAT);
                let lang = object.get(BusTrackingTableSchema.FIELDS.LANG);
                let isActive = object.get(BusTrackingTableSchema.FIELDS.IS_ACTIVE);

                let ret = new BusTrackingModel();
                ret.rid = rid != null ? rid : "";
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.busId = busId != null && busId !== "" ? busId : "";
                ret.lat = lat != null && lat !== "" ? lat : "";
                ret.lang = lang != null && lang !== "" ? lang : "";
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
        obj[BusTrackingTableSchema.FIELDS.ID] = this.id;
        obj[BusTrackingTableSchema.FIELDS.BUS_ID] = this.busId;
        obj[BusTrackingTableSchema.FIELDS.LAT] = this.lat;
        obj[BusTrackingTableSchema.FIELDS.LANG] = this.lang;
        obj[BusTrackingTableSchema.FIELDS.IS_ACTIVE] = this.isActive;
        return obj;
    }
}

export default BusTrackingModel;
