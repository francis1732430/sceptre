/**
 *        on 5/20/18.
 */
import {DirectoryCityTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";

export class DirectoryCityModel extends BaseModel {
    public cityId:number;
    public cityName:string;
    public stateId:number;

    public static fromRequest(req:Request):DirectoryCityModel {
        if (req != null && req.body) {
            let City = new DirectoryCityModel();
            return City;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):DirectoryCityModel {
        if (object != null) {
            let rid = object.get(DirectoryCityTableSchema.FIELDS.RID);
            let cityId = object.get(DirectoryCityTableSchema.FIELDS.CITY_ID);
            let cityName = object.get(DirectoryCityTableSchema.FIELDS.CITY_NAME); 
            let ret = new DirectoryCityModel();
            ret.rid = rid != null && rid !== "" ? rid : undefined;
            ret.cityId = cityId != null && cityId !== "" ? cityId : undefined;
            ret.cityName = cityName != null && cityName !== "" ? cityName : undefined;                
            if (object.relations != null) {
                
            }
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
        obj[DirectoryCityTableSchema.FIELDS.CITY_ID] = this.cityId;
        obj[DirectoryCityTableSchema.FIELDS.CITY_NAME] = this.cityName;
        return obj;
    }
}

export default DirectoryCityModel;
