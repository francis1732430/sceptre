/**
 *    on 22/05/18.
 */
import {DirectoryStateDto} from "../data/models";
import {DirectoryStateTableSchema} from "../data/schemas";
import {BearerObject, Logger} from "../libs";
import {ErrorCode, HttpStatus, Properties, MessageInfo} from "../libs/constants";
import {Utils} from "../libs/utils";
import {Exception, DirectoryStateModel} from "../models";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";

export class DirectoryStateUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = DirectoryStateDto;
    }

    public list(countryId:string):Promise<any> {
        return Promise.then(() => {
            return this.findByQuery(q => {
                q.where(DirectoryStateTableSchema.FIELDS.COUNTRY_ID, countryId);
            }, []);
        })
        .then(objects => {
            if (objects != null && objects.models != null && objects.models.length != null) {
                let ret = [];
                objects.models.forEach(object => {
                    ret.push(DirectoryStateModel.fromDto(object,[]));
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

export default new DirectoryStateUseCase();
