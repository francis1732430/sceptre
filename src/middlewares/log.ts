import Logger from "../libs/logger";
import * as express from "express";
export function httpLogger(req:any, res:any, next:express.NextFunction) {
    req._startTime = Date.now();

    // Capture end function in Request object to calculate information
    let endFunc = res.end;
    res.end = (chunk:any, encoding:any) => {
        res.responseTime = Date.now() - req._startTime;
        res.end = endFunc;
        res.end(chunk, encoding);
        req.url = req.originalUrl || req.url;

        let format = `${req.ip} ${req.method} ${req.path} ${res.responseTime}ms ${res.statusCode} ${res.statusMessage}`;
        switch (true) {
            case (res.statusCode < 200):
                Logger.getTransportLogger().warn(format);
                break;
            case (res.statusCode > 199 && res.statusCode < 300):
                Logger.getTransportLogger().info(format);
                break;
            case (res.statusCode > 299 && res.statusCode < 500):
                Logger.getTransportLogger().warn(format);
                break;
            default:
                Logger.getTransportLogger().error(format);
        }

        endFunc = null;
    };
    next();
}

export function httpError(error:any, req:express.Request, res:express.Response, next:express.NextFunction) {
    Logger.error(error.message, error);
    next(error);
}
