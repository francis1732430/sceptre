
import { FeesTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class FeesModel extends BaseModel {
    public id:number;
    public feesTypeId:number;
    public feesAmount:string;
    public feesOption:string;

    public static fromRequest(req:Request):FeesModel {
        if (req != null && req.body) {
            let fees = new FeesModel();
            fees.rid = FeesModel.getString(req.body.rid);
            fees.id = FeesModel.getNumber(req.body.id);
            fees.feesTypeId = FeesModel.getNumber(req.body.feesTypeId);
            fees.feesAmount = FeesModel.getString(req.body.feesAmount);
            fees.feesOption = FeesModel.getString(req.body.feesOption);

            return fees;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):FeesModel {
        if (object != null) {
                let rid = object.get(FeesTableSchema.FIELDS.RID);
                let createdDate = object.get(FeesTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(FeesTableSchema.FIELDS.UPDATED_DATE);
                let id = object.get(FeesTableSchema.FIELDS.ID);
                let feesTypeId = object.get(FeesTableSchema.FIELDS.FEES_TYPE_ID);
                let feesAmount = object.get(FeesTableSchema.FIELDS.FEES_AMOUNT);
                let feesOption = object.get(FeesTableSchema.FIELDS.FEES_OPTION);

                let ret = new FeesModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.feesTypeId = feesTypeId != null && feesTypeId !== "" ? feesTypeId : "";
                ret.feesAmount = feesAmount != null && feesAmount !== "" ? feesAmount : "";
                ret.feesOption = feesOption != null && feesOption !== "" ? feesOption : "";
                
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
        obj[FeesTableSchema.FIELDS.ID] = this.id;
        obj[FeesTableSchema.FIELDS.FEES_TYPE_ID] = this.feesTypeId;
        obj[FeesTableSchema.FIELDS.FEES_AMOUNT] = this.feesAmount;
        obj[FeesTableSchema.FIELDS.FEES_OPTION] = this.feesOption;

        return obj;
    }
}

export default FeesModel;
