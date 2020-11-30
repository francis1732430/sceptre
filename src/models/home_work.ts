
import { HomeWorkTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class HomeWorkModel extends BaseModel {
    public id:number;
    public homeWorkDate:string;
    public subjectId:number;
    public submissionDate:string;
    public standardId:number;
    public sectionId:number;
    public marks:string;
    public description:string;
    public createdBy:number;
    public evalutionDate:string;

    public static fromRequest(req:Request):HomeWorkModel {
        if (req != null && req.body) {
            let homeWork = new HomeWorkModel();
            homeWork.rid = HomeWorkModel.getString(req.body.rid);
            homeWork.subjectId = HomeWorkModel.getNumber(req.body.subjectId);
            homeWork.id = HomeWorkModel.getNumber(req.body.id);
            homeWork.homeWorkDate = HomeWorkModel.getString(req.body.homeWorkDate);
            homeWork.submissionDate = HomeWorkModel.getString(req.body.submissionDate);
            homeWork.standardId = HomeWorkModel.getNumber(req.body.standardId);
            homeWork.sectionId = HomeWorkModel.getNumber(req.body.sectionId);
            homeWork.marks = HomeWorkModel.getString(req.body.marks);
            homeWork.description = HomeWorkModel.getString(req.body.description);
            homeWork.createdBy = HomeWorkModel.getNumber(req.body.createdBy);
            homeWork.evalutionDate = HomeWorkModel.getString(req.body.evalutionDate);

            return homeWork;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):HomeWorkModel {
        if (object != null) {
                let rid = object.get(HomeWorkTableSchema.FIELDS.RID);
                let createdDate = object.get(HomeWorkTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(HomeWorkTableSchema.FIELDS.UPDATED_DATE);
                let subjectId = object.get(HomeWorkTableSchema.FIELDS.SUBJECT_ID);
                let homeWorkDate = object.get(HomeWorkTableSchema.FIELDS.HOME_WORK_DATE);
                let submissionDate = object.get(HomeWorkTableSchema.FIELDS.SUBMISSION_DATE);
                let standardId = object.get(HomeWorkTableSchema.FIELDS.STANDARD_ID);
                let sectionId = object.get(HomeWorkTableSchema.FIELDS.SECTION_ID);
                let description = object.get(HomeWorkTableSchema.FIELDS.DESCRIPTION);
                let createdBy = object.get(HomeWorkTableSchema.FIELDS.CREATED_BY);
                let marks = object.get(HomeWorkTableSchema.FIELDS.MARKS);
                let evalutionDate = object.get(HomeWorkTableSchema.FIELDS.EVALUTION_DATE);
                let id = object.get(HomeWorkTableSchema.FIELDS.ID);


                let ret = new HomeWorkModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.subjectId = subjectId != null && subjectId !== "" ? subjectId : "";
                ret.homeWorkDate = homeWorkDate != null && homeWorkDate !== "" ? homeWorkDate : "";
                ret.submissionDate = submissionDate != null && submissionDate !== "" ? submissionDate : "";
                ret.standardId = standardId != null && standardId !== "" ? standardId : "";
                ret.sectionId = sectionId != null && sectionId !== "" ? sectionId : "";
                ret.description = description != null && description !== "" ? description : "";
                ret.createdBy = createdBy != null && createdBy !== "" ? createdBy : "";
                ret.marks = marks != null && marks !== "" ? marks : "";
                ret.evalutionDate = evalutionDate != null && evalutionDate !== "" ? evalutionDate : "";
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
        obj[HomeWorkTableSchema.FIELDS.SUBJECT_ID] = this.subjectId;
        obj[HomeWorkTableSchema.FIELDS.HOME_WORK_DATE] = this.homeWorkDate;
        obj[HomeWorkTableSchema.FIELDS.SUBMISSION_DATE] = this.submissionDate;
        obj[HomeWorkTableSchema.FIELDS.STANDARD_ID] = this.standardId;
        obj[HomeWorkTableSchema.FIELDS.SECTION_ID] = this.sectionId;
        obj[HomeWorkTableSchema.FIELDS.DESCRIPTION] = this.description;
        obj[HomeWorkTableSchema.FIELDS.CREATED_BY] = this.createdBy;
        obj[HomeWorkTableSchema.FIELDS.MARKS] = this.marks;
        obj[HomeWorkTableSchema.FIELDS.EVALUTION_DATE] = this.evalutionDate;
        return obj;
    }
}

export default HomeWorkModel;
