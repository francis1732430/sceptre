
import { FeesUseCase, FeesStandardsUseCase, FeesAssigneeUseCase, FeesSectionsUseCase, PaidFeesUseCase } from "../../domains";
import { ErrorCode, HttpStatus, MessageInfo, Properties} from "../../libs/constants";
import { Utils } from "../../libs/utils";
import { Exception, FeesModel, FeesStandardModel, FeesSectionModel, PaidFeesModel, ExamEvalutionModel} from "../../models";
import * as express from "express";
import { Promise } from "thenfail";
import { FeesTypeTableSchema, FeesTableSchema, FeesAssigneesTableSchema, AdminUserTableSchema, FeesStandardsTableSchema, StandardTableSchema, FeesSectionsTableSchema, SectionTableSchema, PaidFeesTableSchema } from "../../data/schemas";
import { BaseHandler } from "../base.handler";
import { BearerObject } from "../../libs/jwt";
import * as knex from 'knex';

export class SubjectHandler extends BaseHandler {
    constructor() {
        super();
    }

    public static create(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let fees = FeesModel.fromRequest(req);
            if (!Utils.requiredCheck(fees.feesTypeId)) {
                return Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.REQUIRED_ERROR,
                    MessageInfo.MI_FEES_TYPE_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            if (!Utils.requiredCheck(fees.feesOption)) {
                return Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.REQUIRED_ERROR,
                    MessageInfo.MI_FEES_CATEGORY_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            if (fees.feesOption !== '1'
            && fees.feesOption !== '2'
            && fees.feesOption !== '3'
            && fees.feesOption !== '4') {
                return Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.REQUIRED_ERROR,
                    MessageInfo.MI_FEES_CATEGORY_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            if (req.body.standard_ids
                && fees.feesOption === '2') {
                let check = false;
                req.body.standard_ids.forEach((obj) => {
                    if (!check && (!obj.standardId)) {
                        check = true;
                    }
                });
                if (check || !req.body.standard_ids.length) {
                    return Utils.responseError(res, new Exception(
                        ErrorCode.RESOURCE.REQUIRED_ERROR,
                        MessageInfo.MI_STANDARD_NOT_FOUND,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                }
            }
            if (req.body.section_ids
                && fees.feesOption === '3') {
                let check = false;
                req.body.section_ids.forEach((obj) => {
                    if (!check && (!obj.standardId || !obj.sectionId
                        || !obj.standardName || !obj.sectionName)) {
                        check = true;
                    }
                });
                if (check || !req.body.section_ids.length) {
                    return Utils.responseError(res, new Exception(
                        ErrorCode.RESOURCE.REQUIRED_ERROR,
                        MessageInfo.MI_STANDARD_NOT_FOUND,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                }
            }
            if (req.body.student_ids
                && fees.feesOption === '4') {
                let check = false;
                req.body.student_ids.forEach((obj) => {
                    if (!check && (!obj.studentId ||
                        !obj.standardId || !obj.sectionId
                        || !obj.standardName || !obj.sectionName)) {
                        check = true;
                    }
                });
                if (check || !req.body.student_ids.length) {
                    return Utils.responseError(res, new Exception(
                        ErrorCode.RESOURCE.REQUIRED_ERROR,
                        MessageInfo.MI_USER_NOT_EXIST,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                }
            }
        return Promise.then(() => {
            return FeesUseCase.create(fees, req.body);
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
            return FeesUseCase.countByQuery(q => {
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.leftJoin(`${FeesAssigneesTableSchema.TABLE_NAME} as fa`,
                `fa.${FeesAssigneesTableSchema.FIELDS.FEES_ID}`,
                `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                q.leftJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, function() {
                    this.on(`ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID}`)
                    .on(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                });
                    q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`,
                    `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                    q.leftJoin(`${FeesStandardsTableSchema.TABLE_NAME} as fs`,
                   `fs.${FeesStandardsTableSchema.FIELDS.FEES_ID}`,
                   `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                   q.leftJoin(`${StandardTableSchema.TABLE_NAME} as st`, function() {
                       this.on(`fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`,
                       `st.${StandardTableSchema.FIELDS.STANDARD_ID}`)
                       .on(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                   });
                   q.leftJoin(`${FeesSectionsTableSchema.TABLE_NAME} as fsec`, function() {
                       this.on(`fsec.${FeesSectionsTableSchema.FIELDS.FEES_ID}`,
                       `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                   });
                   q.leftJoin(`${SectionTableSchema.TABLE_NAME} as sec`, function() {
                       this.on(`fsec.${FeesSectionsTableSchema.FIELDS.SECTION_ID}`,
                       `sec.${SectionTableSchema.FIELDS.SECTION_ID}`)
                       .on(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                   });
                   q.leftJoin(`${StandardTableSchema.TABLE_NAME} as fst`, function() {
                    this.on(`fsec.${FeesSectionsTableSchema.FIELDS.STANDARD_ID}`,
                    `fst.${StandardTableSchema.FIELDS.STANDARD_ID}`)
                    .on(`fst.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                });
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            condition = `(fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID} LIKE "%${searchval}%" or
                            fsec.${FeesSectionsTableSchema.FIELDS.SECTION_ID} LIKE "%${searchval}%" or
                            ad.${AdminUserTableSchema.FIELDS.USER_ID} LIKE "%${searchval}%" or
                            ft.${FeesTypeTableSchema.FIELDS.ID} LIKE "%${searchval}%" or
                            ${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_AMOUNT} LIKE "%${searchval}%" or
                            ${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.CREATED_DATE} LIKE "%${searchval}%" or
                            ${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.UPDATED_DATE} LIKE "%${searchval}%")`
                            q.andWhereRaw(condition);
                        }
                    }
                }  
            });
        })
            .then((totalObject) => {
                total = totalObject;
                return FeesUseCase.findByQuery(q => {
                    q.select(
                        // `${FeesTableSchema.TABLE_NAME}.*`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_AMOUNT}`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_OPTION}`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.CREATED_DATE}`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.UPDATED_DATE}`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.ID} as feesAssigneeId`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.STANDARD_ID} as feesAssigneeStandardId`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.SECTION_ID} as feesAssigneeSectionId`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.STANDARD_NAME} as feesAssigneeStandardName`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.SECTION_NAME} as feesAssigneeSectionName`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.FEES_ID} as feesAssignee1Id`,
                    `fs.${FeesStandardsTableSchema.FIELDS.FEES_ID} as feesStandard1Id`,
                    `fsec.${FeesAssigneesTableSchema.FIELDS.FEES_ID} as feesSection1Id`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID} as studentId`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as firstName`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_ID} as standardId`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_ID} as sectionId`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                    `fsec.${FeesSectionsTableSchema.FIELDS.STANDARD_ID} as feesStandardId`,
                    `fsec.${FeesSectionsTableSchema.FIELDS.SECTION_ID} as feesSectionId`,
                    `fsec.${FeesSectionsTableSchema.FIELDS.STANDARD_NAME} as feesStandardName`,
                    `fsec.${FeesSectionsTableSchema.FIELDS.SECTION_NAME} as feesSectionName`,
                    `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesTypeName`,)
                    
                    q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.leftJoin(`${FeesAssigneesTableSchema.TABLE_NAME} as fa`,
                `fa.${FeesAssigneesTableSchema.FIELDS.FEES_ID}`,
                `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                q.leftJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, function() {
                    this.on(`ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID}`)
                    .on(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                });
                    q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`,
                    `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                    q.leftJoin(`${FeesStandardsTableSchema.TABLE_NAME} as fs`,
                   `fs.${FeesStandardsTableSchema.FIELDS.FEES_ID}`,
                   `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                   q.leftJoin(`${StandardTableSchema.TABLE_NAME} as st`, function() {
                       this.on(`fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`,
                       `st.${StandardTableSchema.FIELDS.STANDARD_ID}`)
                       .on(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                   });
                   q.leftJoin(`${FeesSectionsTableSchema.TABLE_NAME} as fsec`, function() {
                       this.on(`fsec.${FeesSectionsTableSchema.FIELDS.FEES_ID}`,
                       `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                   });
                   q.leftJoin(`${SectionTableSchema.TABLE_NAME} as sec`, function() {
                       this.on(`fsec.${FeesSectionsTableSchema.FIELDS.SECTION_ID}`,
                       `sec.${SectionTableSchema.FIELDS.SECTION_ID}`)
                       .on(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                   });
                   q.leftJoin(`${StandardTableSchema.TABLE_NAME} as fst`, function() {
                    this.on(`fsec.${FeesSectionsTableSchema.FIELDS.STANDARD_ID}`,
                    `fst.${StandardTableSchema.FIELDS.STANDARD_ID}`)
                    .on(`fst.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                });
                if (searchobj) {
                    for (let key in searchobj) {
                        if(searchobj[key]!=null && searchobj[key]!=''){
                            let searchval = searchobj[key];
                            let ColumnKey = Utils.changeSearchKey(key);
                            let condition;
                            condition = `(fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID} LIKE "%${searchval}%" or
                            fsec.${FeesSectionsTableSchema.FIELDS.SECTION_ID} LIKE "%${searchval}%" or
                            ad.${AdminUserTableSchema.FIELDS.USER_ID} LIKE "%${searchval}%" or
                            ft.${FeesTypeTableSchema.FIELDS.ID} LIKE "%${searchval}%" or
                            ${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_AMOUNT} LIKE "%${searchval}%" or
                            ${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.CREATED_DATE} LIKE "%${searchval}%" or
                            ${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.UPDATED_DATE} LIKE "%${searchval}%")`
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
                            if (sortKey == 'standardId') {
                                q.orderBy(`fs.${ColumnSortKey}`, sortValue);
                            } if (sortKey == 'sectionId') {
                                q.orderBy(`fsec.${ColumnSortKey}`, sortValue);
                            } if (sortKey == 'studentId') {
                                q.orderBy(`ad.${AdminUserTableSchema.FIELDS.USER_ID}`, sortValue);
                            } if (sortKey == 'feesTypeId') {
                                q.orderBy(`ft.${FeesTypeTableSchema.FIELDS.ID}`, sortValue);
                            } else if (sortKey == 'FeesTypeName') {
                                q.orderBy(`ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE}`, sortValue);
                            } else if (sortKey == 'feesAmount') {
                                q.orderBy(`${FeesTableSchema}.${FeesTableSchema.FIELDS.FEES_AMOUNT}`, sortValue);
                            }
                    } else {
                        q.orderBy(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
                    }
                }
                }, []);
            })
            .then((object) => {
                let ret = [];
                if (object != null && object.models != null) {
                    const feesIds = {};
                    object.models.forEach(obj => {
                        let FeesData = FeesModel.fromDto(obj);
                        if (obj.get('id') && feesIds[obj.get('id')]) {
                            if (obj.get('feesAssignee1Id')) {
                                const assignee = feesIds[obj.get('id')]['feesAssignees'];
                                assignee.push({
                                    feesAssigneeId: obj.get('studentId'),
                                    feesAssignees: obj.get('firstName'),
                                    standardId: obj.get('feesAssigneeStandardId'),
                                    sectionId: obj.get('feesAssigneeSectionId'),
                                    standardName: obj.get('feesAssigneeStandardName'),
                                    sectionName: obj.get('feesAssigneeSectionName'),
                                })
                            } else if (obj.get('feesStandard1Id')) {
                                const standards = feesIds[obj.get('id')]['standards'];
                                standards.push({
                                    standardId: obj.get('standardId'),
                                    standardName: obj.get('standardName')   
                                });
                            } else if (obj.get('feesSection1Id')) {
                                const classs = feesIds[obj.get('id')]['class'];
                                classs.push({
                                    standardId: obj.get('feesStandardId'),
                                    standardName: obj.get('feesStandardName'),
                                    sectionId:  obj.get('feesSectionId'),
                                    sectionName: obj.get('feesSectionName')
                                });
                            }
                        } else {
                            feesIds[obj.get('id')] = {};
                            feesIds[obj.get('id')]['rid'] = obj.get('rid');
                            feesIds[obj.get('id')]['id'] = obj.get('id');
                            feesIds[obj.get('id')]['createdDate'] = obj.get('created_date');
                            feesIds[obj.get('id')]['updatedDate'] = obj.get('updated_date');
                            feesIds[obj.get('id')]['createdDate'] = obj.get('created_date');
                            feesIds[obj.get('id')]['feesTypeId'] = obj.get('fees_type_id');
                            feesIds[obj.get('id')]['feesTypeName'] = obj.get('feesTypeName');
                            feesIds[obj.get('id')]['feesAmount'] = obj.get('fees_amount');
                            feesIds[obj.get('id')]['feesOption'] = obj.get('fees_option');

                            if (obj.get('feesAssignee1Id')) {
                                feesIds[obj.get('id')]['feesAssignees'] = [
                                    {
                                        feesAssigneeId: obj.get('studentId'),
                                        feesAssignees: obj.get('firstName'),
                                        standardId: obj.get('feesAssigneeStandardId'),
                                        sectionId: obj.get('feesAssigneeSectionId'),
                                        standardName: obj.get('feesAssigneeStandardName'),
                                        sectionName: obj.get('feesAssigneeSectionName'),
                                    }
                                ];
                            } else if (obj.get('feesStandard1Id')) {
                                feesIds[obj.get('id')]['standards'] = [
                                    {
                                        standardId: obj.get('standardId'),
                                        standardName: obj.get('standardName')   
                                    }
                                ];
                            } else if (obj.get('feesSection1Id')) {
                                feesIds[obj.get('id')]['class'] = [
                                    {
                                        standardId: obj.get('feesStandardId'),
                                        standardName: obj.get('feesStandardName'),
                                        sectionId:  obj.get('feesSectionId'),
                                        sectionName: obj.get('feesSectionName')
                                    }
                                ];
                            }
                            if (obj.get('feesAssignee1Id')
                            || obj.get('feesStandard1Id')
                            || obj.get('feesSection1Id')) {
                                ret.push(feesIds[obj.get('id')]);
                            } else {
                                ret.push(obj);
                            }
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
        let rid = req.params.rid || "";
        let adminuser:any;
        return Promise.then(() => {
            return FeesUseCase.findByQuery(q => {
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`, rid);
                q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.ID} as feesAssigneeId`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.FEES_ID} as feesAssignee1Id`,
                    `fs.${FeesStandardsTableSchema.FIELDS.FEES_ID} as feesstandard1Id`,
                    `fsec.${FeesAssigneesTableSchema.FIELDS.FEES_ID} as feesSection11Id`,
                    `ad.${AdminUserTableSchema.FIELDS.USER_ID} as studentId`,
                    `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as firstName`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_ID} as standardId`,
                    `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_ID} as sectionId`,
                    `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                    `fsec.${FeesSectionsTableSchema.FIELDS.STANDARD_ID} as feesStandardId`,
                    `fsec.${FeesSectionsTableSchema.FIELDS.SECTION_ID} as feesSectionId`,
                    `fsec.${FeesSectionsTableSchema.FIELDS.STANDARD_NAME} as feesStandardName`,
                    `fsec.${FeesSectionsTableSchema.FIELDS.SECTION_NAME} as feesSectionName`,)
                    
                    q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.leftJoin(`${FeesAssigneesTableSchema.TABLE_NAME} as fa`,
                `fa.${FeesAssigneesTableSchema.FIELDS.FEES_ID}`,
                `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                q.leftJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, function() {
                    this.on(`ad.${AdminUserTableSchema.FIELDS.USER_ID}`,
                    `fa.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID}`)
                    .on(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                });
                    q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`,
                    `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                    q.leftJoin(`${FeesStandardsTableSchema.TABLE_NAME} as fs`,
                   `fs.${FeesStandardsTableSchema.FIELDS.FEES_ID}`,
                   `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                   q.leftJoin(`${StandardTableSchema.TABLE_NAME} as st`, function() {
                       this.on(`fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`,
                       `st.${StandardTableSchema.FIELDS.STANDARD_ID}`)
                       .on(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                   });
                   q.leftJoin(`${FeesSectionsTableSchema.TABLE_NAME} as fsec`, function() {
                       this.on(`fsec.${FeesSectionsTableSchema.FIELDS.FEES_ID}`,
                       `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                   });
                   q.leftJoin(`${SectionTableSchema.TABLE_NAME} as sec`, function() {
                       this.on(`fsec.${FeesSectionsTableSchema.FIELDS.SECTION_ID}`,
                       `sec.${SectionTableSchema.FIELDS.SECTION_ID}`)
                       .on(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                   });
                   q.leftJoin(`${StandardTableSchema.TABLE_NAME} as fst`, function() {
                    this.on(`fsec.${FeesSectionsTableSchema.FIELDS.STANDARD_ID}`,
                    `fst.${StandardTableSchema.FIELDS.STANDARD_ID}`)
                    .on(`fst.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                });
            }) 
        })
        .then((object) => {
            adminuser = object;
            if (adminuser && adminuser.models.length === 0) {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_FEES_TYPE_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            } else {
                let ret = [];
                if (object != null && object.models != null) {
                    const feesIds = {};
                    object.models.forEach(obj => {
                        let FeesData = FeesModel.fromDto(obj);
                        if (obj.get('id') && feesIds[obj.get('id')]) {
                            if (obj.get('feesAssignee1Id')) {
                                const assignee = feesIds[obj.get('id')]['feesAssignees'];
                                assignee.push({
                                    feesAssigneeId: obj.get('studentId'),
                                    feesAssignees: obj.get('firstName'),
                                    standardId: obj.get('feesAssigneeStandardId'),
                                    sectionId: obj.get('feesAssigneeSectionId'),
                                    standardName: obj.get('feesAssigneeStandardName'),
                                    sectionName: obj.get('feesAssigneeSectionName'),   
                                })
                            } else if (obj.get('feesStandard1Id')) {
                                const standards = feesIds[obj.get('id')]['standards'];
                                standards.push({
                                    standardId: obj.get('standardId'),
                                    standardName: obj.get('standardName')   
                                });
                            } else if (obj.get('feesSection1Id')) {
                                const classs = feesIds[obj.get('id')]['class'];
                                classs.push({
                                    standardId: obj.get('feesStandardId'),
                                    standardName: obj.get('feesStandardName'),
                                    sectionId:  obj.get('feesSectionId'),
                                    sectionName: obj.get('feesSectionName')
                                });
                            }
                        } else {
                            feesIds[obj.get('id')] = {};
                            feesIds[obj.get('id')]['rid'] = obj.get('rid');
                            feesIds[obj.get('id')]['id'] = obj.get('id');
                            feesIds[obj.get('id')]['createdDate'] = obj.get('created_date');
                            feesIds[obj.get('id')]['updatedDate'] = obj.get('updated_date');
                            feesIds[obj.get('id')]['createdDate'] = obj.get('created_date');
                            feesIds[obj.get('id')]['feesTypeId'] = obj.get('fees_type_id');
                            feesIds[obj.get('id')]['feesAmount'] = obj.get('fees_amount');
                            feesIds[obj.get('id')]['feesOption'] = obj.get('fees_option');

                            if (obj.get('feesAssignee1Id')) {
                                feesIds[obj.get('id')]['feesAssignees'] = [
                                    {
                                        feesAssigneeId: obj.get('studentId'),
                                        feesAssignees: obj.get('firstName'),
                                        standardId: obj.get('feesAssigneeStandardId'),
                                        sectionId: obj.get('feesAssigneeSectionId'),
                                        standardName: obj.get('feesAssigneeStandardName'),
                                        sectionName: obj.get('feesAssigneeSectionName'),
                                    }
                                ];
                            } else if (obj.get('feesStandard1Id')) {
                                feesIds[obj.get('id')]['standards'] = [
                                    {
                                        standardId: obj.get('standardId'),
                                        standardName: obj.get('standardName'),
                                    }
                                ];
                            } else if (obj.get('feesSection1Id')) {
                                feesIds[obj.get('id')]['class'] = [
                                    {
                                        standardId: obj.get('feesStandardId'),
                                        standardName: obj.get('feesStandardName'),
                                        sectionId:  obj.get('feesSectionId'),
                                        sectionName: obj.get('feesSectionName')
                                    }
                                ];
                            }
                            if (obj.get('feesAssignee1Id')
                            && obj.get('feesStandard1Id')
                            && obj.get('feesSection1Id')) {
                                ret.push(feesIds[obj.get('id')]);
                            } else {
                                ret.push(obj);
                            }
                        }
                    });
                    res.json(ret);
                }
            }
        })
        .catch(err => {
            Utils.responseError(res, err);
        });
    }

    public static update(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        let id = req.params.rid || "";
        let fees = FeesModel.fromRequest(req);
        if (!Utils.requiredCheck(fees.id)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_FEES_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(fees.feesTypeId)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_FEES_TYPE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (!Utils.requiredCheck(fees.feesOption)) {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_FEES_CATEGORY_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (fees.feesOption !== '1'
        && fees.feesOption !== '2'
        && fees.feesOption !== '3'
        && fees.feesOption !== '4') {
            return Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.REQUIRED_ERROR,
                MessageInfo.MI_FEES_CATEGORY_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }
        if (req.body.standard_ids
            && fees.feesOption === '2') {
            let check = false;
            req.body.standard_ids.forEach((obj) => {
                if (!check && (!obj.standardId)) {
                    check = true;
                }
            });
            if (check || !req.body.standard_ids.length) {
                return Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.REQUIRED_ERROR,
                    MessageInfo.MI_STANDARD_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        }
        if (req.body.section_ids
            && fees.feesOption === '3') {
            let check = false;
            req.body.section_ids.forEach((obj) => {
                if (!check && (!obj.standardId || !obj.sectionId
                    || !obj.standardName || !obj.sectionName)) {
                    check = true;
                }
            });
            if (check || !req.body.section_ids.length) {
                return Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.REQUIRED_ERROR,
                    MessageInfo.MI_STANDARD_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        }
        if (req.body.student_ids
            && fees.feesOption === '4') {
            let check = false;
            req.body.student_ids.forEach((obj) => {
                if (!check && (!obj.studentId ||
                    !obj.standardId || !obj.sectionId
                    || !obj.standardName || !obj.sectionName)) {
                    check = true;
                }
            });
            if (check || !req.body.student_ids.length) {
                return Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.REQUIRED_ERROR,
                    MessageInfo.MI_USER_NOT_EXIST,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        }
        return Promise.then(() => {
            return FeesUseCase.findByQuery(q => {
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`, id);
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.IS_DELETED}`, 0);
            });
        })
            .then(object => {
                if (object == null) {
                    Utils.responseError(res, new Exception(
                        ErrorCode.RESOURCE.NOT_FOUND,
                        MessageInfo.MI_FEES_NOT_FOUND,
                        false, 
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                } else {
                    return FeesUseCase.updateById(id, fees, req.body);
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
            return FeesUseCase.findByQuery(q => {
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`, rid);
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.IS_DELETED}`, 0);
            })
        }).then(object => {
            if (object && object.models.length) {
                return FeesUseCase.destroyById(rid);
            }
            Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_FEES_TYPE_NOT_FOUND,
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
    public static destroyPaidFees(req: express.Request, res: express.Response): any {
        let standardId = req.params.standardId || "";
        let sectionId = req.params.sectionId || "";
        let studentId = req.params.studentId || "";

        return Promise.then(() => {
            return PaidFeesUseCase.findByQuery(q => {
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STANDARD_ID}`, standardId);
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.SECTION_ID}`, sectionId);
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STUDENT_ID}`, studentId);
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.IS_DELETED}`, 0);
            });
        }).then(object => {
            if (object && object.models.length) {
                return FeesUseCase.destroyPaidFees(standardId, sectionId, studentId);
            }
            Utils.responseError(res, new Exception(
                ErrorCode.RESOURCE.NOT_FOUND,
                MessageInfo.MI_FEES_TYPE_NOT_FOUND,
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
    public static getById1(req: express.Request, res: express.Response): any {
        let rid = req.params.rid || "";
        let adminuser:any;
        return Promise.then(() => {
            return FeesUseCase.findByQuery(q => {
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`, rid);
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.IS_DELETED}`, 0);
            });
        }).then((object) => {
            if (object != null && object.models != null) {
                adminuser = FeesModel.fromDto(object.models[0]);
                const feesId = adminuser['id'];
                if (adminuser['feesOption'] === '2') {
                    return Promise.then(() => {
                        return FeesStandardsUseCase.findByQuery(q => {
                            q.select(`${FeesStandardsTableSchema.TABLE_NAME}.*`,
                            `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`);
                            q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.FEES_ID}`, feesId);
                            q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.IS_DELETED}`, 0);
                            q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`,
                            `${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`,
                            `st.${StandardTableSchema.FIELDS.STANDARD_ID}`);
                        });
                    }).then((obj) => {
                        if (obj != null && obj.models != null) {
                            const standards = [];
                            obj.models.forEach((obj1) => {
                                const data = FeesStandardModel.fromDto(obj1);
                                data['standardName'] = obj1.get('standardName');
                                standards.push(data);
                            });
                            adminuser['standards'] = standards;
                        }
                        res.json(adminuser);
                    })
                } else if (adminuser['feesOption'] === '3') {
                    return Promise.then(() => {
                        return FeesSectionsUseCase.findByQuery(q => {
                            q.select(`${FeesSectionsTableSchema.TABLE_NAME}.*`,
                            `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                            `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`);
                            q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.FEES_ID}`, feesId);
                            q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.IS_DELETED}`, 0);
                            q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`,
                            `${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.STANDARD_ID}`,
                            `st.${StandardTableSchema.FIELDS.STANDARD_ID}`);
                            q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`,
                            `${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.SECTION_ID}`,
                            `sec.${SectionTableSchema.FIELDS.SECTION_ID}`);
                        });
                    }).then((obj) => {
                        if (obj != null && obj.models != null) {
                            const sections = [];
                            obj.models.forEach((obj1) => {
                                const data = FeesSectionModel.fromDto(obj1);
                                data['standardName'] = obj1.get('standardName');
                                data['sectionName'] = obj1.get('sectionName');
                                sections.push(data);
                            });
                            adminuser['sections'] = sections;
                        }
                        res.json(adminuser);
                    })
                } else if (adminuser['feesOption'] === '4') {
                    return Promise.then(() => {
                        return FeesAssigneeUseCase.findByQuery(q => {
                            q.select(`${FeesAssigneesTableSchema.TABLE_NAME}.*`,
                            `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as studentName`);
                            q.where(`${FeesAssigneesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.FEES_ID}`, feesId);
                            q.where(`${FeesAssigneesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                            q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`,
                            `${FeesAssigneesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID}`,
                            `ad.${AdminUserTableSchema.FIELDS.USER_ID}`);
                        });
                    }).then((obj) => {
                        if (obj != null && obj.models != null) {
                            const students = [];
                            obj.models.forEach((obj1) => {
                                const data = FeesStandardModel.fromDto(obj1);
                                data['studentName'] = obj1.get('studentName');
                                students.push(data);
                            });
                            adminuser['students'] = students;
                        }
                        res.json(adminuser);
                    });
                }
                res.json(adminuser);
            } else {
                Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_FEES_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
                return Promise.break;
            }
        });
    }

    public static getFeesAmountByStudent(req: express.Request, res: express.Response): any {
        let standardId = req.params.standardId || "";
        let sectionId = req.params.sectionId || "";
        let studentId = req.params.studentId || "";
        let adminuser:any;
        const ret = [];
        let studentList = [];
        const standardList = [];
        const sectionList = [];
        const schoolList = [];
        const feesTypes = {};
        return Promise.then(() => {
            return PaidFeesUseCase.findByQuery((q) => {
                q.select(`${PaidFeesTableSchema.TABLE_NAME}.*`,
                `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as studentName`,
                `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`,
                `cb.${AdminUserTableSchema.FIELDS.FIRSTNAME} as createdByName`,
                `fe.${FeesTableSchema.FIELDS.FEES_AMOUNT} as totalAmount`);
                if (standardId) {
                    q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STANDARD_ID}`, standardId);
                }
                if (sectionId) {
                    q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.SECTION_ID}`, sectionId);
                }
                if (studentId) {
                    q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STUDENT_ID}`, studentId);
                }
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.SECTION_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STUDENT_ID}`);
                q.innerJoin(`${FeesTableSchema.TABLE_NAME} as fe`, `fe.${FeesTableSchema.FIELDS.ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.FEES_ID}`);
                q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`, `fe.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as cb`, `cb.${AdminUserTableSchema.FIELDS.USER_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.CREATED_BY}`);
    
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`cb.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
            }).then((object) => {
                if (object && 0 < object.models.length) {
                    const studentIds = {};
                            object.models.forEach((obj) => {
                                if (studentIds[obj.get('student_id')]) {
                                    const studentObj = studentIds[obj.get('student_id')];
                                    studentObj.feesAmount.push({
                                        feesPaidAmount: obj.get('fees_amount'),
                                        feesAmount: obj.get('totalAmount'),                                    feesType: obj.get('feesType'),
                                        paidStatus: obj.get('paid_status'),
                                        transactionId: obj.get('transaction_id'),
                                        createdBy: obj.get('created_by'),
                                        paymentMode: obj.get('payment_mode'),
                                        id: obj.get('id'),
                                        rid: obj.get('rid'),
                                        feesId: obj.get('fees_id'),
                                        createdDate: obj.get('created_date'),
                                        updated_date: obj.get('updated_date')
                                    });
                                }
                                else {
                                    studentIds[obj.get('student_id')] = {
                                    studentId: obj.get('student_id'),
                                    standardId: obj.get('standard_id'),
                                    sectionId: obj.get('section_id'),
                                    standardName: obj.get('standardName'),
                                    sectionName: obj.get('sectionName'),
                                    studentName: obj.get('studentName'),
                                    feesAmount: [{
                                        feesPaidAmount: obj.get('fees_amount'),
                                        feesAmount: obj.get('totalAmount'),
                                        feesType: obj.get('feesType'),
                                        paidStatus: obj.get('paid_status'),
                                        transactionId: obj.get('transaction_id'),
                                        createdBy: obj.get('created_by'),
                                        paymentMode: obj.get('payment_mode'),
                                        id: obj.get('id'),
                                        rid: obj.get('rid'),
                                        feesId: obj.get('fees_id'),
                                        createdDate: obj.get('created_date'),
                                        updated_date: obj.get('updated_date')
                                    }],
                                };
                                ret.push(studentIds[obj.get('student_id')]);
                            }
                        });
                        res.json(ret);
                        return Promise.break;
                } else {
                    return FeesAssigneeUseCase.findByQuery((q) => {
                        q.where(`${FeesAssigneesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID}`, studentId);
                    }); 
                }
            })
            .then((object) => {
                if (object && 0 < object.models.length) {
                    return FeesUseCase.findByQuery((q) => {
                        q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                        `fs.${FeesAssigneesTableSchema.FIELDS.STANDARD_ID} as standardId`,
                        `fs.${FeesAssigneesTableSchema.FIELDS.SECTION_ID} as sectionId`,
                        `fs.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID} as studentId`,
                        `fs.${FeesAssigneesTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                        `fs.${FeesAssigneesTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                        `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                        q.where(`fs.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`fs.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID}`, studentId);
                        q.innerJoin(`${FeesAssigneesTableSchema.TABLE_NAME} as fs`, `fs.${FeesAssigneesTableSchema.FIELDS.FEES_ID}`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                        q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                    });
                } else {
                    return Promise.void;
                }
            }).then((object) => {
                if (object && 0 < object.models.length) {
                    const studentIds = {};
                            object.models.forEach((obj) => {
                                if (studentIds[obj.get('studentId')]) {
                                    const studentObj = studentIds[obj.get('studentId')];
                                    studentObj.feesAmount.push({
                                        feesPaidAmount: 0,
                                        feesAmount: obj.get('fees_amount'),
                                        feesType: obj.get('feesType'),
                                        paidStatus: '',
                                        transactionId: '',
                                        createdBy: '',
                                        paymentMode: '',
                                        id: '',
                                        rid: '',
                                                    feesId: obj.get('id'),
                                        createdDate: '',
                                        updated_date: ''
                                    });
                                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                                }
                                else {
                                    studentIds[obj.get('studentId')] = {
                                    studentId: obj.get('studentId'),
                                    standardId: obj.get('standardId'),
                                    sectionId: obj.get('sectionId'),
                                    standardName: obj.get('standardName'),
                                    sectionName: obj.get('sectionName'),
                                    feesAmount: [{
                                        feesPaidAmount: 0,
                                        feesAmount: obj.get('fees_amount'),
                                        feesType: obj.get('feesType'),
                                        paidStatus: '',
                                        transactionId: '',
                                        createdBy: '',
                                        paymentMode: '',
                                        id: '',
                                        rid: '',
                                                    feesId: obj.get('id'),
                                        createdDate: '',
                                        updated_date: ''
                                    }],
                                };
                                feesTypes[obj.get('feesType')] = obj.get('feesType');
                                studentList.push(studentIds[obj.get('studentId')]);
                            }
                        });
                        // res.json(studentList);
                        // return Promise.break;
                }
                    return FeesSectionsUseCase.findByQuery((q) => {
                        q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                        q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.SECTION_ID}`, sectionId);
                    });
            }).then((object) => {
                if (object && 0 < object.models.length) {
                return FeesUseCase.findByQuery((q) => {
                    q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                    `fs.${FeesSectionsTableSchema.FIELDS.STANDARD_ID} as standardId`,
                    `fs.${FeesSectionsTableSchema.FIELDS.SECTION_ID} as sectionId`,
                    `fs.${FeesSectionsTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `fs.${FeesSectionsTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                    `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                    q.where(`fs.${FeesSectionsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    q.where(`fs.${FeesSectionsTableSchema.FIELDS.SECTION_ID}`, sectionId);
                    q.where(`fs.${FeesSectionsTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.innerJoin(`${FeesSectionsTableSchema.TABLE_NAME} as fs`, `fs.${FeesSectionsTableSchema.FIELDS.FEES_ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                    q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                });
            } else {
                return Promise.void;
            }
            }).then((object) => {
                if (object && 0 < object.models.length) {
                    const studentIds = {};
    
                    if (0 < studentList.length) {
                        object.models.forEach((obj, i) => {
                            studentList.forEach((obj2) => {
                                if (obj2) {
                                    obj2.feesAmount.forEach((obj3) => {
                                        if (obj3.feesType !== obj.get('feesType') && !feesTypes[obj.get('feesType')]) {
                                            if (studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')]) {
                                                const studentObj = studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')];
                                                studentObj.feesAmount.push({
                                                    feesPaidAmount: 0,
                                                    feesAmount: obj.get('fees_amount'),
                                                    feesType: obj.get('feesType'),
                                                    paidStatus: '',
                                                    transactionId: '',
                                                    createdBy: '',
                                                    paymentMode: '',
                                                    id: '',
                                                    rid: '',
                                                                feesId: obj.get('id'),
                                                    createdDate: '',
                                                    updated_date: ''
                                                });
                                            }
                                            else {
                                                studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')] = {
                                                standardId: obj.get('standardId'),
                                                sectionId: obj.get('sectionId'),
                                                standardName: obj.get('standardName'),
                                                sectionName: obj.get('sectionName'),
                                                feesAmount: [{
                                                    feesPaidAmount: 0,
                                                    feesAmount: obj.get('fees_amount'),
                                                    feesType: obj.get('feesType'),
                                                    paidStatus: '',
                                                    transactionId: '',
                                                    createdBy: '',
                                                    paymentMode: '',
                                                    id: '',
                                                    rid: '',
                                                                feesId: obj.get('id'),
                                                    createdDate: '',
                                                    updated_date: ''
                                                }],
                                            };
                                            obj2.feesAmount.push(studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')].feesAmount[i]);
                                        }
                                        feesTypes[obj.get('feesType')] = obj.get('feesType');
                                        }
                                    });
                                }
                            });
                    });
                    } else {
                        object.models.forEach((obj) => {
                            if (studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')]) {
                                const studentObj = studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')];
                                studentObj.feesAmount.push({
                                    feesPaidAmount: 0,
                                        feesAmount: obj.get('fees_amount'),
                                                    feesType: obj.get('feesType'),
                                                    paidStatus: '',
                                                    transactionId: '',
                                                    createdBy: '',
                                                    paymentMode: '',
                                                    id: '',
                                                    rid: '',
                                                                feesId: obj.get('id'),
                                                    createdDate: '',
                                                    updated_date: ''
                                });
                            }
                            else {
                                studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')] = {
                                standardId: obj.get('standardId'),
                                sectionId: obj.get('sectionId'),
                                standardName: obj.get('standardName'),
                                sectionName: obj.get('sectionName'),
                                feesAmount: [{
                                    feesPaidAmount: 0,
                                        feesAmount: obj.get('fees_amount'),
                                                    feesType: obj.get('feesType'),
                                                    paidStatus: '',
                                                    transactionId: '',
                                                    createdBy: '',
                                                    paymentMode: '',
                                                    id: '',
                                                    rid: '',
                                                                feesId: obj.get('id'),
                                                    createdDate: '',
                                                    updated_date: ''
                                }],
                            };
                            standardList.push(studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')]);
                        }
                        feesTypes[obj.get('feesType')] = obj.get('feesType');
                        })
                    }
                }
                    // res.json(studentList);
                    //     return Promise.break;
                    if (studentList.length === 0) {
                        studentList = standardList;
                    }
                    return FeesStandardsUseCase.findByQuery((q) => {
                        q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    });
            })
            .then((object) => {
                if (object && 0 < object.models.length) {
                return FeesUseCase.findByQuery((q) => {
                    q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                    `fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID} as standardId`,
                    `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                    q.where(`fs.${FeesStandardsTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    q.innerJoin(`${FeesStandardsTableSchema.TABLE_NAME} as fs`, `fs.${FeesStandardsTableSchema.FIELDS.FEES_ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                    q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                });
            } else {
                return Promise.void;
            }
            }).then((object) => {
                if (object && 0 < object.models.length) {
                    const studentIds = {};
                    if (0 < studentList.length) {
                        object.models.forEach((obj, i) => {
                            studentList.forEach((obj2) => {
                                if (obj2) {
                                    obj2.feesAmount.forEach((obj3) => {
                                        if (obj3.feesType !== obj.get('feesType') && !feesTypes[obj.get('feesType')]) {
                                            if (studentIds[obj.get('standardId')]) {
                                                const studentObj = studentIds[obj.get('standardId')];
                                                studentObj.feesAmount.push({
                                                    feesPaidAmount: 0,
                                        feesAmount: obj.get('fees_amount'),
                                                    feesType: obj.get('feesType'),
                                                    paidStatus: '',
                                                    transactionId: '',
                                                    createdBy: '',
                                                    paymentMode: '',
                                                    id: '',
                                                    rid: '',
                                                                feesId: obj.get('id'),
                                                    createdDate: '',
                                                    updated_date: ''
                                                });
                                            }
                                            else {
                                                studentIds[obj.get('standardId')] = {
                                                standardId: obj.get('standardId'),
                                                feesAmount: [{
                                                    feesPaidAmount: 0,
                                        feesAmount: obj.get('fees_amount'),
                                                    feesType: obj.get('feesType'),
                                                    paidStatus: '',
                                                    transactionId: '',
                                                    createdBy: '',
                                                    paymentMode: '',
                                                    id: '',
                                                    rid: '',
                                                                feesId: obj.get('id'),
                                                    createdDate: '',
                                                    updated_date: ''
                                                }],
                                            };
                                            obj2.feesAmount.push(studentIds[obj.get('standardId')].feesAmount[i]);
                                        }
                                        feesTypes[obj.get('feesType')] = obj.get('feesType');
                                        }
                                    });
                                }
                            });
                    });
                    } else {
                        object.models.forEach((obj) => {
                            if (studentIds[obj.get('standardId')]) {
                                const studentObj = studentIds[obj.get('standardId')];
                                studentObj.feesAmount.push({
                                    feesPaidAmount: 0,
                                        feesAmount: obj.get('fees_amount'),
                                                    feesType: obj.get('feesType'),
                                                    paidStatus: '',
                                                    transactionId: '',
                                                    createdBy: '',
                                                    paymentMode: '',
                                                    id: '',
                                                    rid: '',
                                                                feesId: obj.get('id'),
                                                    createdDate: '',
                                                    updated_date: ''
                                });
                            }
                            else {
                                studentIds[obj.get('standardId')] = {
                                standardId: obj.get('standardId'),
                                feesAmount: [{
                                    feesPaidAmount: 0,
                                        feesAmount: obj.get('fees_amount'),
                                                    feesType: obj.get('feesType'),
                                                    paidStatus: '',
                                                    transactionId: '',
                                                    createdBy: '',
                                                    paymentMode: '',
                                                    id: '',
                                                    rid: '',
                                                    feesId: obj.get('id'),
                                                    createdDate: '',
                                                    updated_date: ''
                                }],
                            };
                            sectionList.push(studentIds[obj.get('standardId')]);
                        }
                        feesTypes[obj.get('feesType')] = obj.get('feesType');
                    });
                    }
                }
                if (studentList.length === 0) {
                    studentList = sectionList;
                }
                return FeesStandardsUseCase.findByQuery((q) => {
                    q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                });
            }).then((object) => {
                if (object && 0 < object.models.length) {
                    return FeesUseCase.findByQuery((q) => {
                        q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                        `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                         q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                         q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                        q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_OPTION}`, 1);
                        q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                            `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                    });
                } else {
                    return Promise.void;
                }
            }).then((object) => {
                if (object && 0 < object.models.length) {
                    const studentIds = {};
                    if (0 < studentList.length) {
                        object.models.forEach((obj, i) => {
                            studentList.forEach((obj2) => {
                                if (obj2) {
                                    obj2.feesAmount.forEach((obj3) => {
                                        if (obj3.feesType !== obj.get('feesType') && !feesTypes[obj.get('feesType')]) {
                                            if (studentIds[obj.get('id')]) {
                                                const studentObj = studentIds[obj.get('id')];
                                                studentObj.feesAmount.push({
                                                    feesPaidAmount: 0,
                                        feesAmount: obj.get('fees_amount'),
                                                    feesType: obj.get('feesType'),
                                                    paidStatus: '',
                                                    transactionId: '',
                                                    createdBy: '',
                                                    paymentMode: '',
                                                    id: '',
                                                    rid: '',
                                                    feesId: obj.get('id'),
                                                    createdDate: '',
                                                    updated_date: ''
                                                });
                                            }
                                            else {
                                                studentIds[obj.get('id')] = {
                                                feesAmount: [{
                                                    feesPaidAmount: 0,
                                        feesAmount: obj.get('fees_amount'),
                                                    feesType: obj.get('feesType'),
                                                    paidStatus: '',
                                                    transactionId: '',
                                                    createdBy: '',
                                                    paymentMode: '',
                                                    id: '',
                                                    rid: '',
                                                    feesId: obj.get('id'),
                                                    createdDate: '',
                                                    updated_date: ''
                                                }],
                                            };
                                            obj2.feesAmount.push(studentIds[obj.get('id')].feesAmount[i]);
                                        }
                                        feesTypes[obj.get('feesType')] = obj.get('feesType');
                                        }
                                    });
                                }
                            });
                    });
                    } else {
                        object.models.forEach((obj) => {
                            if (studentIds[obj.get('id')]) {
                                const studentObj = studentIds[obj.get('id')];
                                studentObj.feesAmount.push({
                                    feesPaidAmount: 0,
                                        feesAmount: obj.get('fees_amount'),
                                                    feesType: obj.get('feesType'),
                                                    paidStatus: '',
                                                    transactionId: '',
                                                    createdBy: '',
                                                    paymentMode: '',
                                                    id: '',
                                                    rid: '',
                                                    feesId: '',
                                                    createdDate: '',
                                                    updated_date: ''
                                });
                            }
                            else {
                                studentIds[obj.get('id')] = {
                                feesAmount: [{
                                    feesPaidAmount: 0,
                                        feesAmount: obj.get('fees_amount'),
                                                    feesType: obj.get('feesType'),
                                                    paidStatus: '',
                                                    transactionId: '',
                                                    createdBy: '',
                                                    paymentMode: '',
                                                    id: '',
                                                    rid: '',
                                                    feesId: '',
                                                    createdDate: '',
                                                    updated_date: ''
                                }],
                            };
                            schoolList.push(studentIds[obj.get('id')]);
                        }
                        feesTypes[obj.get('feesType')] = obj.get('feesType');
                    });
                    }
                }
                if (0 < studentList.length) {
                    res.json(studentList);
                } else if(0 < schoolList.length) {
                    res.json(schoolList);
                } else {
                    res.json([]);
                }
            })
            });
    }

    public static createFeesPayment(req: express.Request, res: express.Response): any {
        let session: BearerObject = req[Properties.SESSION];
        req.body.createdBy = session.userId;
        let fees = PaidFeesModel.fromRequest(req);
            if (!Utils.requiredCheck(fees.standardId)) {
                return Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.REQUIRED_ERROR,
                    MessageInfo.MI_STANDARD_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            if (!Utils.requiredCheck(fees.sectionId)) {
                return Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.REQUIRED_ERROR,
                    MessageInfo.MI_SECTION_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            if (!Utils.requiredCheck(fees.studentId)) {
                return Utils.responseError(res, new Exception(
                    ErrorCode.RESOURCE.REQUIRED_ERROR,
                    MessageInfo.MI_STUDENT_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            
                let check = false;
                req.body.feesDetails.forEach((obj) => {
                    if (!check && (obj.paidStatus !== 0 && obj.paidStatus !== 1) &&
                        (obj.paymentMode !== 0 && obj.paymentMode !== 1)) {
                        check = true;
                    }
                });
                if (check || !req.body.feesDetails.length) {
                    return Utils.responseError(res, new Exception(
                        ErrorCode.RESOURCE.REQUIRED_ERROR,
                        MessageInfo.MI_FEES_NOT_FOUND,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                }
        return Promise.then(() => {
            return FeesUseCase.createPaidFees(fees, req.body.feesDetails);
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

    public static getFeesListByStudent(req: express.Request, res: express.Response): any {

        let standardId = parseInt(req.query.standardId, 10) || "";
        let sectionId = parseInt(req.query.sectionId, 10) || "";
        let studentId = parseInt(req.query.studentId, 10) || "";
        const ret = [];
        let studentList = [];
        const standardList = [];
        const sectionList = [];
        const schoolList = [];
        const feesTypes = {};
        return Promise.then(() => {
        return PaidFeesUseCase.findByQuery((q) => {
            q.select(`${PaidFeesTableSchema.TABLE_NAME}.*`,
            `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
            `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
            `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as studentName`,
            `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`,
            `cb.${AdminUserTableSchema.FIELDS.FIRSTNAME} as createdByName`,
            `fe.${FeesTableSchema.FIELDS.FEES_AMOUNT} as totalAmount`);
            if (standardId) {
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STANDARD_ID}`, standardId);
            }
            if (sectionId) {
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.SECTION_ID}`, sectionId);
            }
            if (studentId) {
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STUDENT_ID}`, studentId);
            }
            q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.IS_DELETED}`, 0);
            q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STANDARD_ID}`);
            q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.SECTION_ID}`);
            q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STUDENT_ID}`);
            q.innerJoin(`${FeesTableSchema.TABLE_NAME} as fe`, `fe.${FeesTableSchema.FIELDS.ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.FEES_ID}`);
            q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`, `fe.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
            q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as cb`, `cb.${AdminUserTableSchema.FIELDS.USER_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.CREATED_BY}`);

            q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
            q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
            q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
            q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
            q.where(`cb.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};
                        object.models.forEach((obj) => {
                            if (studentIds[obj.get('student_id')]) {
                                const studentObj = studentIds[obj.get('student_id')];
                                studentObj.feesAmount.push({
                                    feesPaidAmount: obj.get('fees_amount'),
                                    feesAmount: obj.get('totalAmount'),                                    feesType: obj.get('feesType'),
                                    paidStatus: obj.get('paid_status'),
                                    transactionId: obj.get('transaction_id'),
                                    createdBy: obj.get('created_by'),
                                    paymentMode: obj.get('payment_mode'),
                                    id: obj.get('id'),
                                    rid: obj.get('rid'),
                                    feesId: obj.get('fees_id'),
                                    createdDate: obj.get('created_date'),
                                    updated_date: obj.get('updated_date')
                                });
                            }
                            else {
                                studentIds[obj.get('student_id')] = {
                                studentId: obj.get('student_id'),
                                standardId: obj.get('standard_id'),
                                sectionId: obj.get('section_id'),
                                standardName: obj.get('standardName'),
                                sectionName: obj.get('sectionName'),
                                studentName: obj.get('studentName'),
                                feesAmount: [{
                                    feesPaidAmount: obj.get('fees_amount'),
                                    feesAmount: obj.get('totalAmount'),
                                    feesType: obj.get('feesType'),
                                    paidStatus: obj.get('paid_status'),
                                    transactionId: obj.get('transaction_id'),
                                    createdBy: obj.get('created_by'),
                                    paymentMode: obj.get('payment_mode'),
                                    id: obj.get('id'),
                                    rid: obj.get('rid'),
                                    feesId: obj.get('fees_id'),
                                    createdDate: obj.get('created_date'),
                                    updated_date: obj.get('updated_date')
                                }],
                            };
                            ret.push(studentIds[obj.get('student_id')]);
                        }
                    });
                    res.json(ret);
                    return Promise.break;
            } else {
                return FeesAssigneeUseCase.findByQuery((q) => {
                    q.where(`${FeesAssigneesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID}`, studentId);
                }); 
            }
        })
        .then((object) => {
            if (object && 0 < object.models.length) {
                return FeesUseCase.findByQuery((q) => {
                    q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                    `fs.${FeesAssigneesTableSchema.FIELDS.STANDARD_ID} as standardId`,
                    `fs.${FeesAssigneesTableSchema.FIELDS.SECTION_ID} as sectionId`,
                    `fs.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID} as studentId`,
                    `fs.${FeesAssigneesTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                    `fs.${FeesAssigneesTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                    `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                    q.where(`fs.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`fs.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID}`, studentId);
                    q.innerJoin(`${FeesAssigneesTableSchema.TABLE_NAME} as fs`, `fs.${FeesAssigneesTableSchema.FIELDS.FEES_ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                    q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                });
            } else {
                return Promise.void;
            }
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};
                        object.models.forEach((obj) => {
                            if (studentIds[obj.get('studentId')]) {
                                const studentObj = studentIds[obj.get('studentId')];
                                studentObj.feesAmount.push({
                                    feesPaidAmount: 0,
                                    feesAmount: obj.get('fees_amount'),
                                    feesType: obj.get('feesType'),
                                    paidStatus: '',
                                    transactionId: '',
                                    createdBy: '',
                                    paymentMode: '',
                                    id: '',
                                    rid: '',
                                                feesId: obj.get('id'),
                                    createdDate: '',
                                    updated_date: ''
                                });
                                feesTypes[obj.get('feesType')] = obj.get('feesType');
                            }
                            else {
                                studentIds[obj.get('studentId')] = {
                                studentId: obj.get('studentId'),
                                standardId: obj.get('standardId'),
                                sectionId: obj.get('sectionId'),
                                standardName: obj.get('standardName'),
                                sectionName: obj.get('sectionName'),
                                feesAmount: [{
                                    feesPaidAmount: 0,
                                    feesAmount: obj.get('fees_amount'),
                                    feesType: obj.get('feesType'),
                                    paidStatus: '',
                                    transactionId: '',
                                    createdBy: '',
                                    paymentMode: '',
                                    id: '',
                                    rid: '',
                                    feesId: obj.get('id'),
                                    createdDate: '',
                                    updated_date: ''
                                }],
                            };
                            feesTypes[obj.get('feesType')] = obj.get('feesType');
                            studentList.push(studentIds[obj.get('studentId')]);
                        }
                    });
                    // res.json(studentList);
                    // return Promise.break;
            }
                return FeesSectionsUseCase.findByQuery((q) => {
                    q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                    q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.SECTION_ID}`, sectionId);
                });
        }).then((object) => {
            if (object && 0 < object.models.length) {
            return FeesUseCase.findByQuery((q) => {
                q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                `fs.${FeesSectionsTableSchema.FIELDS.STANDARD_ID} as standardId`,
                `fs.${FeesSectionsTableSchema.FIELDS.SECTION_ID} as sectionId`,
                `fs.${FeesSectionsTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                `fs.${FeesSectionsTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                q.where(`fs.${FeesSectionsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                q.where(`fs.${FeesSectionsTableSchema.FIELDS.SECTION_ID}`, sectionId);
                q.where(`fs.${FeesSectionsTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${FeesSectionsTableSchema.TABLE_NAME} as fs`, `fs.${FeesSectionsTableSchema.FIELDS.FEES_ID}`,
                `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
            });
        } else {
            return Promise.void;
        }
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};

                if (0 < studentList.length) {
                    object.models.forEach((obj, i) => {
                        studentList.forEach((obj2) => {
                            if (obj2) {
                                obj2.feesAmount.forEach((obj3) => {
                                    if (obj3.feesType !== obj.get('feesType') && !feesTypes[obj.get('feesType')]) {
                                        if (studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')]) {
                                            const studentObj = studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')];
                                            studentObj.feesAmount.push({
                                                feesPaidAmount: 0,
                                                feesAmount: obj.get('fees_amount'),
                                                feesType: obj.get('feesType'),
                                                paidStatus: '',
                                                transactionId: '',
                                                createdBy: '',
                                                paymentMode: '',
                                                id: '',
                                                rid: '',
                                                            feesId: obj.get('id'),
                                                createdDate: '',
                                                updated_date: ''
                                            });
                                        }
                                        else {
                                            studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')] = {
                                            standardId: obj.get('standardId'),
                                            sectionId: obj.get('sectionId'),
                                            standardName: obj.get('standardName'),
                                            sectionName: obj.get('sectionName'),
                                            feesAmount: [{
                                                feesPaidAmount: 0,
                                                feesAmount: obj.get('fees_amount'),
                                                feesType: obj.get('feesType'),
                                                paidStatus: '',
                                                transactionId: '',
                                                createdBy: '',
                                                paymentMode: '',
                                                id: '',
                                                rid: '',
                                                            feesId: obj.get('id'),
                                                createdDate: '',
                                                updated_date: ''
                                            }],
                                        };
                                        obj2.feesAmount.push(studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')].feesAmount[i]);
                                    }
                                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                                    }
                                });
                            }
                        });
                });
                } else {
                    object.models.forEach((obj) => {
                        if (studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')]) {
                            const studentObj = studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')];
                            studentObj.feesAmount.push({
                                feesPaidAmount: 0,
                                    feesAmount: obj.get('fees_amount'),
                                                feesType: obj.get('feesType'),
                                                paidStatus: '',
                                                transactionId: '',
                                                createdBy: '',
                                                paymentMode: '',
                                                id: '',
                                                rid: '',
                                                            feesId: obj.get('id'),
                                                createdDate: '',
                                                updated_date: ''
                            });
                        }
                        else {
                            studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')] = {
                            standardId: obj.get('standardId'),
                            sectionId: obj.get('sectionId'),
                            standardName: obj.get('standardName'),
                            sectionName: obj.get('sectionName'),
                            feesAmount: [{
                                feesPaidAmount: 0,
                                    feesAmount: obj.get('fees_amount'),
                                                feesType: obj.get('feesType'),
                                                paidStatus: '',
                                                transactionId: '',
                                                createdBy: '',
                                                paymentMode: '',
                                                id: '',
                                                rid: '',
                                                            feesId: obj.get('id'),
                                                createdDate: '',
                                                updated_date: ''
                            }],
                        };
                        standardList.push(studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')]);
                    }
                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                    })
                }
            }
                // res.json(studentList);
                //     return Promise.break;
                if (studentList.length === 0) {
                    studentList = standardList;
                }
                return FeesStandardsUseCase.findByQuery((q) => {
                    q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                });
        })
        .then((object) => {
            if (object && 0 < object.models.length) {
            return FeesUseCase.findByQuery((q) => {
                q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                `fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID} as standardId`,
                `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                q.where(`fs.${FeesStandardsTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`, standardId);
                q.innerJoin(`${FeesStandardsTableSchema.TABLE_NAME} as fs`, `fs.${FeesStandardsTableSchema.FIELDS.FEES_ID}`,
                `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
            });
        } else {
            return Promise.void;
        }
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};
                if (0 < studentList.length) {
                    object.models.forEach((obj, i) => {
                        studentList.forEach((obj2) => {
                            if (obj2) {
                                obj2.feesAmount.forEach((obj3) => {
                                    if (obj3.feesType !== obj.get('feesType') && !feesTypes[obj.get('feesType')]) {
                                        if (studentIds[obj.get('standardId')]) {
                                            const studentObj = studentIds[obj.get('standardId')];
                                            studentObj.feesAmount.push({
                                                feesPaidAmount: 0,
                                    feesAmount: obj.get('fees_amount'),
                                                feesType: obj.get('feesType'),
                                                paidStatus: '',
                                                transactionId: '',
                                                createdBy: '',
                                                paymentMode: '',
                                                id: '',
                                                rid: '',
                                                            feesId: obj.get('id'),
                                                createdDate: '',
                                                updated_date: ''
                                            });
                                        }
                                        else {
                                            studentIds[obj.get('standardId')] = {
                                            standardId: obj.get('standardId'),
                                            feesAmount: [{
                                                feesPaidAmount: 0,
                                    feesAmount: obj.get('fees_amount'),
                                                feesType: obj.get('feesType'),
                                                paidStatus: '',
                                                transactionId: '',
                                                createdBy: '',
                                                paymentMode: '',
                                                id: '',
                                                rid: '',
                                                            feesId: obj.get('id'),
                                                createdDate: '',
                                                updated_date: ''
                                            }],
                                        };
                                        obj2.feesAmount.push(studentIds[obj.get('standardId')].feesAmount[i]);
                                    }
                                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                                    }
                                });
                            }
                        });
                });
                } else {
                    object.models.forEach((obj) => {
                        if (studentIds[obj.get('standardId')]) {
                            const studentObj = studentIds[obj.get('standardId')];
                            studentObj.feesAmount.push({
                                feesPaidAmount: 0,
                                    feesAmount: obj.get('fees_amount'),
                                                feesType: obj.get('feesType'),
                                                paidStatus: '',
                                                transactionId: '',
                                                createdBy: '',
                                                paymentMode: '',
                                                id: '',
                                                rid: '',
                                                            feesId: obj.get('id'),
                                                createdDate: '',
                                                updated_date: ''
                            });
                        }
                        else {
                            studentIds[obj.get('standardId')] = {
                            standardId: obj.get('standardId'),
                            feesAmount: [{
                                feesPaidAmount: 0,
                                    feesAmount: obj.get('fees_amount'),
                                                feesType: obj.get('feesType'),
                                                paidStatus: '',
                                                transactionId: '',
                                                createdBy: '',
                                                paymentMode: '',
                                                id: '',
                                                rid: '',
                                                feesId: obj.get('id'),
                                                createdDate: '',
                                                updated_date: ''
                            }],
                        };
                        sectionList.push(studentIds[obj.get('standardId')]);
                    }
                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                });
                }
            }
            if (studentList.length === 0) {
                studentList = sectionList;
            }
            return FeesStandardsUseCase.findByQuery((q) => {
                q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`, standardId);
            });
        }).then((object) => {
            if (object && 0 < object.models.length) {
                return FeesUseCase.findByQuery((q) => {
                    q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                    `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                     q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                     q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_OPTION}`, 1);
                    q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                });
            } else {
                return Promise.void;
            }
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};
                if (0 < studentList.length) {
                    object.models.forEach((obj, i) => {
                        studentList.forEach((obj2) => {
                            if (obj2) {
                                obj2.feesAmount.forEach((obj3) => {
                                    if (obj3.feesType !== obj.get('feesType') && !feesTypes[obj.get('feesType')]) {
                                        if (studentIds[obj.get('id')]) {
                                            const studentObj = studentIds[obj.get('id')];
                                            studentObj.feesAmount.push({
                                                feesPaidAmount: 0,
                                    feesAmount: obj.get('fees_amount'),
                                                feesType: obj.get('feesType'),
                                                paidStatus: '',
                                                transactionId: '',
                                                createdBy: '',
                                                paymentMode: '',
                                                id: '',
                                                rid: '',
                                                feesId: obj.get('id'),
                                                createdDate: '',
                                                updated_date: ''
                                            });
                                        }
                                        else {
                                            studentIds[obj.get('id')] = {
                                            feesAmount: [{
                                                feesPaidAmount: 0,
                                    feesAmount: obj.get('fees_amount'),
                                                feesType: obj.get('feesType'),
                                                paidStatus: '',
                                                transactionId: '',
                                                createdBy: '',
                                                paymentMode: '',
                                                id: '',
                                                rid: '',
                                                feesId: obj.get('id'),
                                                createdDate: '',
                                                updated_date: ''
                                            }],
                                        };
                                        obj2.feesAmount.push(studentIds[obj.get('id')].feesAmount[i]);
                                    }
                                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                                    }
                                });
                            }
                        });
                });
                } else {
                    object.models.forEach((obj) => {
                        if (studentIds[obj.get('id')]) {
                            const studentObj = studentIds[obj.get('id')];
                            studentObj.feesAmount.push({
                                feesPaidAmount: 0,
                                    feesAmount: obj.get('fees_amount'),
                                                feesType: obj.get('feesType'),
                                                paidStatus: '',
                                                transactionId: '',
                                                createdBy: '',
                                                paymentMode: '',
                                                id: '',
                                                rid: '',
                                                feesId: '',
                                                createdDate: '',
                                                updated_date: ''
                            });
                        }
                        else {
                            studentIds[obj.get('id')] = {
                            feesAmount: [{
                                feesPaidAmount: 0,
                                    feesAmount: obj.get('fees_amount'),
                                                feesType: obj.get('feesType'),
                                                paidStatus: '',
                                                transactionId: '',
                                                createdBy: '',
                                                paymentMode: '',
                                                id: '',
                                                rid: '',
                                                feesId: '',
                                                createdDate: '',
                                                updated_date: ''
                            }],
                        };
                        schoolList.push(studentIds[obj.get('id')]);
                    }
                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                });
                }
            }
            if (0 < studentList.length) {
                res.json(studentList);
            } else if(0 < schoolList.length) {
                res.json(schoolList);
            } else {
                res.json([]);
            }
        })
        });
    }

    public static getPaidFeesList(req: express.Request, res: express.Response): any {
        let standardId = parseInt(req.query.standardId, 10) || "";
        let sectionId = parseInt(req.query.sectionId, 10) || "";
        let studentId = parseInt(req.query.studentId, 10) || "";

        return Promise.then(() => {
            return PaidFeesUseCase.findByQuery((q) => {
                q.select(`${PaidFeesTableSchema.TABLE_NAME}.*`,
                `st.${StandardTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                `sec.${SectionTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                `ad.${AdminUserTableSchema.FIELDS.FIRSTNAME} as studentName`,
                `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`,
                `cb.${AdminUserTableSchema.FIELDS.FIRSTNAME} as createdByName`,)
                if (standardId) {
                    q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STANDARD_ID}`, standardId);
                }
                if (sectionId) {
                    q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.SECTION_ID}`, sectionId);
                }
                if (studentId) {
                    q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STUDENT_ID}`, studentId);
                }
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${StandardTableSchema.TABLE_NAME} as st`, `st.${StandardTableSchema.FIELDS.STANDARD_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STANDARD_ID}`);
                q.innerJoin(`${SectionTableSchema.TABLE_NAME} as sec`, `sec.${SectionTableSchema.FIELDS.SECTION_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.SECTION_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as ad`, `ad.${AdminUserTableSchema.FIELDS.USER_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STUDENT_ID}`);
                q.innerJoin(`${FeesTableSchema.TABLE_NAME} as fe`, `fe.${FeesTableSchema.FIELDS.ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.FEES_ID}`);
                q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`, `fe.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                q.innerJoin(`${AdminUserTableSchema.TABLE_NAME} as cb`, `cb.${AdminUserTableSchema.FIELDS.USER_ID}`, `${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.CREATED_BY}`);
    
                q.where(`st.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`sec.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ad.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`cb.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`fe.${FeesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.orderBy(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.UPDATED_DATE}`, 'desc');
            }).then((object) => {
                const ret = [];
                if (object && 0 < object.models.length) {
                    const studentIds = {};
                            object.models.forEach((obj) => {
                                if (studentIds[obj.get('student_id')]) {
                                    const studentObj = studentIds[obj.get('student_id')];
                                    studentObj.feesAmount.push({
                                        feesAmount: obj.get('fees_amount'),
                                        feesType: obj.get('feesType'),
                                        paidStatus: obj.get('paid_status'),
                                        transactionId: obj.get('transaction_id'),
                                        createdBy: obj.get('created_by'),
                                        paymentMode: obj.get('payment_mode'),
                                        id: obj.get('id'),
                                        rid: obj.get('rid'),
                                        feesId: obj.get('fees_id'),
                                        createdDate: obj.get('created_date'),
                                        updated_date: obj.get('updated_date')
                                    });
                                }
                                else {
                                    studentIds[obj.get('student_id')] = {
                                    studentId: obj.get('student_id'),
                                    standardId: obj.get('standard_id'),
                                    sectionId: obj.get('section_id'),
                                    standardName: obj.get('standardName'),
                                    sectionName: obj.get('sectionName'),
                                    studentName: obj.get('studentName'),
                                    feesAmount: [{
                                        feesAmount: obj.get('fees_amount'),
                                        feesType: obj.get('feesType'),
                                        paidStatus: obj.get('paid_status'),
                                        transactionId: obj.get('transaction_id'),
                                        createdBy: obj.get('created_by'),
                                        paymentMode: obj.get('payment_mode'),
                                        id: obj.get('id'),
                                        rid: obj.get('rid'),
                                        feesId: obj.get('fees_id'),
                                        createdDate: obj.get('created_date'),
                                        updated_date: obj.get('updated_date')
                                    }],
                                };
                                ret.push(studentIds[obj.get('student_id')]);
                            }
                        });
                        res.json(ret);
                } else {
                    Utils.responseError(res, new Exception(
                        ErrorCode.RESOURCE.NOT_FOUND,
                        MessageInfo.MI_FEES_NOT_FOUND,
                        false,
                        HttpStatus.BAD_REQUEST
                    ));
                    return Promise.break;
                }
        })
    })
    }

    public static getTotalPaidAmount(req: express.Request, res: express.Response): any {

        return Promise.then(() => {
            // PaidFeesUseCase.findByQuery(q => {
            //     q.sum(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.FEES_AMOUNT} as totalPaidAmount`);
            // }).then((obj) => {
            //     res.json(obj);
            // });
            let fromDate = req.body.fromDate || "";
                fromDate = Utils.getDateFormat(fromDate);
            let toDate = req.body.toDate || "";
                toDate = Utils.getDateFormat(toDate);
            PaidFeesUseCase.findByQuery(q => {
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.whereBetween(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.UPDATED_DATE}`, [fromDate, toDate]);
            }).then((object) => {
                const ret = [];
                if (object && 0 < object.models.length) {
                    const studentIds = {};
                            object.models.forEach((obj) => {
                                const splitDate = Utils.getYearMonthFormat(obj.get('updated_date'));
                                const monthName = Utils.getMonthName(obj.get('updated_date'));
                                if (studentIds[splitDate]) {
                                    const studentObj = studentIds[splitDate];
                                    studentObj['feesAmount'] = parseInt(obj.get('fees_amount'), 10) ? parseInt(obj.get('fees_amount'), 10) + studentObj['feesAmount'] : studentObj['feesAmount']; 
                                }
                                else {
                                    studentIds[splitDate] = {
                                    date: splitDate,
                                    monthName: monthName,
                                    feesAmount: parseInt(obj.get('fees_amount'), 10) ? parseInt(obj.get('fees_amount'), 10) : 0,
                                };
                                ret.push(studentIds[splitDate]);
                            }
                        });
                }
                res.json(ret);
            });
        });
    }
    public static getFeesReport(req: express.Request, res: express.Response): any {

        const ret = [];
        let studentList = [];
        const standardList = [];
        const sectionList = [];
        const schoolList = [];
        const feesTypes = {};
        return Promise.then(() => {
            return FeesUseCase.findByQuery((q) => {
                q.whereNotExists(knex.raw('SELECT *FROM paid_fees WHERE fees.id = paid_fees.fees_id'));
                q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE}`,
                `fa.${FeesAssigneesTableSchema.FIELDS.STANDARD_ID}`,
                `fa.${FeesAssigneesTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                `fa.${FeesAssigneesTableSchema.FIELDS.SECTION_ID}`,
                `fa.${FeesAssigneesTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                `fa.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID}`)
                q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`,
                `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                q.innerJoin(`${FeesAssigneesTableSchema.TABLE_NAME} as fa`,
                `fa.${FeesAssigneesTableSchema.FIELDS.FEES_ID}`,
                `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                q.where(`fa.${FeesAssigneesTableSchema.FIELDS.STUDENT_ID}`, 44);
                q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`fa.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                // q.select(knex.raw('WHERE NOT EXISTS ( SELECT *FROM paid_fees WHERE fees.id = paid_fees.fees_id)'))
            })
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};
                        object.models.forEach((obj) => {
                            if (studentIds[obj.get('student_id')]) {
                                const studentObj = studentIds[obj.get('student_id')];
                                studentObj.feesAmount.push({
                                    feesAmount: obj.get('fees_amount'),
                                    feesTypeId: obj.get('fees_Type_Id'),
                                    feesType: obj.get('fees_Type'),
                                    createdBy: obj.get('created_by'),
                                    id: obj.get('id'),
                                    rid: obj.get('rid'),
                                    createdDate: obj.get('created_date'),
                                    updated_date: obj.get('updated_date')
                                });
                                feesTypes[obj.get('feesTypeId')] = obj.get('fees_Type_Id');
                            }
                            else {
                                studentIds[obj.get('student_id')] = {
                                studentId: obj.get('student_id'),
                                standardId: obj.get('standard_id'),
                                sectionId: obj.get('section_id'),
                                standardName: obj.get('standardName'),
                                sectionName: obj.get('sectionName'),
                                feesAmount: [{
                                    feesAmount: obj.get('fees_amount'),
                                    feesTypeId: obj.get('fees_Type_Id'),
                                    feesType: obj.get('fees_Type'),
                                    createdBy: obj.get('created_by'),
                                    id: obj.get('id'),
                                    rid: obj.get('rid'),
                                    createdDate: obj.get('created_date'),
                                    updated_date: obj.get('updated_date')
                                }],
                            };
                            feesTypes[obj.get('feesTypeId')] = obj.get('fees_Type_Id');
                            studentList.push(studentIds[obj.get('student_id')]);
                        }
                    });
            } 
            else {
                return FeesSectionsUseCase.findByQuery((q) => {
                    q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.STANDARD_ID}`, 1);
                    q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.SECTION_ID}`, 1);
                }); 
            }
        })
        .then((object) => {
            if (object && 0 < object.models.length) {
            return FeesUseCase.findByQuery((q) => {
                q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                `fs.${FeesSectionsTableSchema.FIELDS.STANDARD_ID} as standardId`,
                `fs.${FeesSectionsTableSchema.FIELDS.SECTION_ID} as sectionId`,
                `fs.${FeesSectionsTableSchema.FIELDS.STANDARD_NAME} as standardName`,
                `fs.${FeesSectionsTableSchema.FIELDS.SECTION_NAME} as sectionName`,
                `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                q.where(`fs.${FeesSectionsTableSchema.FIELDS.STANDARD_ID}`, 1);
                q.where(`fs.${FeesSectionsTableSchema.FIELDS.SECTION_ID}`, 1);
                q.where(`fs.${FeesSectionsTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                q.whereNotExists(knex.raw('SELECT *FROM paid_fees WHERE fees.id = paid_fees.fees_id'));
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.innerJoin(`${FeesSectionsTableSchema.TABLE_NAME} as fs`, `fs.${FeesSectionsTableSchema.FIELDS.FEES_ID}`,
                `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
            });
        } else {
            return Promise.void;
        }
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};

                if (0 < studentList.length) {
                    object.models.forEach((obj, i) => {
                        studentList.forEach((obj2) => {
                            if (obj2) {
                                obj2.feesAmount.forEach((obj3) => {
                                    if (obj3.feesTypeId !== obj.get('fees_type_id') && !feesTypes[obj.get('fees_type_id')]) {
                                        if (studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')]) {
                                            const studentObj = studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')];
                                            studentObj.feesAmount.push({
                                             feesAmount: obj.get('fees_amount'),
                                             feesTypeId: obj.get('fees_Type_Id'),
                                             feesType: obj.get('fees_Type'),
                                             createdBy: obj.get('created_by'),
                                             id: obj.get('id'),
                                             rid: obj.get('rid'),
                                             createdDate: obj.get('created_date'),
                                             updated_date: obj.get('updated_date')
                                            });
                                        }
                                        else {
                                            studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')] = {
                                            standardId: obj.get('standardId'),
                                            sectionId: obj.get('sectionId'),
                                            standardName: obj.get('standardName'),
                                            sectionName: obj.get('sectionName'),
                                            feesAmount: [{
                                                feesAmount: obj.get('fees_amount'),
                                                feesTypeId: obj.get('fees_Type_Id'),
                                                feesType: obj.get('fees_Type'),
                                                createdBy: obj.get('created_by'),
                                                id: obj.get('id'),
                                                rid: obj.get('rid'),
                                                createdDate: obj.get('created_date'),
                                                updated_date: obj.get('updated_date')
                                            }],
                                        };
                                        obj2.feesAmount.push(studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')].feesAmount[i]);
                                    }
                                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                                    }
                                });
                            }
                        });
                });
                } else {
                    object.models.forEach((obj) => {
                        if (studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')]) {
                            const studentObj = studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')];
                            studentObj.feesAmount.push({
                                feesAmount: obj.get('fees_amount'),
                                feesTypeId: obj.get('fees_Type_Id'),
                                feesType: obj.get('fees_Type'),
                                createdBy: obj.get('created_by'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                createdDate: obj.get('created_date'),
                                updated_date: obj.get('updated_date')
                            });
                        }
                        else {
                            studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')] = {
                            standardId: obj.get('standardId'),
                            sectionId: obj.get('sectionId'),
                            standardName: obj.get('standardName'),
                            sectionName: obj.get('sectionName'),
                            feesAmount: [{
                                feesAmount: obj.get('fees_amount'),
                                feesTypeId: obj.get('fees_Type_Id'),
                                feesType: obj.get('fees_Type'),
                                createdBy: obj.get('created_by'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                createdDate: obj.get('created_date'),
                                updated_date: obj.get('updated_date')
                            }],
                        };
                        standardList.push(studentIds['st'+obj.get('standardId')+'sec'+obj.get('sectionId')]);
                    }
                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                    })
                }
            }
                if (studentList.length === 0) {
                    studentList = standardList;
                }
                return FeesStandardsUseCase.findByQuery((q) => {
                    q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`, 1);
                });
        }).then((object) => {
            if (object && 0 < object.models.length) {
            return FeesUseCase.findByQuery((q) => {
                q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                `fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID} as standardId`,
                `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                q.where(`fs.${FeesStandardsTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.where(`fs.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`, 1);
                q.whereNotExists(knex.raw('SELECT *FROM paid_fees WHERE fees.id = paid_fees.fees_id'));
                q.innerJoin(`${FeesStandardsTableSchema.TABLE_NAME} as fs`, `fs.${FeesStandardsTableSchema.FIELDS.FEES_ID}`,
                `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`);
                q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                    `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
            });
        } else {
            return Promise.void;
        }
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};
                if (0 < studentList.length) {
                    object.models.forEach((obj, i) => {
                        studentList.forEach((obj2) => {
                            if (obj2) {
                                obj2.feesAmount.forEach((obj3) => {
                                    if (obj3.feesType !== obj.get('feesType') && !feesTypes[obj.get('feesType')]) {
                                        if (studentIds[obj.get('standardId')]) {
                                            const studentObj = studentIds[obj.get('standardId')];
                                            studentObj.feesAmount.push({
                                                feesTypeId: obj.get('fees_Type_Id'),
                                                feesType: obj.get('fees_Type'),
                                                createdBy: obj.get('created_by'),
                                                id: obj.get('id'),
                                                rid: obj.get('rid'),
                                                createdDate: obj.get('created_date'),
                                                updated_date: obj.get('updated_date')
                                            });
                                        }
                                        else {
                                            studentIds[obj.get('standardId')] = {
                                            standardId: obj.get('standardId'),
                                            feesAmount: [{
                                                feesTypeId: obj.get('fees_Type_Id'),
                                                feesType: obj.get('fees_Type'),
                                                createdBy: obj.get('created_by'),
                                                id: obj.get('id'),
                                                rid: obj.get('rid'),
                                                createdDate: obj.get('created_date'),
                                                updated_date: obj.get('updated_date')
                                            }],
                                        };
                                        obj2.feesAmount.push(studentIds[obj.get('standardId')].feesAmount[i]);
                                    }
                                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                                    }
                                });
                            }
                        });
                });
                } else {
                    object.models.forEach((obj) => {
                        if (studentIds[obj.get('standardId')]) {
                            const studentObj = studentIds[obj.get('standardId')];
                            studentObj.feesAmount.push({
                                feesAmount: obj.get('fees_amount'),
                                feesTypeId: obj.get('fees_Type_Id'),
                                feesType: obj.get('fees_Type'),
                                createdBy: obj.get('created_by'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                createdDate: obj.get('created_date'),
                                updated_date: obj.get('updated_date')
                            });
                        }
                        else {
                            studentIds[obj.get('standardId')] = {
                            standardId: obj.get('standardId'),
                            feesAmount: [{
                                feesAmount: obj.get('fees_amount'),
                                feesTypeId: obj.get('fees_Type_Id'),
                                feesType: obj.get('fees_Type'),
                                createdBy: obj.get('created_by'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                createdDate: obj.get('created_date'),
                                updated_date: obj.get('updated_date')
                            }],
                        };
                        sectionList.push(studentIds[obj.get('standardId')]);
                    }
                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                });
                }
            }
            if (studentList.length === 0) {
                studentList = sectionList;
            }
            return FeesStandardsUseCase.findByQuery((q) => {
                q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.STANDARD_ID}`, 1);
            });
        }).then((object) => {
            if (object && 0 < object.models.length) {
                return FeesUseCase.findByQuery((q) => {
                    q.select(`${FeesTableSchema.TABLE_NAME}.*`,
                    `ft.${FeesTypeTableSchema.FIELDS.FEES_TYPE} as feesType`);
                     q.where(`ft.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                     q.whereNotExists(knex.raw('SELECT *FROM paid_fees WHERE fees.id = paid_fees.fees_id'));
                     q.where(`${FeesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_OPTION}`, 1);
                    q.innerJoin(`${FeesTypeTableSchema.TABLE_NAME} as ft`, `ft.${FeesTypeTableSchema.FIELDS.ID}`,
                        `${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.FEES_TYPE_ID}`);
                });
            } else {
                return Promise.void;
            }
        }).then((object) => {
            if (object && 0 < object.models.length) {
                const studentIds = {};
                if (0 < studentList.length) {
                    object.models.forEach((obj, i) => {
                        studentList.forEach((obj2) => {
                            if (obj2) {
                                obj2.feesAmount.forEach((obj3) => {
                                    if (obj3.feesType !== obj.get('feesType') && !feesTypes[obj.get('feesType')]) {
                                        if (studentIds[obj.get('id')]) {
                                            const studentObj = studentIds[obj.get('id')];
                                            studentObj.feesAmount.push({
                                                feesAmount: obj.get('fees_amount'),
                                                feesTypeId: obj.get('fees_Type_Id'),
                                                feesType: obj.get('fees_Type'),
                                                createdBy: obj.get('created_by'),
                                                id: obj.get('id'),
                                                rid: obj.get('rid'),
                                                createdDate: obj.get('created_date'),
                                                updated_date: obj.get('updated_date')
                                            });
                                        }
                                        else {
                                            studentIds[obj.get('id')] = {
                                            feesAmount: [{
                                                feesAmount: obj.get('fees_amount'),
                                                feesTypeId: obj.get('fees_Type_Id'),
                                                feesType: obj.get('fees_Type'),
                                                createdBy: obj.get('created_by'),
                                                id: obj.get('id'),
                                                rid: obj.get('rid'),
                                                createdDate: obj.get('created_date'),
                                                updated_date: obj.get('updated_date')
                                            }],
                                        };
                                        obj2.feesAmount.push(studentIds[obj.get('id')].feesAmount[i]);
                                    }
                                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                                    }
                                });
                            }
                        });
                });
                } else {
                    object.models.forEach((obj) => {
                        if (studentIds[obj.get('id')]) {
                            const studentObj = studentIds[obj.get('id')];
                            studentObj.feesAmount.push({
                                feesAmount: obj.get('fees_amount'),
                                feesTypeId: obj.get('fees_Type_Id'),
                                feesType: obj.get('fees_Type'),
                                createdBy: obj.get('created_by'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                createdDate: obj.get('created_date'),
                                updated_date: obj.get('updated_date')
                            });
                        }
                        else {
                            studentIds[obj.get('id')] = {
                            feesAmount: [{
                                feesAmount: obj.get('fees_amount'),
                                feesTypeId: obj.get('fees_Type_Id'),
                                feesType: obj.get('fees_Type'),
                                createdBy: obj.get('created_by'),
                                id: obj.get('id'),
                                rid: obj.get('rid'),
                                createdDate: obj.get('created_date'),
                                updated_date: obj.get('updated_date')
                            }],
                        };
                        schoolList.push(studentIds[obj.get('id')]);
                    }
                    feesTypes[obj.get('feesType')] = obj.get('feesType');
                });
                }
            }
            if (0 < studentList.length) {
                res.json(studentList);
            } else if(0 < schoolList.length) {
                res.json(schoolList);
            } else {
                res.json([]);
            }
        })
        
    }
}

export default SubjectHandler;
