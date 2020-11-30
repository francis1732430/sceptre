
import {StandardTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class StandardModel extends BaseModel {
    public standardId:number;
    public standardName:string;

    public static fromRequest(req:Request):StandardModel {
        if (req != null && req.body) {
            let standard = new StandardModel();
            standard.rid = StandardModel.getString(req.body.rid);
            standard.standardId = StandardModel.getNumber(req.body.standardId);
            standard.standardName = StandardModel.getString(req.body.standardName);
            return standard;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):StandardModel {
        if (object != null) {
                let rid = object.get(StandardTableSchema.FIELDS.RID);
                let createdDate = object.get(StandardTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(StandardTableSchema.FIELDS.UPDATED_DATE);
                let standardId = object.get(StandardTableSchema.FIELDS.STANDARD_ID);
                let standardName = object.get(StandardTableSchema.FIELDS.STANDARD_NAME);

                let ret = new StandardModel();
                ret.rid = rid != null ? rid : "";
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.standardId = standardId != null && standardId !== "" ? standardId : "";
                ret.standardName = standardName != null && standardName !== "" ? standardName : "";
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
        obj[StandardTableSchema.FIELDS.STANDARD_ID] = this.standardId;
        obj[StandardTableSchema.FIELDS.STANDARD_NAME] = this.standardName;
        return obj;
    }
}

export default StandardModel;
