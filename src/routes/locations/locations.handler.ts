
/**
 *    on 22/05/18.
 */
import {DirectoryCountryUseCase,DirectoryStateUseCase,DirectoryCityUseCase} from "../../domains";
import {Logger, Mailer} from "../../libs";
import {ErrorCode, HttpStatus, Properties, MessageInfo} from "../../libs/constants";
import {Utils} from "../../libs/utils";
import {Exception} from "../../models";
import {Request, Response} from "express";
import {Promise} from "thenfail";
import {BaseHandler} from "../base.handler";
let util = require('util'); 


export class LocationsHandler extends BaseHandler {
    
    constructor() {
        super();
    }

   
    /**
     *
     * @param req
     * @param res
     * @returns {Promise<any>}
     */
    public static countries(req:Request, res:Response):any {
        return Promise.then(() => {
            return DirectoryCountryUseCase.list();
        })
        .then((object) => { 
            res.json(object);
        })
        .catch(err => {
            Utils.responseError(res, err);
        });
    }

    /**
     *
     * @param req
     * @param res
     * @returns {Promise<any>}
     */
    public static states(req:Request, res:Response):any {
        let countryId = req.params.countryId;
        return Promise.then(() => {
            return DirectoryStateUseCase.list(countryId);
        })
        .then((object) => { 
            res.json(object);
        })
        .catch(err => {
            Utils.responseError(res, err);
        });
    }

    /**
     *
     * @param req
     * @param res
     * @returns {Promise<any>}
     */
    public static cities(req:Request, res:Response):any {
        let stateId = req.params.stateId;
        return Promise.then(() => {
            return DirectoryCityUseCase.list(stateId);
        })
        .then((object) => { 
            res.json(object);
        })
        .catch(err => {
            Utils.responseError(res, err);
        });
    }

    
}

export default new LocationsHandler();
