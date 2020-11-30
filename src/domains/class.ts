
import { ClassDto, SubjectAssigneeDto } from "../data/models";
import {Utils} from "../libs/utils";
import { StandardUseCase, SectionUseCase } from "../domains";
import { ClassModel, SubjectAssigneeModel ,Exception} from "../models";
import { ClassTableSchema, SubjectAssigneesTableSchema,
    StandardTableSchema, SectionTableSchema } from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";
import { SubjectAssigneeUseCase } from ".";

export class ClassUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = ClassDto;
    }

    public create(classObj):Promise<any> {
        let classAssineeIds;
        return Promise.then(() => {
            return StandardUseCase.findOne(q => {
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, classObj.standardId);
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
            });
        }).then((object) => {
            if (object) {
                return SectionUseCase.findOne(q => {
                    q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`, classObj.sectionId);
                    q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                });
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_STANDARD_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        }).then((object) => {
            if (object) {
                return this.findByQuery(q => {
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, classObj.standardId);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, classObj.sectionId);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_SECTION_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        })
        
        .then(object => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.each(classObj.subjectAssignees, (obj) => {
                    return Promise.then(() => {
                        const assigneeObj = SubjectAssigneeModel.fromRequest(obj);
                        return SubjectAssigneeDto.create(SubjectAssigneeDto, assigneeObj.toDto()).save();
                    }).then((obj) => {
                        if (obj) {
                            
                            const id = obj.get('rid');
                           return SubjectAssigneeUseCase.findById(id);
                        }
                    }).then((obj) => {
                        if (obj) {
                            const id = obj.get('id');
                            if (classAssineeIds) {
                                classAssineeIds = classAssineeIds + ',' + id;
                            } else {
                                classAssineeIds = id;
                            }
                        }
                    })
                    
                 }).then(() => {
                     return Promise.void;
                 })
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_STANDARD_ALREADY_EXISTS,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(() => {
                classObj['classAssignIds'] = classAssineeIds;
                const classData = {
                    body: classObj
                }
                const classtodo = ClassModel.fromRequest(classData);
                return ClassDto.create(ClassDto, classtodo.toDto()).save();
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateById(rid, classObj):Promise<any> {
        let classAssineeIds;
        return Promise.then(() => {
            return this.findByQuery(q => {
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, classObj.standardId);
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, classObj.sectionId);
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        })
        .then(object => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_STANDARD_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));   
            }
            return Promise.each(classObj.subjectAssignees, (obj: any) => {
                return Promise.then(() => {
                    return SubjectAssigneeUseCase.findOne(q => {
                        q.where(`${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.ID}`, obj.id);
                        q.where(`${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                    });
                }).then((object) => {
                    let adminUser = object;
                    if (object) {
                    const assigneeObject = SubjectAssigneeModel.fromRequest(obj);
                    let data = assigneeObject.toDto();
                    return adminUser.save(data, {patch: true});
                    } else {
                        const assigneeObj = SubjectAssigneeModel.fromRequest(obj);
                        return SubjectAssigneeDto.create(SubjectAssigneeDto, assigneeObj.toDto()).save();
                    }
                }).then((obj) => {
                    if (obj) {
                        const id = obj.get('rid');
                       return SubjectAssigneeUseCase.findById(id);
                    }
                }).then((obj) => {
                    if (obj) {
                        const id = obj.get('id');
                        if (classAssineeIds) {
                            classAssineeIds = classAssineeIds + ',' + id;
                        } else {
                            classAssineeIds = id;
                        }
                    }
                })
                
             }).then(() => {
                 return this.findById(rid);
             })
        })
        .then((object) => {
                classObj['classAssignIds'] = classAssineeIds;
                const classData = {
                    body: classObj
                }
                const classtodo = ClassModel.fromRequest(classData);
                return object.save(classtodo.toDto(), {patch: true});
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
                    userData[ClassTableSchema.FIELDS.IS_DELETED] = 1;
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
export default new ClassUseCase();
