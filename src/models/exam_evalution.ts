
import { ExamEvalutionTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class ExamEvalutionModel extends BaseModel {
    public id:number;
    public examId:number;
    public marks:string;
    public comments:string;
    public examStatus:number;
    public subjectId:number;
    public studentId:number;
    public examDate: string;
    public examPaperName: string;
    
    public static fromRequest(req:Request):ExamEvalutionModel {
        if (req != null && req.body) {
            let examEvalution = new ExamEvalutionModel();
            examEvalution.rid = ExamEvalutionModel.getString(req.body.rid);
            examEvalution.id = ExamEvalutionModel.getNumber(req.body.id);
            examEvalution.examId = ExamEvalutionModel.getNumber(req.body.examId);
            examEvalution.marks = ExamEvalutionModel.getString(req.body.marks);
            examEvalution.comments = ExamEvalutionModel.getString(req.body.comments);
            examEvalution.examStatus = ExamEvalutionModel.getNumber(req.body.examStatus);
            examEvalution.subjectId = ExamEvalutionModel.getNumber(req.body.subjectId);
            examEvalution.studentId = ExamEvalutionModel.getNumber(req.body.studentId);
            examEvalution.examDate = ExamEvalutionModel.getString(req.body.examDate);
            examEvalution.examPaperName = ExamEvalutionModel.getString(req.body.examPaperName);

            return examEvalution;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):ExamEvalutionModel {
        if (object != null) {
                let rid = object.get(ExamEvalutionTableSchema.FIELDS.RID);
                let createdDate = object.get(ExamEvalutionTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(ExamEvalutionTableSchema.FIELDS.UPDATED_DATE);
                let examId = object.get(ExamEvalutionTableSchema.FIELDS.EXAM_ID);
                let marks = object.get(ExamEvalutionTableSchema.FIELDS.MARKS);
                let comments = object.get(ExamEvalutionTableSchema.FIELDS.COMMENTS);
                let examStatus = object.get(ExamEvalutionTableSchema.FIELDS.EXAM_STATUS);
                let subjectId = object.get(ExamEvalutionTableSchema.FIELDS.SUBJECT_ID);
                let studentId = object.get(ExamEvalutionTableSchema.FIELDS.STUDENT_ID);
                let examDate = object.get(ExamEvalutionTableSchema.FIELDS.EXAM_DATE);
                let id = object.get(ExamEvalutionTableSchema.FIELDS.ID);
                let examPaperName = object.get(ExamEvalutionTableSchema.FIELDS.EXAM_PAPER_NAME);

                let ret = new ExamEvalutionModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.examId = examId != null && examId !== "" ? examId : "";
                ret.marks = marks != null && marks !== "" ? marks : "";
                ret.comments = comments != null && comments !== "" ? comments : "";
                ret.examStatus = examStatus != null && examStatus !== "" ? examStatus : "";
                ret.subjectId = subjectId != null && subjectId !== "" ? subjectId : "";
                ret.studentId = studentId != null && studentId !== "" ? studentId : "";
                ret.examDate = examDate != null && examDate !== "" ? examDate : "";
                ret.examPaperName = examPaperName != null && examPaperName !== "" ? examPaperName : "";
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
        obj[ExamEvalutionTableSchema.FIELDS.ID] = this.id;
        obj[ExamEvalutionTableSchema.FIELDS.EXAM_ID] = this.examId;
        obj[ExamEvalutionTableSchema.FIELDS.MARKS] = this.marks;
        obj[ExamEvalutionTableSchema.FIELDS.COMMENTS] = this.comments;
        obj[ExamEvalutionTableSchema.FIELDS.EXAM_STATUS] = this.examStatus;
        obj[ExamEvalutionTableSchema.FIELDS.SUBJECT_ID] = this.subjectId;
        obj[ExamEvalutionTableSchema.FIELDS.STUDENT_ID] = this.studentId;
        obj[ExamEvalutionTableSchema.FIELDS.EXAM_DATE] = this.examDate;
        obj[ExamEvalutionTableSchema.FIELDS.EXAM_PAPER_NAME] = this.examPaperName;
        return obj;
    }
}

export default ExamEvalutionModel;
