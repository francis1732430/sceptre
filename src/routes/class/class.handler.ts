
import { ClassUseCase, SubjectAssigneeUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, ClassModel, SubjectAssigneeModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { ClassTableSchema, SubjectAssigneesTableSchema, StandardTableSchema, SectionTableSchema, AdminUserTableSchema, SubjectTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";

export class ClassHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let classObj = ClassModel.fromRequest(req);
        if (!Utils.requiredCheck(classObj.className)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_CLASS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(classObj.standardId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(classObj.sectionId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_SECTION_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(req.body.subjectAssignees)
        || req.body.subjectAssignees.length === 0) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_SUBJECT_ASSSINEE_IDS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return ClassUseCase.create(req.body);
        })
        .then(object => {
            let data  ={};
            data["message"] = 'created Successfully';
            res.json(data);
        })
        .catch(err => {
            Utils.responseError(res, err);
        });
    }

    public static list(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let offset = parseInt(req.query.offset) || null;
        let limit = parseInt(req.query.limit) || null;
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
            return ClassUseCase.countByQuery(q => {
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`,
                `${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`,
                `st.${StandardTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`,
                `${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`,
                `sec.${SectionTableSchema.FIELDS.SECTION_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`,
                `${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.CREATED_BY_ID}`,
                `ad.${AdminUserTableSchema.FIELDS.USER_ID}`);
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);

                if (searchobj) {
                    for (let key in searchobj) {
                        if (key === 'standardId') {
                            q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, searchobj[key]);
                        }
                        if (key === 'sectionId') {
                            q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, searchobj[key]);
                        }
                        if(searchobj[key]!=null && searchobj[key]!='' && key !== 'standardId' && key !== 'sectionId'){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            condition = `(${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.CLASS_ID} LIKE "%${searchval}%" or
                            ${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.CLASS_NAME} LIKE "%${searchval}%" or
                            st.${StandardTableSchema.FIELDS.STANDARD_NAME} LIKE "%${searchval}%" or
                            sec.${SectionTableSchema.FIELDS.SECTION_NAME} LIKE "%${searchval}%")`
                            q.andWhereRaw(condition);
                        }
                    }
                }  
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return ClassUseCase.findByQuery(q => {
                    q.select(`${ClassTableSchema.TABLE_NAME}.*`,
                `st.${StandardTableSchema.FIELDS.STANDARD_NAME}`,
                `sec.${SectionTableSchema.FIELDS.SECTION_NAME}`,
                `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as createdByName`)
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`,
                `${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`,
                `st.${StandardTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`,
                `${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`,
                `sec.${SectionTableSchema.FIELDS.SECTION_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`,
                `${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.CREATED_BY_ID}`,
                `ad.${AdminUserTableSchema.FIELDS.USER_ID}`);
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                    if (searchobj) {
                        for (let key in searchobj) {
                            if (key === 'standardId') {
                                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, searchobj[key]);
                            }
                            if (key === 'sectionId') {
                                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, searchobj[key]);
                            }
                            if(searchobj[key]!=null && searchobj[key]!='' && key !== 'standardId' && key !== 'sectionId'){
                                let searchval = searchobj[key];
                                let ColumnKey = Utils.changeSearchKey(key);
                                let condition;
                                condition = `(${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.CLASS_ID} LIKE "%${searchval}%" or
                            ${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.CLASS_NAME} LIKE "%${searchval}%" or
                            st.${StandardTableSchema.FIELDS.STANDARD_NAME} LIKE "%${searchval}%" or
                            sec.${SectionTableSchema.FIELDS.SECTION_NAME} LIKE "%${searchval}%")`
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
                            if (sortKey == 'classId') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'className') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'standardName') {
                                q.orderBy(ColumnSortKey, sortValue);
                            } else if (sortKey == 'sectionName') {
                                q.orderBy(ColumnSortKey, sortValue);
                            }
                        } else {
                            q.orderBy(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                        }
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    object.models.forEach(obj => {
                        let classData = ClassModel.fromDto(obj);
                        classData['createdByName'] = obj.get('createdByName');
                        ret.push(classData);
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
                Utils.responseError(res, err);
            });
    }
 
    public static getById(req: express.Request, res: express.Response): any {
        let standardId = req.params.standardId || "";
        let sectionId = req.params.sectionId || "";
        let adminuser:any;
        return Promise.then(() => {
            return ClassUseCase.findByQuery(q => {
                q.select(`${ClassTableSchema.TABLE_NAME}.*`,
                `st.${StandardTableSchema.FIELDS.STANDARD_NAME}`,
                `sec.${SectionTableSchema.FIELDS.SECTION_NAME}`)
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, standardId);
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, sectionId);
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`,
                `${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`,
                `st.${StandardTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`,
                `${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`,
                `sec.${SectionTableSchema.FIELDS.SECTION_ID}`);
                q.limit(1);
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
            }) 
        })
        .then((object) => {
            adminuser = object;
            if (adminuser && adminuser.models.length === 0) {
                res.json([]);
                return Promise.break;
            } else {
                const classObject = adminuser.models[0].get('subject_assignee_ids');
                const arrayOfIds = classObject.split(',');
                return SubjectAssigneeUseCase.findByQuery(q => {
                    q.select(`${SubjectAssigneesTableSchema.TABLE_NAME}.*`,
                    `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as teacherName`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID} as teacherUserId`,
                    `ad.${AdminUserTableSchema.FIELDS.PHONE_NUMBER} as teacherPhoneNumber`);
                    q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`,
                    `${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.SUBJECT_ID}`);
                    q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.ASSIGNEE_ID}`);
                    q.whereIn(`${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.ID}`, arrayOfIds);
                    q.where(`${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`su.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                });
            }
        }).then((object) => {
            const ret = [];
            if (object != null && object.models != null) {
                object.models.forEach(obj => {
                    let assigneeUseData = SubjectAssigneeModel.fromDto(obj);
                    assigneeUseData['subjectName'] = obj.get('subjectName');
                    assigneeUseData['teacherName'] = obj.get('teacherName');
                    assigneeUseData['teacherUserId'] = obj.get('teacherUserId');
                    assigneeUseData['teacherPhoneNumber'] = obj.get('teacherPhoneNumber');
                    ret.push(assigneeUseData);
                });
            }
            let classObjects = ClassModel.fromDto(adminuser.models[0]);
            classObjects['subjectAssignees'] = ret;
            res.json(classObjects);
        })
        .catch(err => {
            Utils.responseError(res, err);
        });
    }

    public static update(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let rid = req.params.rid || "";
        let classObj = ClassModel.fromRequest(req);
        if (!Utils.requiredCheck(classObj.className)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_CLASS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(classObj.standardId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(classObj.sectionId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_SECTION_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(req.body.subjectAssignees)
        || req.body.subjectAssignees.length === 0) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_SUBJECT_ASSSINEE_IDS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return ClassUseCase.updateById(rid, req.body);
        })
            .then(object => {
                let userData = ClassModel.fromDto(object);
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
            return ClassUseCase.findByQuery(q => {
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.RID}`, rid);
                q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then((object) => {
            if (object && object.models.length) {
                const assigneeIds = object.models[0].get('subject_assignee_ids');
                const arrayOfIds = assigneeIds.split(',');
                Promise.each(arrayOfIds, (id) => {
                    return Promise.then(() => {
                        return SubjectAssigneeUseCase.findOne((q) => {
                            q.where(`${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.ID}`, id);
                            q.where(`${SubjectAssigneesTableSchema.TABLE_NAME}.${SubjectAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                        })
                    }).then((object) => {
                        if (object) {
                            let userData = {};
                            userData[SubjectAssigneesTableSchema.FIELDS.IS_DELETED] = 1;
                            return object.save(userData, {patch: true});
                        }
                    })
                }).then(() => {
                    return ClassUseCase.destroyById(rid);
                })
            } else {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_CLASS_NOT_FOUND,
                    false, 
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            }
        })
        .catch(err => {
            console.log(err)
            Utils.responseError(res, err);
        });
    }
}

export default ClassHandler;
