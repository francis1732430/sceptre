
import { ClassStudentsTableSchema } from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class ClassStudentsModel extends BaseModel {
    public id:number;
    public classId: number;
    public userId: number;

    public static fromRequest(req:Request):ClassStudentsModel {
        if (req != null && req.body) {
            let classStudents = new ClassStudentsModel();
            classStudents.rid = ClassStudentsModel.getString(req.body.rid);
            classStudents.id = ClassStudentsModel.getNumber(req.body.id);
            classStudents.classId = ClassStudentsModel.getNumber(req.body.classId);
            classStudents.userId = ClassStudentsModel.getNumber(req.body.userId);
            return classStudents;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):ClassStudentsModel {
        if (object != null) {
                let rid = object.get(ClassStudentsTableSchema.FIELDS.RID);
                let createdDate = object.get(ClassStudentsTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(ClassStudentsTableSchema.FIELDS.UPDATED_DATE);
                let id = object.get(ClassStudentsTableSchema.FIELDS.ID);
                let classId = object.get(ClassStudentsTableSchema.FIELDS.CLASS_ID);
                let userId = object.get(ClassStudentsTableSchema.FIELDS.USER_ID);

                let ret = new ClassStudentsModel();
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.classId = classId != null && classId !== "" ? classId : "";
                ret.userId = userId != null && userId !== "" ? userId : "";
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
        obj[ClassStudentsTableSchema.FIELDS.ID] = this.id;
        obj[ClassStudentsTableSchema.FIELDS.CLASS_ID] = this.classId;
        obj[ClassStudentsTableSchema.FIELDS.USER_ID] = this.userId;
        return obj;
    }
}

export default ClassStudentsModel;
