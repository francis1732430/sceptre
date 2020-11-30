
import { SubjectTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class SubjectModel extends BaseModel {
    public subjectId:number;
    public subjectName:string;

    public static fromRequest(req:Request):SubjectModel {
        if (req != null && req.body) {
            let subject = new SubjectModel();
            subject.rid = SubjectModel.getString(req.body.rid);
            subject.subjectId = SubjectModel.getNumber(req.body.subjectId);
            subject.subjectName = SubjectModel.getString(req.body.subjectName);
            return subject;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):SubjectModel {
        if (object != null) {
                let rid = object.get(SubjectTableSchema.FIELDS.RID);
                let createdDate = object.get(SubjectTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(SubjectTableSchema.FIELDS.UPDATED_DATE);
                let subjectId = object.get(SubjectTableSchema.FIELDS.SUBJECT_ID);
                let subjectName = object.get(SubjectTableSchema.FIELDS.SUBJECT_NAME);

                let ret = new SubjectModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.subjectId = subjectId != null && subjectId !== "" ? subjectId : "";
                ret.subjectName = subjectName != null && subjectName !== "" ? subjectName : "";
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
        obj[SubjectTableSchema.FIELDS.SUBJECT_ID] = this.subjectId;
        obj[SubjectTableSchema.FIELDS.SUBJECT_NAME] = this.subjectName;
        return obj;
    }
}

export default SubjectModel;
