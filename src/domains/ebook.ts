
import { EBookDto, EBookUploadDto } from "../data/models";
import {Utils} from "../libs/utils";
import {EbookModel, Exception, EbookUploadModel} from "../models";
import { EbookTableSchema, StandardTableSchema, SubjectTableSchema, EbookUploadTableSchema } from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";
import { StandardUseCase, SubjectUseCase, EbookUploadUseCase } from ".";
const objEbookIds = {};

export class EbookUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = EBookDto;
    }

    public create(ebook:EbookModel, ebooks: any):Promise<any> {
        return Promise.then(() => {
            return StandardUseCase.findByQuery( q=> {
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, ebook.standardId);
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then((object) => {
            if (object && 0 < object.models.length) {
            return SubjectUseCase.findByQuery(q => {
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, ebook.subjectId);
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
                return EBookDto.create(EBookDto, ebook.toDto()).save();
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_SUBJECT_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));    
            }
        })
        .then((object) => {
            if (object) {
                return this.findById(object.get('rid'));
            }
        }).then((object) => {
            if (object) {
                let ebookId = object.get('id');
            Promise.each(ebooks, (obj: any) => {
                    return Promise.then(() => {
                        const ebookData = {
                            body: {
                                name: obj.ebookName,
                                ebookUrl: obj.ebookUrl,
                                ebookId: ebookId,
                            }
                        }
                        const ebookModel = EbookUploadModel.fromRequest(ebookData);
                        return EBookUploadDto.create(EBookUploadDto, ebookModel.toDto()).save();
                    });
            }).then((obj) => {
                return Promise.resolve(obj);
            })
        } else {
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_EBOOK_CREATION_FAILED,
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


    public updateById(ebook:EbookModel, ebooks: any):Promise<any> {
        let ebookId = 0;
        return Promise.
        then(() => {
                return StandardUseCase.findByQuery( q=> {
                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, ebook.standardId);
                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                })
        }).then((object) => {
            if (object && 0 < object.models.length) {
            return SubjectUseCase.findByQuery(q => {
                q.where(`${SubjectTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, ebook.subjectId);
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
                return this.findByQuery((q) => {
                    q.where(`${EbookTableSchema.TABLE_NAME}.${EbookTableSchema.FIELDS.STANDARD_ID}`, ebook.standardId);
                    q.where(`${EbookTableSchema.TABLE_NAME}.${EbookTableSchema.FIELDS.SUBJECT_ID}`, ebook.subjectId);
                    q.where(`${EbookTableSchema.TABLE_NAME}.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
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
        .then((object) => {
            if (object && 0 < object.models.length) {
                ebookId = object.models[0].get('id');
                return Promise.void;
            } else {
                delete ebook['id'];
                return EBookDto.create(EBookDto, ebook.toDto()).save();
            }
        })
        .then((obj) => {
            console.log('dkfjds1', obj);
            if (obj) {
                console.log('dkfjds');
                return this.findById(obj.get('rid'));
            }
        })
        .then((obj) => {
            console.log('sdfjsdfd', obj);
            if (obj) {
                return this.updateEbook(ebooks, obj.get('id'), ebook);
            } else {
                return this.updateEbook(ebooks, ebookId, ebook);
            }
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }

public updateEbook(ebooks, id, ebook) {
        return Promise.then(() => {
            Promise.each(ebooks, (obj: any, i) => {
                        return Promise.then(() => {
                            return EbookUploadUseCase.findByQuery((q) => {
                                q.where(`${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.ID}`, obj.id);
                                q.where(`${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.IS_DELETED}`, 0);
                            })
                        }).then((obj2) => {
                            console.log(obj2.models, obj)
                            if (obj2 && 0 < obj2.models.length) {
                                let adminuser = obj2.models[0];
                                const ebookData = {
                                    body: {
                                        name: obj.ebookName,
                                        ebookUrl: obj.ebookUrl,
                                    }
                                }
                                const ebookModel = EbookUploadModel.fromRequest(ebookData);
                                let data = ebookModel.toDto();
                                return adminuser.save(data, {patch: true});
                            } else if (obj.ebookName) {
                                const ebookData = {
                                    body: {
                                        name: obj.ebookName,
                                        ebookUrl: obj.ebookUrl,
                                        ebookId: id
                                    }
                                }
                                const ebookModel = EbookUploadModel.fromRequest(ebookData);
                                return EBookUploadDto.create(EBookUploadDto, ebookModel.toDto()).save();
                            }
                        }).then((ebookobj1) => {
                            if (ebookobj1) {
                                return EbookUploadUseCase.findByQuery((q) => {
                                    q.where(`${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.RID}`, ebookobj1.get('rid'));
                                    q.where(`${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.IS_DELETED}`, 0);
                                })
                            }
                        }).then((ebookobj2) => {
                            if (ebookobj2.models.length) {
                                objEbookIds['id' + ebookobj2.models[0].get('id')] = ebookobj2.models[0].get('id');
                            }
                            if (i === ebooks.length -1) {
                                this.removeIfNotExists(ebook);
                                Promise.resolve(true);
                            }
                        })
                    });
        });
}
    public destroyById(rid:string):any {
        let adminUser: any;
        return Promise.then(() => {
            return this.findById(rid);
        })
        .then((object) => {
            if (object) {
                adminUser = object;
                return EbookUploadUseCase.deleteByQuery((q) => {
                    q.where(`${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.EBOOK_ID}`, adminUser.get('id'));
                })
            }
        })
        .then(object => {
            if (object) {
                    let userData = {};
                    userData[EbookTableSchema.FIELDS.IS_DELETED] = 1;
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

    private removeIfNotExists(ebook1) {
        return Promise.then(() => {
            return EbookUploadUseCase.findByQuery(q => {
                q.select(`${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.ID}`);
                q.where(`${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${EbookTableSchema.TABLE_NAME} as eb`,
                `eb.${EbookTableSchema.FIELDS.ID}`, `${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.EBOOK_ID}`);
                q.where(`eb.${EbookTableSchema.FIELDS.STANDARD_ID}`, ebook1.standardId);
                q.where(`eb.${EbookTableSchema.FIELDS.SUBJECT_ID}`, ebook1.subjectId);
                q.where(`eb.${EbookTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then((object) => {
            if (object && object.models.length) {
                return Promise.each(object.models, (ebook: any, i) => {
                    if (ebook.get('id')
                    && !objEbookIds['id' + ebook.get('id')]) {
                        return Promise.then(() => {
                            return EbookUploadUseCase.deleteByQuery((q) => {
                                q.where(`${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.ID}`, ebook.get('id'));
                            });
                        });
                    }
                })
            }
        })
    }
}
export default new EbookUseCase();
