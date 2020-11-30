
import { MarkEvalutionDto } from "../data/models";
import {Utils} from "../libs/utils";
import {MarkEvalutionModel, Exception, HomeWorkModel} from "../models";
import { MarkEvalutionTableSchema,
         AdminUserTableSchema,
         HomeWorkTableSchema } from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";
import { HomeWorkUseCase, AdminUserUseCase } from ".";

export class MarkEvalutionUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = MarkEvalutionDto;
    }

    public create(evalutionList:MarkEvalutionModel[]):Promise<any> {
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
                            return HomeWorkUseCase.findByQuery(q => {
                                q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.ID}`, evalution.homeWorkId);
                                q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.IS_DELETED}`, 0);
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
                    MessageInfo.MI_STUDENT_OR_HOMEWORK_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));        
            } else {
                    Promise.each(evalutionList, (evalution) => {
                        return Promise.then(() => {
                            return MarkEvalutionDto.create(MarkEvalutionDto, evalution.toDto()).save();
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


    public updateById(evalutionList:MarkEvalutionModel[]):Promise<any> {
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
                            return HomeWorkUseCase.findByQuery(q => {
                                q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.ID}`, evalution.homeWorkId);
                                q.where(`${HomeWorkTableSchema.TABLE_NAME}.${HomeWorkTableSchema.FIELDS.IS_DELETED}`, 0);
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
                    MessageInfo.MI_STUDENT_OR_HOMEWORK_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));        
            } else {
                    Promise.each(evalutionList, (evalution) => {
                        return Promise.then(() => {
                            return this.findByQuery((q) => {
                                q.where(`${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.EVALUTION_ID}`, evalution.evalutionId);
                                q.where(`${MarkEvalutionTableSchema.TABLE_NAME}.${MarkEvalutionTableSchema.FIELDS.IS_DELETED}`, 0);
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
                    userData[MarkEvalutionTableSchema.FIELDS.IS_DELETED] = 1;
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
export default new MarkEvalutionUseCase();
