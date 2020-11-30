
import { LessonsDto } from "../data/models";
import {Utils} from "../libs/utils";
import {LessonsModel, Exception} from "../models";
import { LessonsTableSchema, StandardTableSchema, SubjectTableSchema } from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";
import { StandardUseCase, SubjectUseCase } from ".";

export class LessonsUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = LessonsDto;
    }

    public create(lesson:LessonsModel, lessons: any):Promise<any> {
        return Promise.then(() => {
            return StandardUseCase.findByQuery( q=> {
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, lesson.standardId);
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then((object) => {
            if (object && 0 < object.models.length) {
            return SubjectUseCase.findByQuery(q => {
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, lesson.subjectId);
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        } else {
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        })
        .then((object) => {
            
            if (object && 0 < object.models.length) {
                let check = false;
            return Promise.each(lessons, (obj: any) => {
                if (!check) {
                    return Promise.then(() => {
                        return this.findByQuery(q => {
                            q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.STANDARD_ID}`, lesson.standardId);
                            q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.SUBJECT_ID}`, lesson.subjectId);
                            q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.LESSON_NAME}`, obj.lessonName);
                            q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                            q.limit(1);
                    }, []);
                        }).then((objLesson) => {
                            if (objLesson && 0 < objLesson.models.length) {
                                check = true;
                            }
                        })
                }
            }).then(() => {
                if (check) {
                    return Promise.reject(new Exception(
                                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                                    MessageInfo.MI_LESSIONS_ALREADY_EXISTS,
                                    false,
                                    HttpStatus.BAD_REQUEST
                    ));
                } else {
                    return Promise.then(() => {
                        Promise.each(lessons, (obj: any, i) => {
                            return Promise.then(() => {
                                return Promise.then(() => {
                                    return this.findByQuery((q) => {
                                        q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.ID}`, obj.id);
                                        q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                                    })
                                }).then((obj2) => {
                                    if (obj2 && 0 < obj2.models.length) {
                                        let adminuser = obj2.models[0];
                                        const lessonData = {
                                            body: {
                                                standardId: lesson.standardId,
                                                subjectId: lesson.subjectId,
                                                lessonName: obj.lessonName,
                                                status: obj.status
                                            }
                                        }
                                        const lessonModel = LessonsModel.fromRequest(lessonData);
                                        let data = lessonModel.toDto();
                                        return adminuser.save(data, {patch: true});
                                    } else if (obj.lessonName) {
                                        const lessonData = {
                                            body: {
                                                standardId: lesson.standardId,
                                                subjectId: lesson.subjectId,
                                                lessonName: obj.lessonName
                                            }
                                        }
                                        const lessonModel = LessonsModel.fromRequest(lessonData);
                                        return LessonsDto.create(LessonsDto, lessonModel.toDto()).save();
                                    }
                                }).then(() => {
                                    if (i === lessons.length -1) {
                                        Promise.resolve(true);
                                    }
                                })
                            });
                        }).then((object1) => {
                            return Promise.resolve(object1);
                        })      
                    })
                }
            }).then(() => {
                
            }).catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            });
        } else {
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        })
        .catch(err => {
            console.log('ejhd', err);
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateById(lesson:LessonsModel, lessons: any):Promise<any> {
        
        return Promise.
        then(() => {
                return StandardUseCase.findByQuery( q=> {
                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, lesson.standardId);
                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                })
        }).then((object) => {
            if (object && 0 < object.models.length) {
            return SubjectUseCase.findByQuery(q => {
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, lesson.subjectId);
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        } else {
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        })
        .then((object) => {
            if (object && 0 < object.models.length) {
              return this.updateSyllabus(lesson.standardId, lesson.subjectId, lessons);
        } else {
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }

public updateSyllabus(standardId, subjectId, lessons) {
    let check = false;
        return Promise.then(() => {
            return Promise.each(lessons, (obj: any) => {
                if (!check) {
                    return Promise.then(() => {
                        return this.findByQuery(q => {
                            q.whereNot(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.ID}`, obj.id);
                            q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                            q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                            q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.LESSON_NAME}`, obj.lessonName);
                        q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.limit(1);
                    }, []);
                        }).then((objLesson) => {
                            if (objLesson && 0 < objLesson.models.length) {
                                check = true;
                            }
                        })
                }
            }).then(() => {
                if (check) {
                    return Promise.reject(new Exception(
                                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                                    MessageInfo.MI_LESSIONS_ALREADY_EXISTS,
                                    false,
                                    HttpStatus.BAD_REQUEST
                    ));
                } else {
                    return Promise.then(() => {
                        Promise.each(lessons, (obj: any, i) => {
                            return Promise.then(() => {
                                return Promise.then(() => {
                                    return this.findByQuery((q) => {
                                        q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.ID}`, obj.id);
                                        q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                                    })
                                }).then((obj2) => {
                                    console.log('fhghfhgfhg');
                                    if (obj2 && 0 < obj2.models.length) {
                                        let adminuser = obj2.models[0];
                                        const lessonData = {
                                            body: {
                                                standardId: standardId,
                                                subjectId: subjectId,
                                                lessonName: obj.lessonName,
                                                status: obj.status
                                            }
                                        }
                                        const lessonModel = LessonsModel.fromRequest(lessonData);
                                        let data = lessonModel.toDto();
                                        return adminuser.save(data, {patch: true});
                                    } else if (obj.lessonName) {
                                        const lessonData = {
                                            body: {
                                                standardId: standardId,
                                                subjectId: subjectId,
                                                lessonName: obj.lessonName
                                            }
                                        }
                                        const lessonModel = LessonsModel.fromRequest(lessonData);
                                        return LessonsDto.create(LessonsDto, lessonModel.toDto()).save();
                                    }
                                }).then(() => {
                                    if (i === lessons.length -1) {
                                        Promise.resolve(true);
                                    }
                                })
                            });
                        }) 
                    });
                }
            })
        });
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
                    userData[LessonsTableSchema.FIELDS.IS_DELETED] = 1;
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
export default new LessonsUseCase();
