
import { AttendanceDto } from "../data/models";
import {Utils} from "../libs/utils";
import {AttendanceModel, Exception} from "../models";
import { ExamEvalutionTableSchema,
         AdminUserTableSchema,
         StandardTableSchema, 
         SectionTableSchema,
         ClassTableSchema,
         AttendanceTableSchema} from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";
import { StandardUseCase, AdminUserUseCase, SectionUseCase, ClassUseCase } from ".";

export class AttendanceUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = AttendanceDto;
    }

    public create(evalutionList:AttendanceModel[]):Promise<any> {
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
                            return StandardUseCase.findByQuery(q => {
                                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, evalution.standardId);
                                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                                q.limit(1);
                            }, []);
                        } else {
                            check = true;
                        }
                    }).then(object => {
                        if (object && object.models && 0 < object.models.length) {
                            return SectionUseCase.findByQuery(q => {
                                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`, evalution.sectionId);
                                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                                q.limit(1);
                            }, []);
                        } else {
                            check = true;
                        }
                    }).then(object => {
                        if (object && object.models && 0 < object.models.length) {
                            return ClassUseCase.findByQuery(q => {
                                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, evalution.sectionId);
                                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, evalution.standardId);
                                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
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
            }).then(obj => {
                if (check) {
                    return Promise.reject(new Exception(
                        ErrorCode.RESOURCE.USER_NOT_FOUND,
                        MessageInfo.MI_ATTENDANCE_NOT_FOUND,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));        
                } else {
                        Promise.each(evalutionList, (evalution) => {
                            return Promise.then(() => {
                                return AttendanceDto.create(AttendanceDto, evalution.toDto()).save();
                            });
                        }).then(() => {
                            return Promise.void;
                        })
                }
            })
        }).catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateById(evalutionList:AttendanceModel[]):Promise<any> {
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
                            return StandardUseCase.findByQuery(q => {
                                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, evalution.standardId);
                                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                                q.limit(1);
                            }, []);
                        } else {
                            check = true;
                        }
                    }).then(object => {
                        if (object && object.models && 0 < object.models.length) {
                            return SectionUseCase.findByQuery(q => {
                                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`, evalution.sectionId);
                                q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                                q.limit(1);
                            }, []);
                        } else {
                            check = true;
                        }
                    }).then(object => {
                        if (object && object.models && 0 < object.models.length) {
                            return ClassUseCase.findByQuery(q => {
                                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, evalution.sectionId);
                                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, evalution.standardId);
                                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                                q.limit(1);
                            }, []);
                        } else {
                            check = true;
                        }
                    }).then(object => {
                        if (object && object.models && 0 < object.models.length) {
                            return this.findByQuery((q) => {
                                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.ID}`, evalution.id);
                                q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
                                q.limit(1);
                            });
                        } else {
                            check = true;
                        }
                    }).then((object) => {
                        if (object && object.models && 0 === object.models.length) {
                            check = true;
                        }
                    });
                }
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
                                return this.findByQuery((q) => {
                                    q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.ID}`, evalution.id);
                                    q.where(`${AttendanceTableSchema.TABLE_NAME}.${AttendanceTableSchema.FIELDS.IS_DELETED}`, 0);
                                    q.limit(1);
                                });
                            }).then((object) => {
                                if (object && object.models && 0 < object.models.length) {
                                    const adminUser = object.models[0];
                                    let data = evalution.toDto();
                                    return adminUser.save(data, {patch: true});
                                }
                            });
                        }).then(() => {
                            return Promise.void;
                        })
                }
            })
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
export default new AttendanceUseCase();
