
import { LessonsTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class LessonsModel extends BaseModel {
    public id:number;
    public lessonName:string;
    public standardId: number;
    public subjectId: number;
    public status: number;

    public static fromRequest(req:Request):LessonsModel {
        if (req != null && req.body) {
            let lesson = new LessonsModel();
            lesson.rid = LessonsModel.getString(req.body.rid);
            lesson.id = LessonsModel.getNumber(req.body.id);
            lesson.lessonName = LessonsModel.getString(req.body.lessonName);
            lesson.standardId = LessonsModel.getNumber(req.body.standardId);
            lesson.subjectId = LessonsModel.getNumber(req.body.subjectId);
            lesson.status = LessonsModel.getNumber(req.body.status);
            return lesson;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):LessonsModel {
        if (object != null) {
                let rid = object.get(LessonsTableSchema.FIELDS.RID);
                let createdDate = object.get(LessonsTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(LessonsTableSchema.FIELDS.UPDATED_DATE);
                let id = object.get(LessonsTableSchema.FIELDS.ID);
                let lessonName = object.get(LessonsTableSchema.FIELDS.LESSON_NAME);
                let standardId = object.get(LessonsTableSchema.FIELDS.STANDARD_ID);
                let subjectId = object.get(LessonsTableSchema.FIELDS.SUBJECT_ID);
                let status = object.get(LessonsTableSchema.FIELDS.STATUS);

                let ret = new LessonsModel();
                ret.rid = rid != null ? rid : "";
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.lessonName = lessonName != null && lessonName !== "" ? lessonName : "";
                ret.standardId = standardId != null && standardId !== "" ? standardId : "";
                ret.subjectId = subjectId != null && subjectId !== "" ? subjectId : "";
                ret.status = status != null && status !== "" ? status : "";
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
        obj[LessonsTableSchema.FIELDS.ID] = this.id;
        obj[LessonsTableSchema.FIELDS.LESSON_NAME] = this.lessonName;
        obj[LessonsTableSchema.FIELDS.STANDARD_ID] = this.standardId;
        obj[LessonsTableSchema.FIELDS.SUBJECT_ID] = this.subjectId;
        obj[LessonsTableSchema.FIELDS.STATUS] = this.status;
        return obj;
    }
}

export default LessonsModel;
