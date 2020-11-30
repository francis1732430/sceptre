
import {ErrorCode, HttpStatus, MessageInfo} from "../libs/constants";
import {Exception} from "../models/exception";
import * as express from "express";


export function version(req: express.Request, res: express.Response, next: express.NextFunction) {
    if(req.body.version=='1') {
       next();
    } else {
        let exception = new Exception(ErrorCode.VERSION.INVALID_VERSION, MessageInfo.VERSION_INVALID, false);
        exception.httpStatus = HttpStatus.BAD_REQUEST;
                next(exception);
    }
    
    
}
export default version;
