
import { SyllabusLessonsTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class SyllabusLessonsModel extends BaseModel {
    public id:number;
    public syllabusId:number;
    public lessonId:number;

    public static fromRequest(req:Request):SyllabusLessonsModel {
        if (req != null && req.body) {
            let lesson = new SyllabusLessonsModel();
            lesson.rid = SyllabusLessonsModel.getString(req.body.rid);
            lesson.id = SyllabusLessonsModel.getNumber(req.body.id);
            lesson.syllabusId = SyllabusLessonsModel.getNumber(req.body.syllabusId);
            lesson.lessonId = SyllabusLessonsModel.getNumber(req.body.lessonId);
            return lesson;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):SyllabusLessonsModel {
        if (object != null) {
                let rid = object.get(SyllabusLessonsTableSchema.FIELDS.RID);
                let createdDate = object.get(SyllabusLessonsTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(SyllabusLessonsTableSchema.FIELDS.UPDATED_DATE);
                let id = object.get(SyllabusLessonsTableSchema.FIELDS.ID);
                let syllabusId = object.get(SyllabusLessonsTableSchema.FIELDS.SYLLABUS_ID);
                let lessonId = object.get(SyllabusLessonsTableSchema.FIELDS.LESSON_ID);

                let ret = new SyllabusLessonsModel();
                ret.rid = rid != null ? rid : "";
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.syllabusId = syllabusId != null && syllabusId !== "" ? syllabusId : "";
                ret.lessonId = lessonId != null && lessonId !== "" ? lessonId : "";

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
        obj[SyllabusLessonsTableSchema.FIELDS.ID] = this.id;
        obj[SyllabusLessonsTableSchema.FIELDS.SYLLABUS_ID] = this.syllabusId;
        obj[SyllabusLessonsTableSchema.FIELDS.LESSON_ID] = this.lessonId;

        return obj;
    }
}

export default SyllabusLessonsModel;
