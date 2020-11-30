
import { ClassTableSchema,
    StandardTableSchema,
    SectionTableSchema, 
    AdminUserTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class ClassModel extends BaseModel {
    public classId:number;
    public className:string;
    public classAssignIds:string;
    public standardId:number;
    public sectionId:number;
    public standardName:string;
    public sectionName:string;
    public createdBy: number;

    public static fromRequest(req:Request):ClassModel {
        if (req != null && req.body) {
            let classModel = new ClassModel();
            classModel.rid = ClassModel.getString(req.body.rid);
            classModel.classId = ClassModel.getNumber(req.body.classId);
            classModel.className = ClassModel.getString(req.body.className);
            classModel.classAssignIds = ClassModel.getString(req.body.classAssignIds);
            classModel.standardId = ClassModel.getNumber(req.body.standardId);
            classModel.sectionId = ClassModel.getNumber(req.body.sectionId);
            classModel.createdBy = ClassModel.getNumber(req.body.createdBy);
            return classModel;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):ClassModel {
        if (object != null) {
                let rid = object.get(ClassTableSchema.FIELDS.RID);
                let createdDate = object.get(ClassTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(ClassTableSchema.FIELDS.UPDATED_DATE);
                let classId = object.get(ClassTableSchema.FIELDS.CLASS_ID);
                let className = object.get(ClassTableSchema.FIELDS.CLASS_NAME);
                let classAssignIds = object.get(ClassTableSchema.FIELDS.SUBJECT_ASSIGNEE_IDs);
                let standardId = object.get(ClassTableSchema.FIELDS.STANDARD_ID);
                let sectionId = object.get(ClassTableSchema.FIELDS.SECTION_ID);
                let standardName = object.get(StandardTableSchema.FIELDS.STANDARD_NAME);
                let sectionName = object.get(SectionTableSchema.FIELDS.SECTION_NAME);

                let ret = new ClassModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.classId = classId != null && classId !== "" ? classId : "";
                ret.className = className != null && className !== "" ? className : "";
                ret.classAssignIds = classAssignIds != null && classAssignIds !== "" ? classAssignIds : "";
                ret.standardId = standardId != null && standardId !== "" ? standardId : "";
                ret.sectionId = sectionId != null && sectionId !== "" ? sectionId : "";
                ret.standardName = standardName != null && standardName !== "" ? standardName : "";
                ret.sectionName = sectionName != null && sectionName !== "" ? sectionName : "";
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
        obj[ClassTableSchema.FIELDS.CLASS_ID] = this.classId;
        obj[ClassTableSchema.FIELDS.CLASS_NAME] = this.className;
        obj[ClassTableSchema.FIELDS.SUBJECT_ASSIGNEE_IDs] = this.classAssignIds;
        obj[ClassTableSchema.FIELDS.STANDARD_ID] = this.standardId;
        obj[ClassTableSchema.FIELDS.SECTION_ID] = this.sectionId;
        obj[ClassTableSchema.FIELDS.CREATED_BY_ID] = this.createdBy;
        return obj;
    }
}

export default ClassModel;
