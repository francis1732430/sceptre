
import { SyllabusUseCase, SyllabusLessonsUseCase, LessonsUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, SyllabusModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { SyllabusTableSchema, SyllabusLessonsTableSchema, LessonsTableSchema, SubjectTableSchema, AdminUserTableSchema, StandardTableSchema, SectionTableSchema} from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";

export class SyllabusHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let syllabus = SyllabusModel.fromRequest(req);
        if (!Utils.requiredCheck(syllabus.subjectId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(syllabus.standardId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(syllabus.sectionId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SECTION_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (req.body.lessons && req.body.lessons.length === 0) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_LESSONS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return SyllabusUseCase.create(syllabus, req.body.lessons);
        })
        .then(object => {
            let data  ={};
            data["message"] = "Created successfully";
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
            return LessonsUseCase.countByQuery(q => {
                q.where(`syl.${SyllabusTableSchema.FIELDS.IS_DELETED}`, 0);
                q.leftJoin(`${SyllabusTableSchema.TABLE_NAME} as syl`, function() {
                    this.on(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.STANDARD_ID}`,
                    `syl.${SyllabusTableSchema.FIELDS.STANDARD_ID}`)
                    .on(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.SUBJECT_ID}`,
                    `syl.${SyllabusTableSchema.FIELDS.SUBJECT_ID}`);
                });
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `syl.${SyllabusTableSchema.FIELDS.SUBJECT_ID}`,
                `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `syl.${SyllabusTableSchema.FIELDS.TEACHER_ID}`,
                `ad.${AdminUserTableSchema.FIELDS.USER_ID}`);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `syl.${SyllabusTableSchema.FIELDS.STANDARD_ID}`,
                `st.${StandardTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `syl.${SyllabusTableSchema.FIELDS.SECTION_ID}`,
                `sec.${SectionTableSchema.FIELDS.SECTION_ID}`);

                q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`su.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);

                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            if (key !== 'standardId'
                            && key !== 'sectionId'
                            && key !== 'subjectId'
                            && key !== 'teacherId') {
                            condition = `(
                            st.${StandardTableSchema.FIELDS.STANDARD_NAME} LIKE "%${searchval}%" or
                            sec.${SectionTableSchema.FIELDS.SECTION_NAME} LIKE "%${searchval}%" or
                            su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} LIKE "%${searchval}%" or
                            syl.${SyllabusTableSchema.FIELDS.CREATED_DATE} LIKE "%${searchval}%" or
                            syl.${SyllabusTableSchema.FIELDS.UPDATED_DATE} LIKE "%${searchval}%")`
                            q.andWhereRaw(condition);
                            } else {
                                if(key == 'standardId') {
                                    condition = `(syl.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'sectionId'){
                                    condition = `(syl.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'subjectId'){
                                    condition = `(syl.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'teacherId'){
                                    condition = `(syl.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                }
                            }
                        }
                    }
                }  
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return LessonsUseCase.findByQuery(q => {
                q.select(
                `${LessonsTableSchema.TABLE_NAME}.*`,
                `syl.${SyllabusTableSchema.FIELDS.ID} as syllabusId`,
                `syl.${SyllabusTableSchema.FIELDS.CLASS_ID} as classId`,
                `syl.${SyllabusTableSchema.FIELDS.SUBJECT_ID} as subjectId`,
                `syl.${SyllabusTableSchema.FIELDS.RID} as syllabusRid`,
                `syl.${SyllabusTableSchema.FIELDS.TEACHER_ID} as teacherId`,
                `syl.${SyllabusTableSchema.FIELDS.STANDARD_ID} as standardId`,
                `syl.${SyllabusTableSchema.FIELDS.SECTION_ID} as sectionId`,
                `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as firstName`,
                `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,)
                q.where(`syl.${SyllabusTableSchema.FIELDS.IS_DELETED}`, 0);
                q.leftJoin(`${SyllabusTableSchema.TABLE_NAME} as syl`, function() {
                    this.on(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.STANDARD_ID}`,
                    `syl.${SyllabusTableSchema.FIELDS.STANDARD_ID}`)
                    .on(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.SUBJECT_ID}`,
                    `syl.${SyllabusTableSchema.FIELDS.SUBJECT_ID}`);
                });
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `syl.${SyllabusTableSchema.FIELDS.SUBJECT_ID}`,
                `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `syl.${SyllabusTableSchema.FIELDS.TEACHER_ID}`,
                `ad.${AdminUserTableSchema.FIELDS.USER_ID}`);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `syl.${SyllabusTableSchema.FIELDS.STANDARD_ID}`,
                `st.${StandardTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `syl.${SyllabusTableSchema.FIELDS.SECTION_ID}`,
                `sec.${SectionTableSchema.FIELDS.SECTION_ID}`);

                q.where(`${LessonsTableSchema.TABLE_NAME}.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`su.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);

                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            if (key !== 'standardId'
                            && key !== 'sectionId'
                            && key !== 'subjectId'
                            && key !== 'teacherId') {
                            condition = `(
                            st.${StandardTableSchema.FIELDS.STANDARD_NAME} LIKE "%${searchval}%" or
                            sec.${SectionTableSchema.FIELDS.SECTION_NAME} LIKE "%${searchval}%" or
                            su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} LIKE "%${searchval}%" or
                            syl.${SyllabusTableSchema.FIELDS.CREATED_DATE} LIKE "%${searchval}%" or
                            syl.${SyllabusTableSchema.FIELDS.UPDATED_DATE} LIKE "%${searchval}%")`
                            q.andWhereRaw(condition);
                            } else {
                                if(key == 'standardId') {
                                    condition = `(syl.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'sectionId'){
                                    condition = `(syl.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'subjectId'){
                                    condition = `(syl.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                } else if(key == 'teacherId'){
                                    condition = `(syl.${ColumnKey} LIKE "%${searchval}%")`;
                                    q.andWhereRaw(condition);
                                }
                            }
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
                            if (sortKey == 'standardName') {
                                q.orderBy(`st.${ColumnSortKey}`, sortValue);
                            } else if (sortKey == 'sectionName') {
                                q.orderBy(`sec.${ColumnSortKey}`, sortValue);
                            } else if (sortKey == 'subjectName') {
                                q.orderBy(`su.${ColumnSortKey}`, sortValue);
                            } else if (sortKey == 'teacherName') {
                                q.orderBy(`ad.${AdminUserTableSchema.FIELDS.FIRSTNAME}`, sortValue);
                            }
                        } else {
                            q.orderBy(`${SyllabusTableSchema.TABLE_NAME}.${SyllabusTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                        }
                    }

                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                        const studentIds = {};
                        let ids = {};
                        object.models.forEach((obj) => {
                            if (studentIds['st'+obj.get('standard_id')+'sec'+obj.get('section_id')+'su'+obj.get('subject_id')]) {
                                const studentObj = studentIds['st'+obj.get('standard_id')+'sec'+obj.get('section_id')+'su'+obj.get('subject_id')];
                                if (!ids[obj.get('id') + obj.get('rid')]) {
                                    studentObj.syllabus.push({
                                        lessonName: obj.get('lesson_name'),
                                        status: obj.get('status'),
                                        id: obj.get('id'),
                                        rid: obj.get('rid'),
                                    });
                                    ids[obj.get('id') + obj.get('rid')] = obj.get('id'); 
                                }
                            }
                            else {
                                studentIds['st'+obj.get('standard_id')+'sec'+obj.get('section_id')+'su'+obj.get('subject_id')] = {
                                standardName: obj.get('standardName'),
                                sectionName: obj.get('sectionName'),
                                subjectName: obj.get('subjectName'),
                                firstName: obj.get('firstName'),
                                subjectId: obj.get('subjectId'),
                                standardId: obj.get('standardId'),
                                sectionId: obj.get('sectionId'),
                                classId: obj.get('classId'),
                                id: obj.get('syllabusId'),
                                rid: obj.get('syllabusRid'),
                                createdDate: obj.get('createdDate'),
                                updatedDate: obj.get('updatedDate'),
                                syllabus: [{
                                    lessonName: obj.get('lesson_name'),
                                    status: obj.get('status'),
                                    id: obj.get('id'),
                                    rid: obj.get('rid'),
                                }],
                            };
                            ids[obj.get('id') + obj.get('rid')] = obj.get('id'); 
                            ret.push(studentIds['st'+obj.get('standard_id')+'sec'+obj.get('section_id')+'su'+obj.get('subject_id')]);
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
        let adminuser:any;
        return Promise.then(() => {
            return SyllabusLessonsUseCase.findByQuery(q => {
                q.where(`syl.${SyllabusTableSchema.FIELDS.RID}`, rid);

                q.select(`${SyllabusLessonsTableSchema.TABLE_NAME}.*`,
                `syl.${SyllabusTableSchema.FIELDS.RID} as syllabusRid`,
                `syl.${SyllabusTableSchema.FIELDS.ID} as syllabusid`,
                `syl.${SyllabusTableSchema.FIELDS.LESSON_STATUS} as lessonStatus`,
                `syl.${SyllabusTableSchema.FIELDS.CLASS_ID} as classId`,
                `syl.${SyllabusTableSchema.FIELDS.SECTION_ID} as sectionId`,
                `syl.${SyllabusTableSchema.FIELDS.STANDARD_ID} as standardId`,
                `syl.${SyllabusTableSchema.FIELDS.SUBJECT_ID} as subjectId`,
                `syl.${SyllabusTableSchema.FIELDS.CREATED_DATE} as createdDate`,
                `syl.${SyllabusTableSchema.FIELDS.UPDATED_DATE} as updatedDate`,
                `le.${LessonsTableSchema.FIELDS.LESSON_NAME} as lessonName`,
                `su.${SubjectTableSchema.FIELDS.SUBJECT_NAME} as subjectName`,
                `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as firstName`,
                `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,)
                q.where(`${SyllabusLessonsTableSchema.TABLE_NAME}.${SyllabusLessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${SyllabusTableSchema.TABLE_NAME} as syl`, `syl.${SyllabusTableSchema.FIELDS.ID}`,
                `${SyllabusLessonsTableSchema.TABLE_NAME}.${SyllabusLessonsTableSchema.FIELDS.SYLLABUS_ID}`);
                q.innerJoin(`${LessonsTableSchema.TABLE_NAME} as le`, `le.${LessonsTableSchema.FIELDS.ID}`,
                `${SyllabusLessonsTableSchema.TABLE_NAME}.${SyllabusLessonsTableSchema.FIELDS.LESSON_ID}`);
                q.innerJoin(`${SubjectTableSchema.TABLE_NAME} as su`, `syl.${SyllabusTableSchema.FIELDS.SUBJECT_ID}`,
                `su.${SubjectTableSchema.FIELDS.SUBJECT_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `syl.${SyllabusTableSchema.FIELDS.TEACHER_ID}`,
                `ad.${AdminUserTableSchema.FIELDS.USER_ID}`);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `syl.${SyllabusTableSchema.FIELDS.STANDARD_ID}`,
                `st.${StandardTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `syl.${SyllabusTableSchema.FIELDS.SECTION_ID}`,
                `sec.${SectionTableSchema.FIELDS.SECTION_ID}`);

                q.where(`syl.${SyllabusTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`le.${LessonsTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`su.${SubjectTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);

            }) 
        })
        .then((object) => {
            adminuser = object;
            const ret = [];
            if (adminuser && adminuser.models.length === 0) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_LESSON_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                const studentIds = {};
                        object.models.forEach((obj) => {
                            if (studentIds[obj.get('syllabus_id')]) {
                                const studentObj = studentIds[obj.get('syllabus_id')];
                                studentObj.syllabus.push({
                                    lesson_id: obj.get('lesson_id'),
                                    lessonName: obj.get('lessonName')
                                });
                            }
                            else {
                                studentIds[obj.get('syllabus_id')] = {
                                standardName: obj.get('standardName'),
                                sectionName: obj.get('sectionName'),
                                subjectName: obj.get('subjectName'),
                                firstName: obj.get('firstName'),
                                subjectId: obj.get('subjectId'),
                                standardId: obj.get('standardId'),
                                sectionId: obj.get('sectionId'),
                                classId: obj.get('classId'),
                                lessonStatus: obj.get('lessonStatus'),
                                syllabusId: obj.get('syllabusid'),
                                rid: obj.get('syllabusRid'),
                                createdDate: obj.get('createdDate'),
                                updatedDate: obj.get('updatedDate'),
                                syllabus: [{
                                    lesson_id: obj.get('lesson_id'),
                                    lessonName: obj.get('lessonName'),
                                }],
                            };
                            ret.push(studentIds[obj.get('syllabus_id')]);
                        }
                    });
            }
            res.json(ret);
        })
        .catch(err => {
            console.log(err);
            Utils.responseError(res, err);
        });
    }

    public static update(req: express.Request, res: express.Response): any {
        let rid = req.params.rid || "";
        let syllabus = SyllabusModel.fromRequest(req);
        if (!Utils.requiredCheck(syllabus.subjectId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SUBJECT_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(syllabus.standardId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_STANDARD_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(syllabus.sectionId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_SECTION_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(req.body.lessons)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.IS_VALID_ERROR,
                MessageInfo.MI_LESSONS_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        return Promise.then(() => {
            return SyllabusUseCase.findById(rid);
        })
            .then(object => {
                if (object == null) {
                    Utils.responseError(res, new Exception(
                        ErrorCode.AUTHENTICATION.ACCOUNT_NOT_FOUND,
                        MessageInfo.MI_SYLLABUS_NOT_FOUND,
                        false, 
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                } else {
                    return SyllabusUseCase.updateById(rid, syllabus, req.body.lessons);
                }
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
            return SyllabusUseCase.findByQuery(q => {
                q.where(`${SyllabusTableSchema.TABLE_NAME}.${SyllabusTableSchema.FIELDS.RID}`, rid);
                q.where(`${SyllabusTableSchema.TABLE_NAME}.${SyllabusTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then(object => {
            if (object && object.models.length) {
                return SyllabusUseCase.destroyById(rid);
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
}

export default SyllabusHandler;
