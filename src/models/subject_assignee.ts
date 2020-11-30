
import { SubjectAssigneesTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class SubjectAssigneeModel extends BaseModel {
    public id:number;
    public subjectId:number;
    public assigneeId:string;

    public static fromRequest(req:any):SubjectAssigneeModel {
        if (req != null) {
            let sassignee = new SubjectAssigneeModel();
            sassignee.rid = SubjectAssigneeModel.getString(req.rid);
            sassignee.subjectId = SubjectAssigneeModel.getNumber(req.subjectId);
            sassignee.assigneeId = SubjectAssigneeModel.getString(req.assigneeId);
            return sassignee;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):SubjectAssigneeModel {
        if (object != null) {
                let id = object.get(SubjectAssigneesTableSchema.FIELDS.ID);
                let rid = object.get(SubjectAssigneesTableSchema.FIELDS.RID);
                let createdDate = object.get(SubjectAssigneesTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(SubjectAssigneesTableSchema.FIELDS.UPDATED_DATE);
                let subjectId = object.get(SubjectAssigneesTableSchema.FIELDS.SUBJECT_ID);
                let assigneeId = object.get(SubjectAssigneesTableSchema.FIELDS.ASSIGNEE_ID);

                let ret = new SubjectAssigneeModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.subjectId = subjectId != null && subjectId !== "" ? subjectId : "";
                ret.assigneeId = assigneeId != null && assigneeId !== "" ? assigneeId : "";
                ret.id = id != null && id !== "" ? id : "";
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
        obj[SubjectAssigneesTableSchema.FIELDS.ID] = this.id;
        obj[SubjectAssigneesTableSchema.FIELDS.SUBJECT_ID] = this.subjectId;
        obj[SubjectAssigneesTableSchema.FIELDS.ASSIGNEE_ID] = this.assigneeId;
        return obj;
    }
}

export default SubjectAssigneeModel;
