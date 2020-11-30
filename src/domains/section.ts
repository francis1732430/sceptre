
import { SectionDto } from "../data/models";
import {Utils} from "../libs/utils";
import {SectionModel, Exception} from "../models";
import { SectionTableSchema } from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";

export class SectionUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = SectionDto;
    }

    public create(section:SectionModel):Promise<any> {
        return Promise.then(() => {
            return this.findByQuery(q => {
                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_NAME}`, section.sectionName);
                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        })
        .then(object => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.void;
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_SECTION_NAME_ALREADY_EXISTS,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(() => {
                return SectionDto.create(SectionDto, section.toDto()).save();
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateById(id:string, section:SectionModel):Promise<any> {
        let adminuser:any;
        return Promise.then(() => {
            return this.findById(id);
        })
        .then(object => {
            if (object) {
                adminuser = object;
                return this.findByQuery(q => {
                    q.whereNot(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.RID}`, id);
                    q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_NAME}`, section.sectionName);
            }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_SECTION_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null && object.models.length ==0 ) {
                    let data = section.toDto();
                    return adminuser.save(data, {patch: true});
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.DUPLICATE_RESOURCE,
                MessageInfo.MI_SECTION_NAME_ALREADY_EXISTS,
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
                    userData[SectionTableSchema.FIELDS.IS_DELETED] = 1;
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
export default new SectionUseCase();
