
import {PaidFeesTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";
export class PaidFeesModel extends BaseModel {
    public id:number;
    public feesId:number;
    public standardId:number;
    public sectionId:number;
    public studentId:number;
    public feesAmount:string;
    public paidStatus:number;
    public transactionId:string;
    public createdBy:number;
    public paymentMode:number;

    public static fromRequest(req:Request):PaidFeesModel {
        if (req != null && req.body) {
            let payment = new PaidFeesModel();
            payment.rid = PaidFeesModel.getString(req.body.rid);
            payment.id = PaidFeesModel.getNumber(req.body.id);
            payment.feesId = PaidFeesModel.getNumber(req.body.feesId);
            payment.standardId = PaidFeesModel.getNumber(req.body.standardId);
            payment.sectionId = PaidFeesModel.getNumber(req.body.sectionId);
            payment.studentId = PaidFeesModel.getNumber(req.body.studentId);
            payment.feesAmount = PaidFeesModel.getString(req.body.feesAmount);
            payment.paidStatus = PaidFeesModel.getNumber(req.body.paidStatus);
            payment.transactionId = PaidFeesModel.getString(req.body.transactionId);
            payment.createdBy = PaidFeesModel.getNumber(req.body.createdBy);
            payment.paymentMode = PaidFeesModel.getNumber(req.body.paymentMode);
            return payment;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):PaidFeesModel {
        if (object != null) {
                let rid = object.get(PaidFeesTableSchema.FIELDS.RID);
                let createdDate = object.get(PaidFeesTableSchema.FIELDS.CREATED_DATE);
                let updatedDate = object.get(PaidFeesTableSchema.FIELDS.UPDATED_DATE);
                let id = object.get(PaidFeesTableSchema.FIELDS.ID);
                let feesId = object.get(PaidFeesTableSchema.FIELDS.FEES_ID);
                let standardId = object.get(PaidFeesTableSchema.FIELDS.STANDARD_ID);
                let sectionId = object.get(PaidFeesTableSchema.FIELDS.SECTION_ID);
                let studentId = object.get(PaidFeesTableSchema.FIELDS.STUDENT_ID);
                let feesAmount = object.get(PaidFeesTableSchema.FIELDS.FEES_AMOUNT);
                let paidStatus = object.get(PaidFeesTableSchema.FIELDS.PAID_STATUS);
                let transactionId = object.get(PaidFeesTableSchema.FIELDS.TRANSACTION_ID);
                let createdBy = object.get(PaidFeesTableSchema.FIELDS.CREATED_BY);
                let paymentMode = object.get(PaidFeesTableSchema.FIELDS.PAYMENT_MODE);
                let ret = new PaidFeesModel();
                ret.rid = rid != null ? rid : "";
                ret.createdDate = createdDate != null ? createdDate : "";
                ret.updatedDate = updatedDate != null ? updatedDate : "";
                ret.id = id != null && id !== "" ? id : "";
                ret.feesId = feesId != null && feesId !== "" ? feesId : "";
                ret.standardId = standardId != null && standardId !== "" ? standardId : "";
                ret.sectionId = sectionId != null && sectionId !== "" ? sectionId : "";
                ret.studentId = studentId != null && studentId !== "" ? studentId : "";
                ret.feesAmount = feesAmount != null && feesAmount !== "" ? feesAmount : "";
                ret.paidStatus = paidStatus != null && paidStatus !== "" ? paidStatus : "";
                ret.transactionId = transactionId != null && transactionId !== "" ? transactionId : "";
                ret.createdBy = createdBy != null && createdBy !== "" ? createdBy : "";
                ret.paymentMode = paymentMode != null && paymentMode !== "" ? paymentMode : "";

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
        obj[PaidFeesTableSchema.FIELDS.ID] = this.id;
        obj[PaidFeesTableSchema.FIELDS.FEES_ID] = this.feesId;
        obj[PaidFeesTableSchema.FIELDS.STANDARD_ID] = this.standardId;
        obj[PaidFeesTableSchema.FIELDS.STUDENT_ID] = this.studentId;
        obj[PaidFeesTableSchema.FIELDS.SECTION_ID] = this.sectionId;
        obj[PaidFeesTableSchema.FIELDS.FEES_AMOUNT] = this.feesAmount;
        obj[PaidFeesTableSchema.FIELDS.PAID_STATUS] = this.paidStatus;
        obj[PaidFeesTableSchema.FIELDS.TRANSACTION_ID] = this.transactionId;
        obj[PaidFeesTableSchema.FIELDS.CREATED_BY] = this.createdBy;
        obj[PaidFeesTableSchema.FIELDS.PAYMENT_MODE] = this.paymentMode;

        return obj;
    }
}

export default PaidFeesModel;
