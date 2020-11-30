/**
 *    on 22/05/18.
 */
import {HttpStatus} from "../libs/constants";
import * as trace from "stack-trace";
export class Exception implements Error {
    public name:string;
    public stack:any;
    public message:string;
    public code:number;
    public httpStatus:number;

    public static fromError(code:number, error:Error, stack?:boolean, httpStatus?:number):Exception {
        let exception = new Exception(code, error.message);
        exception.name = "Exception";
        exception.message = error.message;
        if (stack) {
            exception.stack = trace.parse(error);
        }
        if (httpStatus != null) {
            exception.httpStatus = httpStatus;
        } else {
            exception.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        return exception;
    }

    constructor(code:number, message:string, stack?:boolean, httpStatus?:number) {
        this.name = "Exception";
        this.code = code;
        this.message = message;
        if (stack) {
            this.stack = trace.parse(<any>new Error());
        }
        if (httpStatus != null) {
            this.httpStatus = httpStatus;
        } else {
            this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    public toString() {
        return this.name + ": " + this.message;
    }
}

export default Exception;
