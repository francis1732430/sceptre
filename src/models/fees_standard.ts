
import { FeesStandardsTableSchema,
 } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class FeesStandardModel extends BaseModel {
    public id:number;
    public standardId:number;
    public feesId:number;

    public static fromRequest(req:Request):FeesStandardModel {
        if (req != null && req.body) {
            let feesAssignee = new FeesStandardModel();
            feesAssignee.rid = FeesStandardModel.getString(req.body.rid);
            feesAssignee.id = FeesStandardModel.getNumber(req.body.id);
            feesAssignee.standardId = FeesStandardModel.getNumber(req.body.standardId);
            feesAssignee.feesId = FeesStandardModel.getNumber(req.body.feesId);
            return feesAssignee;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):FeesStandardModel {
        if (object != null) {
                let rid = object.get(FeesStandardsTableSchema.FIELDS.RID);
                let createdDate = object.get(FeesStandardsTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(FeesStandardsTableSchema.FIELDS.UPDATED_DATE);
                let id = object.get(FeesStandardsTableSchema.FIELDS.ID);
                let standardId = object.get(FeesStandardsTableSchema.FIELDS.STANDARD_ID);
                let feesId = object.get(FeesStandardsTableSchema.FIELDS.FEES_ID);

                let ret = new FeesStandardModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.standardId = standardId != null && standardId !== "" ? standardId : "";
                ret.feesId = feesId != null && feesId !== "" ? feesId : "";
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
        obj[FeesStandardsTableSchema.FIELDS.ID] = this.id;
        obj[FeesStandardsTableSchema.FIELDS.STANDARD_ID] = this.standardId;
        obj[FeesStandardsTableSchema.FIELDS.FEES_ID] = this.feesId;
        return obj;
    }
}

export default FeesStandardModel;
