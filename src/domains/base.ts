/**
 *    on 8/8/16.
 */

import {Promise} from "thenfail";
import {Utils} from "../libs/utils";

export class BaseUseCase {
    public mysqlModel:any;

    constructor() {
    }

    /**
     * find By Id
     * @param id
     * @param related
     * @returns {Promise<any>}
     */
    public findById(id:string, related?:string[]):Promise<any> {
        return Promise.then(() => {
            let sub = related != null ? related : [];
            return this.mysqlModel.create(this.mysqlModel, {rid: id,is_deleted:0}).fetch({withRelated: sub});
        })
        .then(object => {
            return object;
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }

    /**
     * Find One
     * @param this.mysqlModel
     * @param callback
     * @param related
     * @returns {Promise<any>}
     */
    public findOne(callback:(qb:Knex.QueryBuilder) => void, related?:string[]):Promise<any> {
        return Promise.then(() => {
            let sub = related != null ? related : [];
            return this.mysqlModel.create(this.mysqlModel).query(callback).fetch({withRelated: sub});
        })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    /**
     * Find All
     * @param this.mysqlModel
     * @param callback
     * @param related
     * @returns {Promise<any>}
     */
    public findAll(related?:string[]):Promise<any> {
        return Promise.then(() => {
            let sub = related != null ? related : [];
            return this.mysqlModel.create(this.mysqlModel,{is_deleted:0}).fetchAll({withRelated: sub});
        })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    /**
     * Find by query
     * @param this.mysqlModel
     * @param callback
     * @param related
     * @returns {Promise<any>}
     */
    public findByQuery(callback:(qb:Knex.QueryBuilder) => void, related?:any[]):Promise<any> {
        return Promise.then(() => {
            let sub = related != null ? related : [];
            return this.mysqlModel.create(this.mysqlModel).query(callback).fetchAll({withRelated: sub});
        })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    /**
     * Count
     * @param this.mysqlModel
     * @returns {Promise<any>}
     */
    public count():Promise<any> {
        return Promise.then(() => {
            return this.mysqlModel.create(this.mysqlModel).count();
        })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    /**
     * Count by query
     * @param this.mysqlModel
     * @param callback
     * @returns {Promise<any>}
     */
    public countByQuery(callback:(qb:Knex.QueryBuilder) => void):Promise<any> {
        return Promise.then(() => {
            return this.mysqlModel.create(this.mysqlModel).query(callback).count();
        })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    /**
     * Delete by id
     * @param this.mysqlModel
     * @param id
     * @returns {Promise<any>}
     */
    public deleteById(id: string):Promise<any> {
        return Promise.then(() => {
            return this.mysqlModel.create(this.mysqlModel).forge({id: id}).destroy();
        })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    /**
     * delete by query
     * @param this.mysqlModel
     * @param callback
     * @returns {Promise<any>}
     */
    public deleteByQuery(callback:(qb:Knex.QueryBuilder) => void):Promise<any> {
        return Promise.then(() => {
            return this.mysqlModel.create(this.mysqlModel).query(callback).destroy();
        })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    /**
     * Update by condition
     * @param this.mysqlModel
     * @param conditions
     * @param data
     * @returns {Promise<any>}
     */
    public updateByCondition(conditions: any, data: any):Promise<any> {
        return Promise.then(() => {
            return this.mysqlModel.create(this.mysqlModel).query().where(conditions).update(data);
        })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }

    public findByUserId(id:string, related?:string[]):Promise<any> {
        return Promise.then(() => {
            let sub = related != null ? related : [];
            return this.mysqlModel.create(this.mysqlModel, {user_id: id}).fetch({withRelated: sub});
        })
        .then(object => {
            return object;
        })
        .catch(err => {
            return Promise.reject(Utils.parseDtoError(err));
        })
        .enclose();
    }
    public updateByConditionComma(cfield, ufield, conditions: any, data: any):Promise<any> {
        return Promise.then(() => {
            return this.mysqlModel.create(this.mysqlModel).query().where(cfield, conditions).update(ufield, data);
        })
            .catch(err => {
                return Promise.reject(Utils.parseDtoError(err));
            })
            .enclose();
    }
}
