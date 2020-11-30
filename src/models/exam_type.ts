
import { ExamTypeTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class ExamTypeModel extends BaseModel {
    public examId:number;
    public examType:string;
    public isActive:number;

    public static fromRequest(req:Request):ExamTypeModel {
        if (req != null && req.body) {
            let examType = new ExamTypeModel();
            examType.rid = ExamTypeModel.getString(req.body.rid);
            examType.examId = ExamTypeModel.getNumber(req.body.examId);
            examType.examType = ExamTypeModel.getString(req.body.examType);
            examType.isActive = ExamTypeModel.getNumber(req.body.isActive);
            return examType;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):ExamTypeModel {
        if (object != null) {
                let rid = object.get(ExamTypeTableSchema.FIELDS.RID);
                let createdDate = object.get(ExamTypeTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(ExamTypeTableSchema.FIELDS.UPDATED_DATE);
                let examId = object.get(ExamTypeTableSchema.FIELDS.ID);
                let examType = object.get(ExamTypeTableSchema.FIELDS.EXAM_TYPE);
                let isActive = object.get(ExamTypeTableSchema.FIELDS.IS_ACTIVE);

                let ret = new ExamTypeModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.examId = examId != null && examId !== "" ? examId : "";
                ret.examType = examType != null && examType !== "" ? examType : "";
                ret.isActive = isActive != null && isActive !== "" ? isActive : "";
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
        obj[ExamTypeTableSchema.FIELDS.ID] = this.examId;
        obj[ExamTypeTableSchema.FIELDS.EXAM_TYPE] = this.examType;
        obj[ExamTypeTableSchema.FIELDS.IS_ACTIVE] = this.isActive;
        return obj;
    }
}

export default ExamTypeModel;
