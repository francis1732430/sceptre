
import {SectionTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class SectionModel extends BaseModel {
    public sectionId:number;
    public sectionName:string;

    public static fromRequest(req:Request):SectionModel {
        if (req != null && req.body) {
            let section = new SectionModel();
            section.rid = SectionModel.getString(req.body.rid);
            section.sectionId = SectionModel.getNumber(req.body.sectionId);
            section.sectionName = SectionModel.getString(req.body.sectionName);
            return section;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):SectionModel {
        if (object != null) {
                let rid = object.get(SectionTableSchema.FIELDS.RID);
                let createdDate = object.get(SectionTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(SectionTableSchema.FIELDS.UPDATED_DATE);
                let sectionId = object.get(SectionTableSchema.FIELDS.SECTION_ID);
                let sectionName = object.get(SectionTableSchema.FIELDS.SECTION_NAME);

                let ret = new SectionModel();
                ret.rid = rid != null ? rid : "";
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.sectionId = sectionId != null && sectionId !== "" ? sectionId : "";
                ret.sectionName = sectionName != null && sectionName !== "" ? sectionName : "";
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
        obj[SectionTableSchema.FIELDS.SECTION_ID] = this.sectionId;
        obj[SectionTableSchema.FIELDS.SECTION_NAME] = this.sectionName;
        return obj;
    }
}

export default SectionModel;
