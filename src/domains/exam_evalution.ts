
import { ExamEvalutionDto } from "../data/models";
import {Utils} from "../libs/utils";
import {ExamEvalutionModel, Exception, HomeWorkModel} from "../models";
import { ExamEvalutionTableSchema,
         AdminUserTableSchema,
         ExamTableSchema, 
         SubjectTableSchema} from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";
import { ExamUseCase, AdminUserUseCase, SubjectUseCase } from ".";

export class ExamEvalutionUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = ExamEvalutionDto;
    }

    public create(evalutionList:ExamEvalutionModel[]):Promise<any> {
        let check = false;
        return Promise.then(() => {
            return Promise.each(evalutionList, (evalution) => {
                if (!check) {
                    return Promise.then(() => {
                        return AdminUserUseCase.findByQuery(q => {
                            q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`, evalution.studentId);
                            q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                            q.limit(1);
                        }, []);
                    })
                    .then(object => {
                        if (object && object.models && 0 < object.models.length) {
                            return ExamUseCase.findByQuery(q => {
                                q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.EXAM_ID}`, evalution.examId);
                                q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.IS_DELETED}`, 0);
                                q.limit(1);
                            }, []);
                        } else {
                            check = true;
                        }
                    }).then(object => {
                        if (object && object.models && 0 < object.models.length) {
                            return SubjectUseCase.findByQuery(q => {
                                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, evalution.subjectId);
                                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                                q.limit(1);
                            }, []);
                        } else {
                            check = true;
                        }
                    }).then((object) => {
                        if (object && object.models && 0 === object.models.length) {
                            check = true;
                        }
                    });
                }
            })
        }).then(obj => {
            if (check) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_EXAM_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));        
            } else {
                    Promise.each(evalutionList, (evalution) => {
                        return Promise.then(() => {
                            return ExamEvalutionDto.create(ExamEvalutionDto, evalution.toDto()).save();
                        });
                    }).then(() => {
                        return Promise.void;
                    })
            }
        }).catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateById(evalutionList:ExamEvalutionModel[]):Promise<any> {
        let check = false;
        return Promise.then(() => {
            return Promise.each(evalutionList, (evalution) => {
                if (!check) {
                    return Promise.then(() => {
                        return AdminUserUseCase.findByQuery(q => {
                            q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`, evalution.studentId);
                            q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                            q.limit(1);
                        }, []);
                    })
                    .then(object => {
                        if (object && object.models && 0 < object.models.length) {
                            return ExamUseCase.findByQuery(q => {
                                q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.EXAM_ID}`, evalution.examId);
                                q.where(`${ExamTableSchema.TABLE_NAME}.${ExamTableSchema.FIELDS.IS_DELETED}`, 0);
                                q.limit(1);
                            }, []);
                        } else {
                            check = true;
                        }
                    }).then(object => {
                        if (object && object.models && 0 < object.models.length) {
                            return SubjectUseCase.findByQuery(q => {
                                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, evalution.subjectId);
                                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                                q.limit(1);
                            }, []);
                        } else {
                            check = true;
                        }
                    }).then((object) => {
                        if (object && object.models && 0 === object.models.length) {
                            check = true;
                        }
                    });
                }
            })
        }).then(obj => {
            if (check) {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_EXAM_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));        
            } else {
                    Promise.each(evalutionList, (evalution) => {
                        return Promise.then(() => {
                            if (evalution.id) {
                                return this.findByQuery((q) => {
                                    q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.ID}`, evalution.id);
                                    q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                                    q.limit(1);
                                });
                            }
                            return Promise.void;
                        }).then((object) => {
                            if (object && object.models && 0 < object.models.length) {
                                const adminUser = object.models[0];
                                let data = evalution.toDto();
                                return adminUser.save(data, {patch: true});
                            } else {
                                return Promise.then(() => {
                                    return this.findByQuery((q) => {
                                        q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.STUDENT_ID}`, evalution.studentId);
                                        q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.EXAM_ID}`, evalution.examId);
                                        q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.SUBJECT_ID}`, evalution.subjectId);
                                        q.where(`${ExamEvalutionTableSchema.TABLE_NAME}.${ExamEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
                                        q.limit(1);
                                    });
                                }).then((objects) => {
                                    if (objects && objects.models && 0 < objects.models.length) {
                                        const adminUser = objects.models[0];
                                        let data = evalution.toDto();
                                        console.log(adminUser, data);
                                        return adminUser.save(data, {patch: true});
                                    } else {
                                        return ExamEvalutionDto.create(ExamEvalutionDto, evalution.toDto()).save();
                                    }
                                });
                            }
                        });
                    }).then(() => {
                        return Promise.void;
                    })
            }
        }).catch(err => {
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
                    userData[ExamEvalutionTableSchema.FIELDS.IS_DELETED] = 1;
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
export default new ExamEvalutionUseCase();
