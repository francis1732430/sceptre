
import { MarkEvalutionTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class MarkEvalutionModel extends BaseModel {
    public evalutionId:number;
    public studentId:number;
    public homeWorkId:number;
    public marks:string;
    public comments:string;
    public homeWorkStatus:number;
    public createdBy:number;
    public evalutionDate: string;
    public static fromRequest(req:Request):MarkEvalutionModel {
        if (req != null && req.body) {
            let markEvalution = new MarkEvalutionModel();
            markEvalution.rid = MarkEvalutionModel.getString(req.body.rid);
            markEvalution.evalutionId = MarkEvalutionModel.getNumber(req.body.evalutionId);
            markEvalution.studentId = MarkEvalutionModel.getNumber(req.body.studentId);
            markEvalution.homeWorkId = MarkEvalutionModel.getNumber(req.body.homeWorkId);
            markEvalution.marks = MarkEvalutionModel.getString(req.body.marks);
            markEvalution.comments = MarkEvalutionModel.getString(req.body.comments);
            markEvalution.homeWorkStatus = MarkEvalutionModel.getNumber(req.body.homeWorkStatus);
            markEvalution.createdBy = MarkEvalutionModel.getNumber(req.body.createdBy);
            markEvalution.evalutionDate = MarkEvalutionModel.getString(req.body.evalutionDate);
            return markEvalution;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):MarkEvalutionModel {
        if (object != null) {
                let rid = object.get(MarkEvalutionTableSchema.FIELDS.RID);
                let createdDate = object.get(MarkEvalutionTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(MarkEvalutionTableSchema.FIELDS.UPDATED_DATE);
                let evalutionId = object.get(MarkEvalutionTableSchema.FIELDS.EVALUTION_ID);
                let studentId = object.get(MarkEvalutionTableSchema.FIELDS.STUDENT_ID);
                let homeWorkId = object.get(MarkEvalutionTableSchema.FIELDS.HOME_WORK_ID);
                let marks = object.get(MarkEvalutionTableSchema.FIELDS.MARKS);
                let comments = object.get(MarkEvalutionTableSchema.FIELDS.COMMENTS);
                let homeWorkStatus = object.get(MarkEvalutionTableSchema.FIELDS.HOME_WORK_STATUS);
                let createdBy = object.get(MarkEvalutionTableSchema.FIELDS.CREATED_BY);


                let ret = new MarkEvalutionModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.evalutionId = evalutionId != null && evalutionId !== "" ? evalutionId : "";
                ret.studentId = studentId != null && studentId !== "" ? studentId : "";
                ret.homeWorkId = homeWorkId != null && homeWorkId !== "" ? homeWorkId : "";
                ret.comments = comments != null && comments !== "" ? comments : "";
                ret.homeWorkStatus = homeWorkStatus != null && homeWorkStatus !== "" ? homeWorkStatus : "";
                ret.createdBy = createdBy != null && createdBy !== "" ? createdBy : "";
                ret.marks = marks != null && marks !== "" ? marks : "";

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
        obj[MarkEvalutionTableSchema.FIELDS.EVALUTION_ID] = this.evalutionId;
        obj[MarkEvalutionTableSchema.FIELDS.STUDENT_ID] = this.studentId;
        obj[MarkEvalutionTableSchema.FIELDS.HOME_WORK_ID] = this.homeWorkId;
        obj[MarkEvalutionTableSchema.FIELDS.COMMENTS] = this.comments;
        obj[MarkEvalutionTableSchema.FIELDS.HOME_WORK_STATUS] = this.homeWorkStatus;
        obj[MarkEvalutionTableSchema.FIELDS.CREATED_BY] = this.createdBy;
        obj[MarkEvalutionTableSchema.FIELDS.MARKS] = this.marks;
        return obj;
    }
}

export default MarkEvalutionModel;
