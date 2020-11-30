
import { FeesDto, FeesAssigneeDto, FeesStandardDto, FeesSectionDto, PaidFeesDto } from "../data/models";
import {Utils} from "../libs/utils";
import { FeesModel, Exception, FeesAssigneeModel, FeesStandardModel, FeesSectionModel, PaidFeesModel} from "../models";
import { FeesTableSchema, FeesTypeTableSchema, StandardTableSchema, SectionTableSchema, AdminUserTableSchema, FeesStandardsTableSchema, FeesSectionsTableSchema, FeesAssigneesTableSchema, ClassTableSchema, PaidFeesTableSchema } from "../data/schemas";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";
import {HttpStatus, ErrorCode, MessageInfo} from "../libs/constants";
import { FeesTypeUseCase,
    StandardUseCase, 
    SectionUseCase,
    AdminUserUseCase,
    FeesStandardsUseCase,
    FeesSectionsUseCase,
    FeesAssigneeUseCase,
    ClassUseCase,
    PaidFeesUseCase } from ".";

export class FeesUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = FeesDto;
    }

    public create(fees:FeesModel, feesdup):Promise<any> {
        return Promise.then(() => {
            return FeesTypeUseCase.findByQuery(q => {
                q.where(`${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.ID}`, fees.feesTypeId);
                q.where(`${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        })
        .then(object => {
            if (object && object.models && 0 < object.models.length) {
                if (fees.feesOption === '1') {
                    return Promise.void
                } else if (fees.feesOption === '2') {
                    let check = false;
                    return Promise.each(feesdup.standard_ids, (obj: any) => {
                        if (!check) {
                            return Promise.then(() => {
                                return StandardUseCase.findByQuery(q => {
                                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, obj.standardId);
                                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
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
                                MessageInfo.MI_STANDARD_NOT_FOUND,
                                false,
                                HttpStatus.BAD_REQUEST
                            ));
                        }
                    });
                } else if(fees.feesOption === '3') {
                    let check = false;
                    return Promise.each(feesdup.section_ids, (obj: any) => {
                        if (!check) {
                            return Promise.then(() => {
                                return StandardUseCase.findByQuery(q => {
                                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, obj.standardId);
                                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                                    q.limit(1);
                                }, []);
                            }).then((object) => {
                                if (object && object.models && 0 === object.models.length) {
                                    check = true;
                                } else {
                                    return SectionUseCase.findByQuery(q => {
                                        q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`, obj.sectionId);
                                        q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                                        q.limit(1);
                                    }, []);
                                }
                            }).then((object) => {
                                if (object && object.models && 0 === object.models.length) {
                                    check = true;
                                }
                            });
                        }
                    }).then(() => {
                        if (check) {
                            return Promise.reject(new Exception(
                                ErrorCode.RESOURCE.USER_NOT_FOUND,
                                MessageInfo.MI_STANDARD_NOT_FOUND,
                                false,
                                HttpStatus.BAD_REQUEST
                            ));
                        }
                    })
                } else if (fees.feesOption === '4') {
                    let check = false;
                    return Promise.each(feesdup.student_ids, (obj: any) => {
                        if (!check) {
                            return Promise.then(() => {
                                return StandardUseCase.findByQuery(q => {
                                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, obj.standardId);
                                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                                    q.limit(1);
                                }, []);
                            }).then((object) => {
                                if (object && object.models && 0 === object.models.length) {
                                    check = true;
                                } else {
                                    return SectionUseCase.findByQuery(q => {
                                        q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`, obj.sectionId);
                                        q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                                        q.limit(1);
                                    }, []);
                                }
                            }).then((object) => {
                                if (object && object.models && 0 === object.models.length) {
                                    check = true;
                                } else {
                                return AdminUserUseCase.findByQuery(q => {
                                    q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`, obj.studentId);
                                    q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                                    q.limit(1);
                                }, []);
                            }
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
                                MessageInfo.MI_STUDENT_NOT_FOUND,
                                false,
                                HttpStatus.BAD_REQUEST
                            ));
                        }
                    });
                }
            }
            return Promise.reject(new Exception(
                ErrorCode.RESOURCE.USER_NOT_FOUND,
                MessageInfo.MI_FEES_TYPE_NOT_FOUND,
                false,
                HttpStatus.BAD_REQUEST
            ));
        })
        .then(() => {
            return FeesDto.create(FeesDto, fees.toDto()).save();
        })
        .then((object) => {
            if (fees.feesOption === '2') {
                return Promise.then(() => {
                    return this.findById(object.get('rid'))
                }).then((object) => {
                    const feesId = object.get('id');
                    Promise.each(feesdup.standard_ids, (obj: any) => {
                        return Promise.then(() => {
                            const standardAssignee = {
                                body: {
                                    standardId: obj.standardId,
                                    feesId: feesId,
                                },
                            }
                        const feesObj = FeesStandardModel.fromRequest(standardAssignee);
                        return FeesStandardDto.create(FeesStandardDto, feesObj.toDto()).save();
                        });
                    })
                })
            }
            else if (fees.feesOption === '3') {
                return Promise.then(() => {
                    return this.findById(object.get('rid'))
                }).then((object) => {
                    const feesId = object.get('id');
                    Promise.each(feesdup.section_ids, (obj: any) => {
                        return Promise.then(() => {
                            const sectionAssignee = {
                                body: {
                                    standardId: obj.standardId,
                                    sectionId: obj.sectionId,
                                    standardName: obj.standardName,
                                    sectionName: obj.sectionName,
                                    feesId: feesId,
                                },
                            }
                        const feesObj = FeesSectionModel.fromRequest(sectionAssignee);
                        return FeesSectionDto.create(FeesSectionDto, feesObj.toDto()).save();
                        });
                    })
                })
            } else if (fees.feesOption === '4') {
                return Promise.then(() => {
                    return this.findById(object.get('rid'))
                }).then((object) => {
                    const feesId = object.get('id');
                    Promise.each(feesdup.student_ids, (obj: any) => {
                        return Promise.then(() => {
                            const studentAssignee = {
                                body: {
                                    studentId: obj.studentId,
                                    feesId: feesId,
                                    standardId: obj.standardId,
                                    sectionId: obj.sectionId,
                                    standardName: obj.standardName,
                                    sectionName: obj.sectionName
                                },
                            }
                        const feesObj = FeesAssigneeModel.fromRequest(studentAssignee);
                        return FeesAssigneeDto.create(FeesAssigneeDto, feesObj.toDto()).save();
                        });
                    })
                })
            }
             else {
                return object;
            }
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }


    public updateById(id:string, fees:FeesModel, feesdup):Promise<any> {
        let adminuser:any;
        return Promise.then(() => {
            return this.findByQuery(q => {
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`, id);
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            });        })
        .then((object) => {
            if (object && object.models.length) {
                adminuser = object.models[0];
                return FeesTypeUseCase.findByQuery(q => {
                    q.where(`${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.ID}`, fees.feesTypeId);
                    q.where(`${FeesTypeTableSchema.TABLE_NAME}.${FeesTypeTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_FEES_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        })
        .then(object => {
            if (object && object.models && 0 < object.models.length) {
                if (fees.feesOption === '1') {
                    this.deleteIdIfExists(feesdup.id).then(() => {
                        return Promise.void
                    })
                } else if (fees.feesOption === '2') {
                    let check = false;
                    return Promise.each(feesdup.standard_ids, (obj: any) => {
                        if (!check) {
                            return Promise.then(() => {
                                return StandardUseCase.findByQuery(q => {
                                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, obj.standardId);
                                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
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
                                MessageInfo.MI_STANDARD_NOT_FOUND,
                                false,
                                HttpStatus.BAD_REQUEST
                            ));
                        }
                    });
                } else if(fees.feesOption === '3') {
                    let check = false;
                    return Promise.each(feesdup.section_ids, (obj: any) => {
                        if (!check) {
                            return Promise.then(() => {
                                return StandardUseCase.findByQuery(q => {
                                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, obj.standardId);
                                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                                    q.limit(1);
                                }, []);
                            }).then((object) => {
                                if (object && object.models && 0 === object.models.length) {
                                    check = true;
                                } else {
                                    return SectionUseCase.findByQuery(q => {
                                        q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`, obj.sectionId);
                                        q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                                        q.limit(1);
                                    }, []);
                                }
                            }).then((object) => {
                                if (object && object.models && 0 === object.models.length) {
                                    check = true;
                                }
                            });
                        }
                    }).then(() => {
                        if (check) {
                            return Promise.reject(new Exception(
                                ErrorCode.RESOURCE.USER_NOT_FOUND,
                                MessageInfo.MI_STANDARD_NOT_FOUND,
                                false,
                                HttpStatus.BAD_REQUEST
                            ));
                        }
                    })
                } else if (fees.feesOption === '4') {
                    let check = false;
                    return Promise.each(feesdup.student_ids, (obj: any) => {
                        if (!check) {
                            return Promise.then(() => {
                                return StandardUseCase.findByQuery(q => {
                                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, obj.standardId);
                                    q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                                    q.limit(1);
                                }, []);
                            }).then((object) => {
                                if (object && object.models && 0 === object.models.length) {
                                    check = true;
                                } else {
                                    return SectionUseCase.findByQuery(q => {
                                        q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`, obj.sectionId);
                                        q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                                        q.limit(1);
                                    }, []);
                                }
                            }).then((object) => {
                                if (object && object.models && 0 === object.models.length) {
                                    check = true;
                                } else {
                                return AdminUserUseCase.findByQuery(q => {
                                    q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`, obj.studentId);
                                    q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                                    q.limit(1);
                                }, []);
                            }
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
                                MessageInfo.MI_STUDENT_NOT_FOUND,
                                false,
                                HttpStatus.BAD_REQUEST
                            ));
                        }
                    });
                }
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                    MessageInfo.MI_FEES_TYPE_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        })
        .then(object => {
            let data = fees.toDto();
            return adminuser.save(data, {patch: true});
        })
        .then((object) => {
            let feesId;
            if (fees.feesOption === '2') {
                return Promise.then(() => {
                    return this.findById(object.get('rid'))
                }).then((object) => {
                    if (object) {
                        feesId = object.get('id');
                        this.deleteIdIfExists(feesId).then((object) => {
                            Promise.each(feesdup.standard_ids, (obj: any) => {
                                return Promise.then(() => {
                                    const standardAssignee = {
                                        body: {
                                            standardId: obj.standardId,
                                            feesId: feesId,
                                        },
                                    }
                                const feesObj = FeesStandardModel.fromRequest(standardAssignee);
                                return FeesStandardDto.create(FeesStandardDto, feesObj.toDto()).save();
                                });
                            })
                        });
                    } else {
                        return Promise.break;
                    }
                })
            }
            else if (fees.feesOption === '3') {
                return Promise.then(() => {
                    return this.findById(object.get('rid'))
                }).then((object) => {
                    if (object) {
                        feesId = object.get('id');
                        this.deleteIdIfExists(feesId).then((object) => {
                            Promise.each(feesdup.section_ids, (obj: any) => {
                                return Promise.then(() => {
                                    const sectionAssignee = {
                                        body: {
                                            standardId: obj.standardId,
                                            sectionId: obj.sectionId,
                                            standardName: obj.standardName,
                                            sectionName: obj.sectionName,
                                            feesId: feesId,
                                        },
                                    }
                                const feesObj = FeesSectionModel.fromRequest(sectionAssignee);
                                return FeesSectionDto.create(FeesSectionDto, feesObj.toDto()).save();
                                });
                            })
                        })
                    } else {
                        return Promise.break;
                    }
                })
            } else if (fees.feesOption === '4') {
                return Promise.then(() => {
                    return this.findById(object.get('rid'))
                }).then((object) => {
                    if (object) {
                        feesId = object.get('id');
                        this.deleteIdIfExists(feesId).then((object) => {
                            Promise.each(feesdup.student_ids, (obj: any) => {
                                return Promise.then(() => {
                                    const studentAssignee = {
                                        body: {
                                            studentId: obj.studentId,
                                            feesId: feesId,
                                            standardId: obj.standardId,
                                            sectionId: obj.sectionId,
                                            standardName: obj.standardName,
                                            sectionName: obj.sectionName
                                        },
                                    }
                                const feesObj = FeesAssigneeModel.fromRequest(studentAssignee);
                                return FeesAssigneeDto.create(FeesAssigneeDto, feesObj.toDto()).save();
                                });
                            })
                        })
                    } else {
                        return Promise.break;
                    }
                })
            }
             else {
                return object;
            }
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }

    private deleteIdIfExists(id): any {

        return new Promise((resolve) => {
            return Promise.then(() => {
                return FeesStandardsUseCase.findByQuery((q) => {
                    q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.FEES_ID}`, id);
                    q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.IS_DELETED}`, 0);
                });
            }).then((object) => {
                if (object && object.models && 0 < object.models.length) {
                    return FeesStandardsUseCase.deleteByQuery(q => {
                        q.where(`${FeesStandardsTableSchema.TABLE_NAME}.${FeesStandardsTableSchema.FIELDS.FEES_ID}`, id);
                    });
                } else {
                    return FeesSectionsUseCase.findByQuery((q) => {
                        q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.FEES_ID}`, id);
                        q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.IS_DELETED}`, 0);
                    }); 
                }
            }).then((object) => {
                if (object && object.models && 0 < object.models.length) {
                    return FeesSectionsUseCase.deleteByQuery(q => {
                        q.where(`${FeesSectionsTableSchema.TABLE_NAME}.${FeesSectionsTableSchema.FIELDS.FEES_ID}`, id);
                    });
                } else {
                    return FeesAssigneeUseCase.findByQuery((q) => {
                        q.where(`${FeesAssigneesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.FEES_ID}`, id);
                        q.where(`${FeesAssigneesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.IS_DELETED}`, 0);
                    });
                }
            }).then((object) => {
                if (object && object.models && 0 < object.models.length) {
                    return FeesAssigneeUseCase.deleteByQuery(q => {
                        q.where(`${FeesAssigneesTableSchema.TABLE_NAME}.${FeesAssigneesTableSchema.FIELDS.FEES_ID}`, id);
                    });
                }
                return Promise.void;
            }).then(() => {
                resolve(true);
            })
        });
    }

    public destroyById(rid:string):any {
        let adminUser: any;
        return Promise.then(() => {
            return this.findByQuery(q => {
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`, rid);
                q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.IS_DELETED}`, 0);
            });
        })
        .then(object => {
            if (object && object.models.length) {
                    adminUser = object.models[0];
                    let userData = {};
                    userData[FeesTableSchema.FIELDS.IS_DELETED] = 1;
                    const feesId = adminUser.get('id');
                    this.deleteIdIfExists(feesId).then(() => {
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

    public destroyPaidFees(standardId, sectionId, studentId):any {
        let adminUser: any;
        return Promise.then(() => {
            return PaidFeesUseCase.findByQuery(q => {
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STANDARD_ID}`, standardId);
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.SECTION_ID}`, sectionId);
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.STUDENT_ID}`, studentId);
                q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.IS_DELETED}`, 0);
            });
        })
        .then(object => {
            if (object && object.models.length) {
                    Promise.each(object.models, (obj) => {
                        if (obj) {
                            adminUser = obj;
                            let userData = {};
                            userData[FeesTableSchema.FIELDS.IS_DELETED] = 1;
                            return adminUser.save(userData, {patch: true});
                        }
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
    public createPaidFees(fees:PaidFeesModel, feesdup):Promise<any> {
        return Promise.then(() => {
            return StandardUseCase.findByQuery(q => {
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.STANDARD_ID}`, fees.standardId);
                q.where(`${StandardTableSchema.TABLE_NAME}.${StandardTableSchema.FIELDS.IS_DELETED}`, 0);
                q.limit(1);
            }, []);
        })
        .then((object) => {
            if (object && object.models.length) {
                return SectionUseCase.findByQuery(q => {
                    q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.SECTION_ID}`, fees.sectionId);
                    q.where(`${SectionTableSchema.TABLE_NAME}.${SectionTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_STANDARD_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        })
        .then((object) => {
            if (object && object.models.length) {
                return AdminUserUseCase.findByQuery(q => {
                    q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.USER_ID}`, fees.studentId);
                    q.where(`${AdminUserTableSchema.TABLE_NAME}.${AdminUserTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_SECTION_NOT_FOUND,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        })
        .then((object) => {
            if (object && object.models.length) {
                return ClassUseCase.findByQuery(q => {
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.STANDARD_ID}`, fees.standardId);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.SECTION_ID}`, fees.sectionId);
                    q.where(`${ClassTableSchema.TABLE_NAME}.${ClassTableSchema.FIELDS.IS_DELETED}`, 0);
                    q.limit(1);
                }, []);
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_USER_NOT_EXIST,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
        }).then((object) => {
            if (object && object.models.length) {
                let check = false;
            return Promise.each(feesdup, (obj: any) => {
                if (!check) {
                    return Promise.then(() => {
                        return this.findByQuery(q => {
                            q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.ID}`, obj.feesId);
                            q.where(`${FeesTableSchema.TABLE_NAME}.${FeesTableSchema.FIELDS.IS_DELETED}`, 0);
                            q.limit(1);
                    }, []);
                        }).then((objLesson) => {
                            if (objLesson && 0 === objLesson.models.length) {
                                check = true;
                            } else {
                                if (obj.id) {
                                    return PaidFeesUseCase.findByQuery(q => {
                                        q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.ID}`, obj.id);
                                        q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.IS_DELETED}`, 0);
                                        q.limit(1);
                                }, []);
                                }     
                            }
                        }).then((objLesson) => {
                            if (obj.id && objLesson && 0 === objLesson.models.length) {
                                check = true;
                            }
                        })
                }
            }).then(() => {
                if (check) {
                    return Promise.reject(new Exception(
                                    ErrorCode.RESOURCE.USER_NOT_FOUND,
                                    MessageInfo.MI_FEES_NOT_FOUND,
                                    false,
                                    HttpStatus.BAD_REQUEST
                    ));
                } else {
                    return Promise.then(() => {
                        Promise.each(feesdup, (obj: any) => {
                            return Promise.then(() => {
                                if (obj.id) {
                                    return PaidFeesUseCase.findByQuery(q => {
                                        q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.ID}`, obj.id);
                                        q.where(`${PaidFeesTableSchema.TABLE_NAME}.${PaidFeesTableSchema.FIELDS.IS_DELETED}`, 0);
                                        q.limit(1);
                                }, []);
                                }
                            }).then((object) => {
                                if (obj.id && object && 0 < object.models.length) {
                                    let adminuser = object.models[0];
                                    const paymentData = {
                                        body: {
                                            id: obj.id,
                                            standardId: fees.standardId,
                                            studentId: fees.studentId,
                                            sectionId: fees.sectionId,
                                            feesId: obj.feesId,
                                            feesAmount: obj.feesAmount,
                                            paidStatus: obj.paidStatus,
                                            transactionId: obj.transactionId,
                                            createdBy: fees.createdBy,
                                            paymentMode: obj.paymentMode,
                                        }
                                    }
                                    const feesModel = PaidFeesModel.fromRequest(paymentData);
                                        let data = feesModel.toDto();
                                        return adminuser.save(data, {patch: true});
                                } else {
                                    const paymentData = {
                                        body: {
                                            standardId: fees.standardId,
                                            studentId: fees.studentId,
                                            sectionId: fees.sectionId,
                                            feesId: obj.feesId,
                                            feesAmount: obj.feesAmount,
                                            paidStatus: obj.paidStatus,
                                            transactionId: obj.transactionId,
                                            createdBy: fees.createdBy,
                                            paymentMode: obj.paymentMode,
                                        }
                                    }
                                    const feesModel = PaidFeesModel.fromRequest(paymentData);
                                    return PaidFeesDto.create(PaidFeesDto, feesModel.toDto()).save();
                                }
                            });
                        }).then((object1) => {
                            return Promise.resolve(object1);
                        })      
                    })
                }
            })
            } else {
                return Promise.reject(new Exception(
                    ErrorCode.RESOURCE.NOT_FOUND,
                    MessageInfo.MI_CLASS_NOT_FOUND,
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
}
export default new FeesUseCase();
