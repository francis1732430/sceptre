
import { ExamTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class ExamModel extends BaseModel {
    public examId:number;
    public subjects:string;
    public examType:number;
    public standardId:number;
    public sectionId:number;
    public totalMarks:string;
    public examStartDate:string;
    public examEndDate:string;
    public examStartTime:string;
    public examDate:string;
    public onlineExam: number;

    public static fromRequest(req:Request):ExamModel {
        if (req != null && req.body) {
            let exam = new ExamModel();
            exam.rid = ExamModel.getString(req.body.rid);
            exam.examId = ExamModel.getNumber(req.body.examId);
            exam.examType = ExamModel.getNumber(req.body.examType);
            exam.subjects = ExamModel.getString(req.body.subjects);
            exam.standardId = ExamModel.getNumber(req.body.standardId);
            exam.sectionId = ExamModel.getNumber(req.body.sectionId);
            exam.totalMarks = ExamModel.getString(req.body.totalMarks);
            exam.examStartDate = ExamModel.getString(req.body.examStartDate);
            exam.examEndDate = ExamModel.getString(req.body.examEndDate);
            exam.examStartTime = ExamModel.getString(req.body.examStartTime);
            exam.examDate = ExamModel.getString(req.body.examDate);
            exam.onlineExam = ExamModel.getNumber(req.body.onlineExam);
            return exam;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):ExamModel {
        if (object != null) {
                let rid = object.get(ExamTableSchema.FIELDS.RID);
                let createdDate = object.get(ExamTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(ExamTableSchema.FIELDS.UPDATED_DATE);
                let examId = object.get(ExamTableSchema.FIELDS.EXAM_ID);
                let examType = object.get(ExamTableSchema.FIELDS.EXAM_TYPE);
                let subjects = object.get(ExamTableSchema.FIELDS.SUBJECTS);
                let standardId = object.get(ExamTableSchema.FIELDS.STANDARD_ID);
                let sectionId = object.get(ExamTableSchema.FIELDS.SECTION_ID);
                let totalMarks = object.get(ExamTableSchema.FIELDS.TOTAL_MARK);
                let examStartDate = object.get(ExamTableSchema.FIELDS.EXAM_START_DATE);
                let examEndDate = object.get(ExamTableSchema.FIELDS.EXAM_END_DATE);
                let onlineExam = object.get(ExamTableSchema.FIELDS.ONLINE_EXAM);
                let examDate;
                if (object.get(ExamTableSchema.FIELDS.EXAM_DATE)) {
                    examDate = JSON.parse(object.get(ExamTableSchema.FIELDS.EXAM_DATE));
                    console.log(examDate);
                }
                let examStartTime = object.get(ExamTableSchema.FIELDS.EXAM_START_TIME);


                let ret = new ExamModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.examId = examId != null && examId !== "" ? examId : "";
                ret.examType = examType != null && examType !== "" ? examType : "";
                ret.subjects = subjects != null && subjects !== "" ? subjects : "";
                ret.standardId = standardId != null && standardId !== "" ? standardId : "";
                ret.sectionId = sectionId != null && sectionId !== "" ? sectionId : "";
                ret.totalMarks = totalMarks != null && totalMarks !== "" ? totalMarks : "";
                ret.examStartDate = examStartDate != null && examStartDate !== "" ? examStartDate : "";
                ret.examEndDate = examEndDate != null && examEndDate !== "" ? examEndDate : "";
                ret.examDate = examDate != null && examDate !== "" ? examDate : "";
                ret.examStartTime = examStartTime != null && examStartTime !== "" ? examStartTime : "";
                ret.onlineExam = onlineExam != null && onlineExam !== "" ? onlineExam : "";


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
        obj[ExamTableSchema.FIELDS.EXAM_ID] = this.examId;
        obj[ExamTableSchema.FIELDS.EXAM_TYPE] = this.examType;
        obj[ExamTableSchema.FIELDS.SUBJECTS] = this.subjects;
        obj[ExamTableSchema.FIELDS.STANDARD_ID] = this.standardId;
        obj[ExamTableSchema.FIELDS.SECTION_ID] = this.sectionId;
        obj[ExamTableSchema.FIELDS.TOTAL_MARK] = this.totalMarks;
        obj[ExamTableSchema.FIELDS.EXAM_START_DATE] = this.examStartDate;
        obj[ExamTableSchema.FIELDS.EXAM_END_DATE] = this.examEndDate;
        obj[ExamTableSchema.FIELDS.EXAM_START_TIME] = this.examStartTime;
        obj[ExamTableSchema.FIELDS.EXAM_DATE] = JSON.stringify(this.examDate);
        obj[ExamTableSchema.FIELDS.ONLINE_EXAM] = JSON.stringify(this.onlineExam);
        return obj;
    }
}

export default ExamModel;
