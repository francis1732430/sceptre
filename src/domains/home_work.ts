
import { HomeWorkDto } from "../data/models";
import {Utils} from "../libs/utils";
import {HomeWorkModel, Exception} from "../models";
import { HomeWorkTableSchema, StandardTableSchema, SectionTableSchema, SubjectTableSchema, ClassTableSchema } from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";
import { StandardUseCase, SectionUseCase, SubjectUseCase, ClassUseCase } from ".";

export class HomeWorkUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = HomeWorkDto;
    }

    public create(homeWork:HomeWorkModel):Promise<any> {
        return Promise.then( () => {
            return ClassUseCase.findByQuery(q => {
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, homeWork.standardId);
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, homeWork.sectionId);
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        }).then((object) => {
            if (object && 0 < object.models.length) {
            return StandardUseCase.findByQuery(q => {
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, homeWork.standardId);
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${ClassTableSchema.TABLE_NAME} as cl`, `cl.${ClassTableSchema.FIELDS.STANDARD_ID}`,
                `${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`);
                q.where(`cl.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        } else {
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_CHECK_CLASS_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        })
        .then(object => {
            if (object && 0 < object.models.length) {
                return SectionUseCase.findByQuery(q => {
                    q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`, homeWork.sectionId);
                    q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.innerJoin(`${ClassTableSchema.TABLE_NAME} as cl`, `cl.${ClassTableSchema.FIELDS.STANDARD_ID}`,
                   `${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`);
                q.where(`cl.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_CHECK_CLASS_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object && 0 < object.models.length) {
                return SubjectUseCase.findByQuery(q => {
                    q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, homeWork.subjectId);
                    q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_CHECK_CLASS_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then((object) => {
            if (object && 0 < object.models.length) {
                return HomeWorkDto.create(HomeWorkDto, homeWork.toDto()).save();
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateById(id:string, homeWork:HomeWorkModel):Promise<any> {
        let adminuser:any;
        return Promise.then(() => {
            return this.findById(id);
        })
        .then(object => {
            if (object) {
                adminuser = object;
                return StandardUseCase.findByQuery(q => {
                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, homeWork.standardId);
                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.innerJoin(`${ClassTableSchema.TABLE_NAME} as cl`, `cl.${ClassTableSchema.FIELDS.STANDARD_ID}`,
                `${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`);
                q.where(`cl.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_HOME_WORK_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then((object) => {
            if (object && 0 < object.models.length) {
                return ClassUseCase.findByQuery(q => {
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, homeWork.standardId);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, homeWork.sectionId);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);                    
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_CHECK_CLASS_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object && 0 < object.models.length) {
                return SectionUseCase.findByQuery(q => {
                    q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`, homeWork.sectionId);
                    q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.innerJoin(`${ClassTableSchema.TABLE_NAME} as cl`, `cl.${ClassTableSchema.FIELDS.STANDARD_ID}`,
                   `${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`);
                q.where(`cl.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_CHECK_CLASS_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object && 0 < object.models.length) {
                return SubjectUseCase.findByQuery(q => {
                    q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, homeWork.subjectId);
                    q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_CHECK_CLASS_EXIST,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object && 0 < object.models.length ) {
                    let data = homeWork.toDto();
                    return adminuser.save(data, {patch: true});
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.DUPLICATE_RESOURCE,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
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
                    userData[HomeWorkTableSchema.FIELDS.IS_DELETED] = 1;
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
export default new HomeWorkUseCase();
