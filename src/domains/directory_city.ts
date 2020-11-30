/**
 *    on 22/05/18.
 */
import {DirectoryCityDto} from "../data/models";
import {DirectoryCityTableSchema} from "../data/schemas";
import {BearerObject, Logger} from "../libs";
import {ErrorCode, HttpStatus, Properties, MessageInfo} from "../libs/constants";
import {Utils} from "../libs/utils";
import {Exception, DirectoryCityModel} from "../models";
import {Promise} from "thenfail";
import {BaseUseCase} from "./base";

export class DirectoryCityUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = DirectoryCityDto;
    }

    public list(stateId:string):Promise<any> {
        return Promise.then(() => {
            return this.findByQuery(q => {
                q.where(DirectoryCityTableSchema.FIELDS.STATE_ID, stateId);
            }, []);
        })
        .then(objects => {
            if (objects != null && objects.models != null && objects.models.length != null) {
                let ret = [];
                objects.models.forEach(object => {
                    ret.push(DirectoryCityModel.fromDto(object,[]));
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

export default new DirectoryCityUseCase();
