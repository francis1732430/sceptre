
import {EbookTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class EbookModel extends BaseModel {
    public id:string;
    public standardId:number;
    public subjectId:number;

    public static fromRequest(req:Request):EbookModel {
        if (req != null && req.body) {
            let standard = new EbookModel();
            standard.rid = EbookModel.getString(req.body.rid);
            standard.id = EbookModel.getString(req.body.id);
            standard.standardId = EbookModel.getNumber(req.body.standardId);
            standard.subjectId = EbookModel.getNumber(req.body.subjectId);
            return standard;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):EbookModel {
        if (object != null) {
                let rid = object.get(EbookTableSchema.FIELDS.RID);
                let createdDate = object.get(EbookTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(EbookTableSchema.FIELDS.UPDATED_DATE);
                let standardId = object.get(EbookTableSchema.FIELDS.STANDARD_ID);
                let id = object.get(EbookTableSchema.FIELDS.ID);
                let subjectId = object.get(EbookTableSchema.FIELDS.SUBJECT_ID);

                let ret = new EbookModel();
                ret.rid = rid != null ? rid : "";
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.standardId = standardId != null && standardId !== "" ? standardId : "";
                ret.subjectId = subjectId != null && subjectId !== "" ? subjectId : "";
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
        obj[EbookTableSchema.FIELDS.STANDARD_ID] = this.standardId;
        obj[EbookTableSchema.FIELDS.ID] = this.id;
        obj[EbookTableSchema.FIELDS.SUBJECT_ID] = this.subjectId;
        return obj;
    }
}

export default EbookModel;
