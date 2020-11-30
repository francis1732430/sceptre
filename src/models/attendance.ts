
import { AttendanceTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class AttendanceModel extends BaseModel {
    public id:number;
    public standardId:number;
    public sectionId:number;
    public studentId:number;
    public forenoon:string;
    public afternoon:string;
    public attendanceDate: string;

    public static fromRequest(req:Request):AttendanceModel {
        if (req != null && req.body) {
            let exam = new AttendanceModel();
            exam.rid = AttendanceModel.getString(req.body.rid);
            exam.id = AttendanceModel.getNumber(req.body.id);
            exam.standardId = AttendanceModel.getNumber(req.body.standardId);
            exam.sectionId = AttendanceModel.getNumber(req.body.sectionId);
            exam.studentId = AttendanceModel.getNumber(req.body.studentId);
            exam.forenoon = AttendanceModel.getString(req.body.forenoon);
            exam.afternoon = AttendanceModel.getString(req.body.afternoon);
            exam.attendanceDate = AttendanceModel.getString(req.body.attendanceDate);

            return exam;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):AttendanceModel {
        if (object != null) {
                let rid = object.get(AttendanceTableSchema.FIELDS.RID);
                let createdDate = object.get(AttendanceTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(AttendanceTableSchema.FIELDS.UPDATED_DATE);
                let standardId = object.get(AttendanceTableSchema.FIELDS.STANDARD_ID);
                let sectionId = object.get(AttendanceTableSchema.FIELDS.SECTION_ID);
                let studentId = object.get(AttendanceTableSchema.FIELDS.STUDENT_ID);
                let forenoon = object.get(AttendanceTableSchema.FIELDS.FORENOON);
                let afternoon = object.get(AttendanceTableSchema.FIELDS.AFTERNOON);
                let id = object.get(AttendanceTableSchema.FIELDS.ID);
                let attendanceDate = object.get(AttendanceTableSchema.FIELDS.ATTENDANCE_DATE);


                let ret = new AttendanceModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.standardId = standardId != null && standardId !== "" ? standardId : "";
                ret.sectionId = sectionId != null && sectionId !== "" ? sectionId : "";
                ret.studentId = studentId != null && studentId !== "" ? studentId : "";
                ret.forenoon = forenoon != null && forenoon !== "" ? forenoon : "";
                ret.afternoon = afternoon != null && afternoon !== "" ? afternoon : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.attendanceDate = attendanceDate != null && attendanceDate !== "" ? attendanceDate : "";

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
        obj[AttendanceTableSchema.FIELDS.ID] = this.id;
        obj[AttendanceTableSchema.FIELDS.STANDARD_ID] = this.standardId;
        obj[AttendanceTableSchema.FIELDS.SECTION_ID] = this.sectionId;
        obj[AttendanceTableSchema.FIELDS.STUDENT_ID] = this.studentId;
        obj[AttendanceTableSchema.FIELDS.FORENOON] = this.forenoon;
        obj[AttendanceTableSchema.FIELDS.AFTERNOON] = this.afternoon;
        obj[AttendanceTableSchema.FIELDS.ATTENDANCE_DATE] = this.attendanceDate;
        return obj;
    }
}

export default AttendanceModel;
