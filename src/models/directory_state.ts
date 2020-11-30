/**
 *        on 5/20/18.
 */
import {DirectoryStateTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";

export class DirectoryStateModel extends BaseModel {
    public stateId:number;
    public stateName:string;
    public countryId:string;

    public static fromRequest(req:Request):DirectoryStateModel {
        if (req != null && req.body) {
            let State = new DirectoryStateModel();
            State.stateId = DirectoryStateModel.getNumber(req.body.stateId);
            State.stateName = DirectoryStateModel.getString(req.body.stateName);
            State.countryId = DirectoryStateModel.getString(req.body.countryId);
            return State;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):DirectoryStateModel {
        if (object != null) {
            let rid = object.get(DirectoryStateTableSchema.FIELDS.RID);
            let stateId = object.get(DirectoryStateTableSchema.FIELDS.STATE_ID);
            let stateName = object.get(DirectoryStateTableSchema.FIELDS.STATE_NAME);                
            let countryId = object.get(DirectoryStateTableSchema.FIELDS.COUNTRY_ID);
            let ret = new DirectoryStateModel();
            ret.rid = rid != null && rid !== "" ? rid : undefined;
            ret.stateId = stateId != null && stateId !== "" ? stateId : undefined;
            ret.stateName = stateName != null && stateName !== "" ? stateName : undefined;                
            if (object.relations != null) {
                
            }
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
        obj[DirectoryStateTableSchema.FIELDS.STATE_ID] = this.stateId;
        obj[DirectoryStateTableSchema.FIELDS.STATE_NAME] = this.stateName;
        return obj;
    }
}

export default DirectoryStateModel;
