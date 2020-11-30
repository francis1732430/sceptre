
import { SyllabusDto, SyllabusLessonsDto } from "../data/models";
import {Utils} from "../libs/utils";
import {SyllabusModel, Exception, SyllabusLessonsModel} from "../models";
import { SyllabusTableSchema, SubjectTableSchema, StandardTableSchema, SectionTableSchema, ClassTableSchema, SubjectAssigneesTableSchema, LessonsTableSchema, SyllabusLessonsTableSchema } from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";
import { ClassUseCase, SubjectAssigneeUseCase, LessonsUseCase, SyllabusLessonsUseCase, SubjectUseCase, StandardUseCase, SectionUseCase } from "../domains";

export class SyllabusUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = SyllabusDto;
    }

    public create(syllabus:SyllabusModel, lessons: any):Promise<any> {
        return Promise.then(() => {
            return SubjectUseCase.findByQuery(q => {
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, syllabus.subjectId);
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        })
        .then(object => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_SUBJECT_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            return StandardUseCase.findByQuery(q => {
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, syllabus.standardId);
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        })
        .then((object) => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_STANDARD_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            return SectionUseCase.findByQuery(q => {
                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`, syllabus.sectionId);
                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        })
        .then((object) => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_SECTION_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
                return ClassUseCase.findByQuery((q) => {
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, syllabus.standardId);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, syllabus.sectionId);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                });
        })
        .then((object) => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_CLASS_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
                syllabus.classId = object.models[0].get('class_id');
                const assigneeIds = object.models[0].get('subject_assignee_ids') ? object.models[0].get('subject_assignee_ids').split(',') : [];
                return SubjectAssigneeUseCase.findByQuery((q) => {
                    q.where(`${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.SUBJECT_ID}`, syllabus.subjectId);
                    q.whereIn(`${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.ID}`, assigneeIds);
                    q.where(`${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                });
        })
        .then((object) => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_TEACHER_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            syllabus.teacherId = object.models[0].get('assignee_id')
            return this.findByQuery((q) => {
                q.where(`${SyllabusTableSchema.TABLE_NAME}.${SyllabusTableSchema.FIELDS.SUBJECT_ID}`, syllabus.subjectId);
                q.where(`${SyllabusTableSchema.TABLE_NAME}.${SyllabusTableSchema.FIELDS.STANDARD_ID}`, syllabus.standardId);
                q.where(`${SyllabusTableSchema.TABLE_NAME}.${SyllabusTableSchema.FIELDS.IS_DELETED}`, 0);
            });
        })
        .then((object) => {
            if (object && 0 === object.models.length) {
                let check = false;
                    return Promise.each(lessons, (obj: any) => {
                        if (!check) {
                            return Promise.then(() => {
                                return LessonsUseCase.findByQuery(q => {
                                    q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.ID}`, obj.id);
                                    q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                                    q.limit(1);
                                }, []);
                            }).then((object) => {
                                if (object && object.models && 0 === object.models.length) {
                                    check = true;
                                }
                            })
                        }  
                    }).then(() => {
                        if (check) {
                            return Promise.reject(new Exception(
                                ErrorCode.RESOURCE.USER_NOT_FOUND,
                                MessageInfo.MI_LESSONS_NOT_FOUND,
                                false,
                                HttpStatus.BAD_REQUEST
                            ));
                        } else {
                            return LessonsUseCase.updateSyllabus(syllabus.standardId, syllabus.subjectId, lessons)
                        }
                    });
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_SYLLABUS_ALREADY_EXISTS,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        })
        .then(() => {
            return SyllabusDto.create(SyllabusDto, syllabus.toDto()).save();
        })
        .catch(err => {
            console.log('ejhd', err);
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateById(id:string, syllabus:SyllabusModel, lessons: any):Promise<any> {
        let adminuser:any;
        return Promise.then(() => {
            return this.findById(id);
        })
        .then(object => {
            if (object) {
                adminuser = object;
                return SubjectUseCase.findByQuery(q => {
                    q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, syllabus.subjectId);
                    q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_SYLLABUS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(object => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_SUBJECT_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            return StandardUseCase.findByQuery(q => {
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, syllabus.standardId);
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        })
        .then((object) => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_STANDARD_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            return SectionUseCase.findByQuery(q => {
                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`, syllabus.sectionId);
                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        })
        .then((object) => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_SECTION_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
                return ClassUseCase.findByQuery((q) => {
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, syllabus.standardId);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, syllabus.sectionId);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                });
        })
        .then((object) => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_CLASS_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
                syllabus.classId = object.models[0].get('class_id');
                const assigneeIds = object.models[0].get('subject_assignee_ids') ? object.models[0].get('subject_assignee_ids').split(',') : [];
                return SubjectAssigneeUseCase.findByQuery((q) => {
                    q.where(`${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.SUBJECT_ID}`, syllabus.subjectId);
                    q.whereIn(`${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.ID}`, assigneeIds);
                    q.where(`${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                });
        })
        .then((object) => {
            if (object != null && object.models != null && !object.models[0]) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_TEACHER_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            let check = false;
            syllabus.teacherId = object.models[0].get('assignee_id')
            return Promise.each(lessons, (obj: any) => {
                if (!check) {
                    return Promise.then(() => {
                        return LessonsUseCase.findByQuery(q => {
                            q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.ID}`, obj.id);
                            q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                            q.limit(1);
                        }, []);
                    }).then((object) => {
                        if (object && object.models && 0 === object.models.length) {
                            check = true;
                        }
                    })
                }  
            }).then(() => {
                if (check) {
                    return Promise.reject(new Exception(
                        ErrorCode.RESOURCE.USER_NOT_FOUND,
                        MessageInfo.MI_LESSONS_NOT_FOUND,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                } else {
                    return LessonsUseCase.updateSyllabus(syllabus.standardId, syllabus.subjectId, lessons)
                }
                    }).then(() => {
                        let data = syllabus.toDto();
                        return adminuser.save(data, {patch: true});
                    }).catch(err => {
                        return Promise.reject(Utils.parseDtoError(err));
                    })
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
                    this.deleteIfExists(object.get('id')).then(() => {
                        let userData = {};
                        userData[SyllabusTableSchema.FIELDS.IS_DELETED] = 1;
                        return adminUser.save(userData, {patch: true});
                    });
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

    public deleteIfExists(id) {
        return new Promise((resolve) => {
            return Promise.then(() => {
                return SyllabusLessonsUseCase.findByQuery((q) => {
                    q.where(`${SyllabusLessonsTableSchema.TABLE_NAME}.${SyllabusLessonsTableSchema.FIELDS.SYLLABUS_ID}`, id);
                    q.where(`${SyllabusLessonsTableSchema.TABLE_NAME}.${SyllabusLessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                });
            }).then((object) => {
                if (object && object.models && 0 < object.models.length) {
                    return SyllabusLessonsUseCase.deleteByQuery(q => {
                        q.where(`${SyllabusLessonsTableSchema.TABLE_NAME}.${SyllabusLessonsTableSchema.FIELDS.SYLLABUS_ID}`, id);
                    });
                } else {
                    return Promise.void;
                }
            })
            .then(() => {
                resolve(true);
            })
        })
    }
}
export default new SyllabusUseCase();
