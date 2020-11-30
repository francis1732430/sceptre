
import { FeesAssigneesTableSchema,
    AdminUserTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class FeesAssigneeModel extends BaseModel {
    public id:number;
    public studentId:number;
    public feesId:number;
    public studentName:string;
    public standardId:number;
    public sectionId:number;
    public standardName:string;
    public sectionName:string;

    public static fromRequest(req:Request):FeesAssigneeModel {
        if (req != null && req.body) {
            let feesAssignee = new FeesAssigneeModel();
            feesAssignee.rid = FeesAssigneeModel.getString(req.body.rid);
            feesAssignee.id = FeesAssigneeModel.getNumber(req.body.id);
            feesAssignee.studentId = FeesAssigneeModel.getNumber(req.body.studentId);
            feesAssignee.feesId = FeesAssigneeModel.getNumber(req.body.feesId);
            feesAssignee.standardId = FeesAssigneeModel.getNumber(req.body.standardId);
            feesAssignee.sectionId = FeesAssigneeModel.getNumber(req.body.sectionId);
            feesAssignee.standardName = FeesAssigneeModel.getString(req.body.standardName);
            feesAssignee.sectionName = FeesAssigneeModel.getString(req.body.sectionName);
            return feesAssignee;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):FeesAssigneeModel {
        if (object != null) {
                let rid = object.get(FeesAssigneesTableSchema.FIELDS.RID);
                let createdDate = object.get(FeesAssigneesTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(FeesAssigneesTableSchema.FIELDS.UPDATED_DATE);
                let id = object.get(FeesAssigneesTableSchema.FIELDS.ID);
                let studentId = object.get(FeesAssigneesTableSchema.FIELDS.STUDENT_ID);
                let feesId = object.get(FeesAssigneesTableSchema.FIELDS.FEES_ID);
                let firstName = object.get(AdminUserTableSchema.FIELDS.FIRSTNAME);
                let standardId = object.get(FeesAssigneesTableSchema.FIELDS.STANDARD_ID);
                let sectionId = object.get(FeesAssigneesTableSchema.FIELDS.SECTION_ID);
                let standardName = object.get(FeesAssigneesTableSchema.FIELDS.STANDARD_NAME);
                let sectionName = object.get(FeesAssigneesTableSchema.FIELDS.SECTION_NAME);

                let ret = new FeesAssigneeModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.studentId = studentId != null && studentId !== "" ? studentId : "";
                ret.studentName = firstName != null && firstName !== "" ? firstName : "";
                ret.feesId = feesId != null && feesId !== "" ? feesId : "";
                ret.standardId = standardId != null && standardId !== "" ? standardId : "";
                ret.sectionId = sectionId != null && sectionId !== "" ? sectionId : "";
                ret.standardName = standardName != null && standardName !== "" ? standardName : "";
                ret.sectionName = sectionName != null && sectionName !== "" ? sectionName : "";
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
        obj[FeesAssigneesTableSchema.FIELDS.ID] = this.id;
        obj[FeesAssigneesTableSchema.FIELDS.STUDENT_ID] = this.studentId;
        obj[FeesAssigneesTableSchema.FIELDS.FEES_ID] = this.feesId;
        obj[FeesAssigneesTableSchema.FIELDS.STANDARD_ID] = this.standardId;
        obj[FeesAssigneesTableSchema.FIELDS.SECTION_ID] = this.sectionId;
        obj[FeesAssigneesTableSchema.FIELDS.STANDARD_NAME] = this.standardName;
        obj[FeesAssigneesTableSchema.FIELDS.SECTION_NAME] = this.sectionName;
        return obj;
    }
}

export default FeesAssigneeModel;
