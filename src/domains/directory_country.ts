/**
 *    on 22/05/18.
 */
import {DirectoryCountryDto} from "../data/models";
import {DirectoryCountryTableSchema} from "../data/schemas";
import {BearerObject, Logger} from "../libs";
import {ErrorCode, HttpStatus, Properties, MessageInfo} from "../libs/constants";
import {Utils} from "../libs/utils";
import {Exception, DirectoryCountryModel} from "../models";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";

export class DirectoryCountryUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = DirectoryCountryDto;
    }

    public list():Promise<any> {
        return Promise.then(() => {
            return this.findAll();
        })
        .then(objects => {
            if (objects != null && objects.models != null && objects.models.length != null) {
                let ret = [];
                objects.models.forEach(object => {
                    ret.push(DirectoryCountryModel.fromDto(object));
                });
               return ret;
                
            }
            let exception;
            exception = new Exception(ErrorCode.RESOURCE.NO_DATA, MessageInfo.MI_DATA_NOT_FOUND, false);
            exception.httpStatus = HttpStatus.BAD_REQUEST;
            return exception;
        })
        .catch(err => {
            Logger.error(err.message, err);
            return false;
        })
        .enclose();
        
    }
    
}

export default new DirectoryCountryUseCase();
