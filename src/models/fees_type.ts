
import { FeesTypeTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class FeesTypeModel extends BaseModel {
    public id:number;
    public feesTypeName:string;

    public static fromRequest(req:Request):FeesTypeModel {
        if (req != null && req.body) {
            let feesType = new FeesTypeModel();
            feesType.rid = FeesTypeModel.getString(req.body.rid);
            feesType.id = FeesTypeModel.getNumber(req.body.id);
            feesType.feesTypeName = FeesTypeModel.getString(req.body.feesTypeName);
            return feesType;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):FeesTypeModel {
        if (object != null) {
                let rid = object.get(FeesTypeTableSchema.FIELDS.RID);
                let createdDate = object.get(FeesTypeTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(FeesTypeTableSchema.FIELDS.UPDATED_DATE);
                let id = object.get(FeesTypeTableSchema.FIELDS.ID);
                let feesTypeName = object.get(FeesTypeTableSchema.FIELDS.FEES_TYPE);

                let ret = new FeesTypeModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.feesTypeName = feesTypeName != null && feesTypeName !== "" ? feesTypeName : "";
                ret.rid = rid != null && rid !== "" ? rid : "";
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
        obj[FeesTypeTableSchema.FIELDS.ID] = this.id;
        obj[FeesTypeTableSchema.FIELDS.FEES_TYPE] = this.feesTypeName;
        return obj;
    }
}

export default FeesTypeModel;
