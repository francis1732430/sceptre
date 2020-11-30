
import {ErrorCode, HttpStatus, MessageInfo} from "../libs/constants";
import {Exception} from "../models/exception";
import * as express from "express";
export function notFound(req:express.Request, res:express.Response, next:express.NextFunction) {
    let exception = new Exception(ErrorCode.RESOURCE.INVALID_URL, MessageInfo.MI_URL_NOT_FOUND);
    exception.httpStatus = HttpStatus.NOT_FOUND;
    next(exception);
}

export default notFound;
