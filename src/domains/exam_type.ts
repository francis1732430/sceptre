
import { ExamTypeDto } from "../data/models";
import {Utils} from "../libs/utils";
import {ExamTypeModel, Exception} from "../models";
import { ExamTypeTableSchema } from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";

export class ExamTypeUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = ExamTypeDto;
    }

    public create(examType :ExamTypeModel):Promise<any> {
        return Promise.then(() => {
            return this.findByQuery(q => {
                q.where(`${ExamTypeTableSchema.TABLE_NAME}.${ExamTypeTableSchema.FIELDS.EXAM_TYPE}`, examType.examType);
                q.where(`${ExamTypeTableSchema.TABLE_NAME}.${ExamTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${ExamTypeTableSchema.TABLE_NAME}.${ExamTypeTableSchema.FIELDS.IS_ACTIVE}`, 1);
                q.limit(1);
            }, []);
        })
        .then(object => {
            console.log(object.models);
            if (object != null && 0 < object.models.length) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_EXAM_TYPE_ALREADY_EXISTS,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            return Promise.void;
        })
        .then(() => {
                return ExamTypeDto.create(ExamTypeDto, examType.toDto()).save();
        })
        .catch(err => {
            console.log('ejhd', err);
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateById(id:string, examType:ExamTypeModel):Promise<any> {
        let adminuser:any;
        return Promise.then(() => {
            return this.findById(id);
        })
        .then(object => {
            if (object) {
                adminuser = object;
                return this.findByQuery(q => {
                    q.whereNot(`${ExamTypeTableSchema.TABLE_NAME}.${ExamTypeTableSchema.FIELDS.RID}`, id);
                    q.where(`${ExamTypeTableSchema.TABLE_NAME}.${ExamTypeTableSchema.FIELDS.EXAM_TYPE}`, examType.examType);
                    q.where(`${ExamTypeTableSchema.TABLE_NAME}.${ExamTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${ExamTypeTableSchema.TABLE_NAME}.${ExamTypeTableSchema.FIELDS.IS_ACTIVE}`, 1);
            }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_EXAM_TYPE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null && object.models.length ==0 ) {
                    let data = examType.toDto();
                    return adminuser.save(data, {patch: true});
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.DUPLICATE_RESOURCE,
                MessageInfo.MI_EXAM_TYPE_ALREADY_EXISTS,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public destroyById(rid:string):any {
        let adminUser: any;
        return Promise.then(() => {
            return this.findById(rid);
        })
        .then(object => {
            if (object) {
                    adminUser = object;
                    let userData = {};
                    userData[ExamTypeTableSchema.FIELDS.IS_DELETED] = 1;
                    return adminUser.save(userData, {patch: true});
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_OBJECT_ITEM_NOT_EXIST_OR_DELETED,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        }).catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        }).enclose();
    }
}
export default new ExamTypeUseCase();
