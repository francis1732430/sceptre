
import { FeesSectionsTableSchema,
 } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class FeesSectionModel extends BaseModel {
    public id:number;
    public standardId:number;
    public sectionId:number;
    public feesId:number;
    public standardName: string;
    public sectionName: string;
    public static fromRequest(req:Request):FeesSectionModel {
        if (req != null && req.body) {
            let feesSection = new FeesSectionModel();
            feesSection.rid = FeesSectionModel.getString(req.body.rid);
            feesSection.id = FeesSectionModel.getNumber(req.body.id);
            feesSection.standardId = FeesSectionModel.getNumber(req.body.standardId);
            feesSection.sectionId = FeesSectionModel.getNumber(req.body.sectionId);
            feesSection.feesId = FeesSectionModel.getNumber(req.body.feesId);
            feesSection.standardName = FeesSectionModel.getString(req.body.standardName);
            feesSection.sectionName = FeesSectionModel.getString(req.body.sectionName);
            return feesSection;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):FeesSectionModel {
        if (object != null) {
                let rid = object.get(FeesSectionsTableSchema.FIELDS.RID);
                let createdDate = object.get(FeesSectionsTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(FeesSectionsTableSchema.FIELDS.UPDATED_DATE);
                let id = object.get(FeesSectionsTableSchema.FIELDS.ID);
                let standardId = object.get(FeesSectionsTableSchema.FIELDS.STANDARD_ID);
                let sectionId = object.get(FeesSectionsTableSchema.FIELDS.SECTION_ID);
                let feesId = object.get(FeesSectionsTableSchema.FIELDS.FEES_ID);

                let ret = new FeesSectionModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.standardId = standardId != null && standardId !== "" ? standardId : "";
                ret.sectionId = sectionId != null && sectionId !== "" ? sectionId : "";
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
        obj[FeesSectionsTableSchema.FIELDS.ID] = this.id;
        obj[FeesSectionsTableSchema.FIELDS.STANDARD_ID] = this.standardId;
        obj[FeesSectionsTableSchema.FIELDS.SECTION_ID] = this.sectionId;
        obj[FeesSectionsTableSchema.FIELDS.FEES_ID] = this.feesId;
        obj[FeesSectionsTableSchema.FIELDS.STANDARD_NAME] = this.standardName;
        obj[FeesSectionsTableSchema.FIELDS.SECTION_NAME] = this.sectionName;
        return obj;
    }
}

export default FeesSectionModel;
