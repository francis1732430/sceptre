
import { EbookUseCase, EbookUploadUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, EbookModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { EbookTableSchema, StandardTableSchema, SubjectTableSchema, EbookUploadTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";
import * as formidable from "formidable";
import {Uploader} from "../../libs";
import * as UUID from "node-uuid";

export class LessonsHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let ebook = EbookModel.fromRequest(req);
        if (!Utils.requiredCheck(ebook.standardId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(ebook.subjectId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(req.body.ebooks)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EBOOKS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return EbookUseCase.create(ebook, req.body.ebooks);
        })
        .then(object => {
            let data  ={};
            data["message"] = "Created successfully";
            res.json(data);
        })
        .catch(err => {
            console.log(err)
            Utils.responseError(res, err);
        });
    }

    public static list(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let offset = parseInt(req.query.offset) || null;
        let limit = parseInt(req.query.limit) || null;
        let standardId = parseInt(req.query.standardId) || null;
        let subjectId = parseInt(req.query.subjectId) || null;
        let sortKey;
        let sortValue;
        let searchobj = [];
        for (let key in req.query) {
            if(key=='sortKey'){
                sortKey = req.query[key];
            }
            else if(key=='sortValue'){
                sortValue = req.query[key];
            } else if(req.query[key]!='' && key!='limit' && key!='offset' && key!='sortKey' && key!='sortValue'){
                searchobj[key] = req.query[key];
            }
        }
        let adminuser:any;

        let total = 0;
        return Promise.then(() => {
            return EbookUploadUseCase.countByQuery(q => {
                q.where(`${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`st.${EbookTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`su.${EbookTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`eb.${EbookTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${EbookTableSchema.TABLE_NAME} as eb`, `eb.${EbookTableSchema.FIELDS.ID}`, `${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.EBOOK_ID}`);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`, `eb.${EbookTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, `eb.${EbookTableSchema.FIELDS.SUBJECT_ID}`);
                if (standardId && subjectId) {
                    q.where(`eb.${EbookTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    q.where(`eb.${EbookTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                }
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!='' && !standardId && !subjectId){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            condition = `(${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.NAME} LIKE "%${searchval}%" or
                            eb.${EbookTableSchema.FIELDS.CREATED_DATE} LIKE "%${searchval}%" or
                            eb.${EbookTableSchema.FIELDS.UPDATED_DATE} LIKE "%${searchval}%" or
                            st.${StandardTableSchema.FIELDS.STANDARD_NAME} LIKE "%${searchval}%" or
                            su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} LIKE "%${searchval}%" or
                            
                            ${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.UPDATED_DATE} LIKE "%${searchval}%" or
                            eb.${EbookTableSchema.FIELDS.ID} LIKE "%${searchval}%")`
                            q.andWhereRaw(condition);
                        }
                    }
                }  
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return EbookUploadUseCase.findByQuery(q => {
                  q.select(`${EbookUploadTableSchema.TABLE_NAME}.*`,
                  `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                  `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                  `eb.${EbookTableSchema.FIELDS.STANDARD_ID}`,
                  `eb.${EbookTableSchema.FIELDS.SUBJECT_ID}`,
                  `eb.${EbookTableSchema.FIELDS.ID} as ebooksId`,
                  `eb.${EbookTableSchema.FIELDS.RID} as ebookRid`,)
                  
                  q.where(`${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`st.${EbookTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`su.${EbookTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`eb.${EbookTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${EbookTableSchema.TABLE_NAME} as eb`, `eb.${EbookTableSchema.FIELDS.ID}`, `${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.EBOOK_ID}`);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`, `eb.${EbookTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, `eb.${EbookTableSchema.FIELDS.SUBJECT_ID}`);
                if (standardId && subjectId) {
                    q.where(`eb.${EbookTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    q.where(`eb.${EbookTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                }
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!='' && !standardId && !subjectId){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            condition = `(${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.NAME} LIKE "%${searchval}%" or
                            eb.${EbookTableSchema.FIELDS.CREATED_DATE} LIKE "%${searchval}%" or
                            eb.${EbookTableSchema.FIELDS.UPDATED_DATE} LIKE "%${searchval}%" or
                            st.${StandardTableSchema.FIELDS.STANDARD_NAME} LIKE "%${searchval}%" or
                            su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} LIKE "%${searchval}%" or
                            
                            ${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.UPDATED_DATE} LIKE "%${searchval}%" or
                            eb.${EbookTableSchema.FIELDS.ID} LIKE "%${searchval}%")`
                            q.andWhereRaw(condition);
                        }
                    }
                }
                    if (offset != null) {
                        q.offset(offset);
                    }
                    if (limit != null) {
                        q.limit(limit);
                    }
                    if (sortKey != null && sortValue != '') {
                        if (sortKey != null && (sortValue == 'ASC' || sortValue == 'DESC' || sortValue == 'asc' || sortValue == 'desc')) {
                            let ColumnSortKey = Utils.changeSearchKey(sortKey);
                            if (sortKey == 'id') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'standardName') {
                                q.orderBy(`st.${ColumnSortKey}`, sortValue);
                            } else if (sortKey == 'subjectName') {
                                q.orderBy(`su.${ColumnSortKey}`, sortValue);
                            } else if (sortKey == 'name') {
                                q.orderBy(`${EbookUploadTableSchema.TABLE_NAME}.${ColumnSortKey}`, sortValue);
                            } else if (sortKey == 'ebookUrl') {
                                q.orderBy(`${EbookUploadTableSchema.TABLE_NAME}.${ColumnSortKey}`, sortValue);
                            }
                        } else {
                            q.orderBy(`${EbookTableSchema.TABLE_NAME}.${EbookTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                        }
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    const studentIds = {};
                        object.models.forEach((obj) => {
                            if (studentIds['st'+obj.get('standard_id')+'su'+obj.get('subject_id')]) {
                                const studentObj = studentIds['st'+obj.get('standard_id')+'su'+obj.get('subject_id')];
                                studentObj.ebooks.push({
                                    id: obj.get('id'),
                                    rid: obj.get('rid'),
                                    createdDate: obj.get('created_date'),
                                    updatedDate: obj.get('updated_date'),
                                    ebookUrl: obj.get('ebook_url'),
                                    ebookName: obj.get('name'),
                                });
                            }
                            else {
                                studentIds['st'+obj.get('standard_id')+'su'+obj.get('subject_id')] = {
                                subjectId: obj.get('subject_id'),
                                standardId: obj.get('standard_id'),
                                standardName: obj.get('standardName'),
                                subjectName: obj.get('subjectName'),
                                id: obj.get('ebooksId'),
                                rid: obj.get('ebookRid'),
                                ebooks: [{
                                    id: obj.get('id'),
                                    rid: obj.get('rid'),
                                    createdDate: obj.get('created_date'),
                                    updatedDate: obj.get('updated_date'),
                                    ebookUrl: obj.get('ebook_url'),
                                    ebookName: obj.get('name'),
                                }],
                            };
                            ret.push(studentIds['st'+obj.get('standard_id')+'su'+obj.get('subject_id')]);
                        }
                    });
                }
                

                res.header(Properties.HEADER_TOTAL, total.toString(10));

                if (offset != null) {
                    res.header(Properties.HEADER_OFFSET, offset.toString(10));
                }
                if (limit != null) {
                    res.header(Properties.HEADER_LIMIT, limit.toString(10));
                }

                res.json(ret);
            })
            .catch(err => {
                console.log(err);
                Utils.responseError(res, err);
            });
    }
 
    public static getById(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let rid = req.params.rid || "";
        let standardId = parseInt(req.query.standardId) || null;
        let subjectId = parseInt(req.query.subjectId) || null;
        let adminuser:any;
        return Promise.then(() => {
            return EbookUploadUseCase.findByQuery(q => {
                q.select(`${EbookUploadTableSchema.TABLE_NAME}.*`,
                  `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                  `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                  `eb.${EbookTableSchema.FIELDS.STANDARD_ID}`,
                  `eb.${EbookTableSchema.FIELDS.SUBJECT_ID}`,
                  `eb.${EbookTableSchema.FIELDS.ID} as ebooksId`,
                  `eb.${EbookTableSchema.FIELDS.RID} as ebookRid`,)
                  
                  q.where(`${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`st.${EbookTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`su.${EbookTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`eb.${EbookTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${EbookTableSchema.TABLE_NAME} as eb`, `eb.${EbookTableSchema.FIELDS.ID}`, `${EbookUploadTableSchema.TABLE_NAME}.${EbookUploadTableSchema.FIELDS.EBOOK_ID}`);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`, `eb.${EbookTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`, `eb.${EbookTableSchema.FIELDS.SUBJECT_ID}`);
                if (standardId && subjectId) {
                    q.where(`eb.${EbookTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    q.where(`eb.${EbookTableSchema.FIELDS.SUBJECT_ID}`, subjectId);
                }
            }) 
        })
        .then((object) => {
            adminuser = object;
            if (adminuser && adminuser.models.length === 0) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_EBOOKS_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                const ret = [];
                const studentIds = {};
                object.models.forEach((obj) => {
                    if (studentIds['st'+obj.get('standard_id')+'su'+obj.get('subject_id')]) {
                        const studentObj = studentIds['st'+obj.get('standard_id')+'su'+obj.get('subject_id')];
                        studentObj.ebooks.push({
                            id: obj.get('id'),
                            rid: obj.get('rid'),
                            createdDate: obj.get('created_date'),
                            updatedDate: obj.get('updated_date'),
                            ebookUrl: obj.get('ebook_url'),
                            ebookName: obj.get('name'),
                        });
                    }
                    else {
                        studentIds['st'+obj.get('standard_id')+'su'+obj.get('subject_id')] = {
                        subjectId: obj.get('subject_id'),
                        standardId: obj.get('standard_id'),
                        standardName: obj.get('standardName'),
                        subjectName: obj.get('subjectName'),
                        id: obj.get('ebooksId'),
                        rid: obj.get('ebookRid'),
                        ebooks: [{
                            id: obj.get('id'),
                            rid: obj.get('rid'),
                            createdDate: obj.get('created_date'),
                            updatedDate: obj.get('updated_date'),
                            ebookUrl: obj.get('ebook_url'),
                            ebookName: obj.get('name'),
                        }],
                    };
                    ret.push(studentIds['st'+obj.get('standard_id')+'su'+obj.get('subject_id')]);
                }
            });
                    res.json(ret);
            }
        })
        .catch(err => {
            console.log(err);
            Utils.responseError(res, err);
        });
    }

    public static update(req: express.Request, res: express.Response): any {
        let rid = req.params.rid || "";
        let ebook = EbookModel.fromRequest(req);
        if (!Utils.requiredCheck(ebook.standardId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(ebook.subjectId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(req.body.ebooks)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_EBOOKS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return EbookUseCase.updateById(ebook, req.body.ebooks);
        })
            .then(object => {
                let userData = {};
                userData["message"] = "Updated successfully";
                res.json(userData);
            })
            .catch(err => {
                Utils.responseError(res, err);
            });
    }

    public static destroy(req: express.Request, res: express.Response): any {
        let rid = req.params.rid || "";
        return Promise.then(() => {
            return EbookUseCase.findByQuery(q => {
                q.where(`${EbookTableSchema.TABLE_NAME}.${EbookTableSchema.FIELDS.RID}`, rid);
                q.where(`${EbookTableSchema.TABLE_NAME}.${EbookTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then(object => {
            if (object && object.models.length) {
                return EbookUseCase.destroyById(rid);
            }
            Utils.responseError(res, new Exception(
                ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                MessageInfo.MI_USER_NOT_EXIST,
                false, 
                HttpStatus.BAD_REQUEST
            ));
            return Promise.break;
        })
        .then(() => {
            res.status(HttpStatus.NO_CONTENT);
            res.json({});
        })
        .catch(err => {
            console.log(err)
            Utils.responseError(res, err);
        });
    }

    public static uploadFile(req:express.Request, res:express.Response):any {
        let form = new formidable.IncomingForm();
        req.setTimeout(900000)
        form.maxFileSize= 15 * 1024 * 1024;
        form.parse(req, (err:any, fields:formidable.Fields, files:formidable.Files) => {
            let avatar = files[Properties.FORM_FILE];
            if (avatar == null || avatar.path == null || avatar.name == null) {
                return res.json(new Exception(
                    ErrorCode.RESOURCE.INVALID_REQUEST,
                    MessageInfo.MI_FILE_UPLOAD_NOT_EMPTY,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            return Promise.then(() => {
                let ext = Utils.extractType(avatar.type);
                let name = UUID.v4();
                return Uploader.uploadDocument(avatar.path, `${name}.${ext}`);
            })
            .then(exportLink => {
                let data = {};
                data["link"] = exportLink.key;
                data["location"] = exportLink.Location;
                res.json(data);
            })
            .catch(error => {
                Utils.responseError(res, error);
            });
        });
}
}

}

export default LessonsHandler;
