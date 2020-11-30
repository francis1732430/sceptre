
import {EbookUploadTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class EbookUploadModel extends BaseModel {
    public id:number;
    public name:string;
    public ebookUrl:string;
    public ebookId:number;

    public static fromRequest(req:Request):EbookUploadModel {
        if (req != null && req.body) {
            let ebook = new EbookUploadModel();
            ebook.rid = EbookUploadModel.getString(req.body.rid);
            ebook.id = EbookUploadModel.getNumber(req.body.id);
            ebook.name = EbookUploadModel.getString(req.body.name);
            ebook.ebookUrl = EbookUploadModel.getString(req.body.ebookUrl);
            ebook.ebookId = EbookUploadModel.getNumber(req.body.ebookId);
            return ebook;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):EbookUploadModel {
        if (object != null) {
                let rid = object.get(EbookUploadTableSchema.FIELDS.RID);
                let createdDate = object.get(EbookUploadTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(EbookUploadTableSchema.FIELDS.UPDATED_DATE);
                let name = object.get(EbookUploadTableSchema.FIELDS.NAME);
                let id = object.get(EbookUploadTableSchema.FIELDS.ID);
                let ebookUrl = object.get(EbookUploadTableSchema.FIELDS.EBOOK_URL);
                let ebookId = object.get(EbookUploadTableSchema.FIELDS.EBOOK_ID);

                let ret = new EbookUploadModel();
                ret.rid = rid != null ? rid : "";
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.name = name != null && name !== "" ? name : "";
                ret.ebookUrl = ebookUrl != null && ebookUrl !== "" ? ebookUrl : "";
                ret.ebookId = ebookId != null && ebookId !== "" ? ebookId : "";
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
        obj[EbookUploadTableSchema.FIELDS.NAME] = this.name;
        obj[EbookUploadTableSchema.FIELDS.ID] = this.id;
        obj[EbookUploadTableSchema.FIELDS.EBOOK_ID] = this.ebookId;
        obj[EbookUploadTableSchema.FIELDS.EBOOK_URL] = this.ebookUrl;
        return obj;
    }
}

export default EbookUploadModel;
