
import { SyllabusTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class SyllabusModel extends BaseModel {
    public id:number;
    public classId:number;
    public subjectId:number;
    public lessonStatus:number;
    public teacherId:number;
    public standardId:number;
    public sectionId:number;

    public static fromRequest(req:Request):SyllabusModel {
        if (req != null && req.body) {
            let syllabus = new SyllabusModel();
            syllabus.rid = SyllabusModel.getString(req.body.rid);
            syllabus.classId = SyllabusModel.getNumber(req.body.classId);
            syllabus.subjectId = SyllabusModel.getNumber(req.body.subjectId);
            syllabus.lessonStatus = SyllabusModel.getNumber(req.body.lessonStatus);
            syllabus.teacherId = SyllabusModel.getNumber(req.body.teacherId);
            syllabus.standardId = SyllabusModel.getNumber(req.body.standardId);
            syllabus.sectionId = SyllabusModel.getNumber(req.body.sectionId);

            return syllabus;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):SyllabusModel {
        if (object != null) {
                let rid = object.get(SyllabusTableSchema.FIELDS.RID);
                let createdDate = object.get(SyllabusTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(SyllabusTableSchema.FIELDS.UPDATED_DATE);
                let classId = object.get(SyllabusTableSchema.FIELDS.CLASS_ID);
                let subjectId = object.get(SyllabusTableSchema.FIELDS.SUBJECT_ID);
                let lessonStatus = object.get(SyllabusTableSchema.FIELDS.LESSON_STATUS);
                let teacherId = object.get(SyllabusTableSchema.FIELDS.TEACHER_ID);
                let standardId = object.get(SyllabusTableSchema.FIELDS.STANDARD_ID);
                let sectionId = object.get(SyllabusTableSchema.FIELDS.SECTION_ID);

                let ret = new SyllabusModel();
                ret.rid = rid != null ? rid : "";
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.classId = classId != null && classId !== "" ? classId : "";
                ret.subjectId = subjectId != null && subjectId !== "" ? subjectId : "";
                ret.lessonStatus = lessonStatus != null && lessonStatus !== "" ? lessonStatus : "";
                ret.teacherId = teacherId != null && teacherId !== "" ? teacherId : "";
                ret.standardId = standardId != null && standardId !== "" ? standardId : "";
                ret.sectionId = sectionId != null && sectionId !== "" ? sectionId : "";
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
        obj[SyllabusTableSchema.FIELDS.CLASS_ID] = this.classId;
        obj[SyllabusTableSchema.FIELDS.SUBJECT_ID] = this.subjectId;
        obj[SyllabusTableSchema.FIELDS.LESSON_STATUS] = this.lessonStatus;
        obj[SyllabusTableSchema.FIELDS.TEACHER_ID] = this.teacherId;
        obj[SyllabusTableSchema.FIELDS.STANDARD_ID] = this.standardId;
        obj[SyllabusTableSchema.FIELDS.SECTION_ID] = this.sectionId;

        return obj;
    }
}

export default SyllabusModel;
