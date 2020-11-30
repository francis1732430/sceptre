import {Logger} from "../libs";
import {ErrorCode, HttpStatus} from "../libs/constants";
import {Exception} from "../models";
import Types from "./types";
import * as bcrypt from "bcrypt";
import {Response} from "express";
import * as mkdir from "mkdirp";
import {Promise} from "thenfail";

export class Utils {
    public static extractType(type:string):any {
        return Types.getType(type);
    }

    public static randomText(len:number) {
        let set = "0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";
        let setLen = set.length;
        let salt = "";
        for (let i = 0; i < len; i++) {
            let p = Math.floor(Math.random() * setLen);
            salt += set[p];
        }
        return salt;
    }

    public static randomPassword(len:number) {
        let set = "ABCDEFGHIJKLMNOPQURSTUVWXYZ";
        let setLen = set.length;
        let salt = "";
        for (let i = 0; i < 1; i++) {
            let p = Math.floor(Math.random() * setLen);
            salt += set[p];
        }

        set = "abcdefghijklmnopqurstuvwxyz";
        setLen = set.length;
        for (let i = 0; i < 5; i++) {
            let p = Math.floor(Math.random() * setLen);
            salt += set[p];
        }

        set = "@_-#$%&*!";
        setLen = set.length;
        for (let i = 0; i < 1; i++) {
            let p = Math.floor(Math.random() * setLen);
            salt += set[p];
        }

        set = "0123456789";
        setLen = set.length;
        for (let i = 0; i < 1; i++) {
            let p = Math.floor(Math.random() * setLen);
            salt += set[p];
        }
        return salt;
    }

    public static requiredCheck(val) {
        if (val == null || val === "") {
            return false;
        }
        return true;
    }

    public static requiredCheckNumber(val) {
        if (val == null || val === "" || val === 0) {
            return false;
        }
        return true;
    }

    public static booleanCheck(val) {
        if (val === 0 || val === 1) {
            return true;
        }
        return false;
    }

    public static validateEmail(email) {
        if (!email) {
            return false;
        }
        // Regex for validating email.
        let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    public static randomPin():number {
        return Math.floor(Math.random() * 899999 + 100000);
    }

    public static randomNumber(min:number, max:number) {
        if (min != null && max != null) {
            return Math.floor(Math.random() * max + min);
        }
        return 0;
    }

    public static validatePassword(password:string):boolean {
        return true;
    }

    public static compareHash(password:string, hash:string):boolean {
        if (password == null || hash == null) {
            return false;
        }

        return bcrypt.compareSync(password, hash);
    }

    public static hashPassword(password:string):string {
        if (password != null) {
            return bcrypt.hashSync(password, 10);
        }
        return "";
    }

    public static responseError(res:Response, error:any) {
        Logger.error(error.message, error);
        let exception:Exception;
        if (error instanceof Exception) {
            exception = error;
        } else {
            exception = new Exception(ErrorCode.UNKNOWN.GENERIC, "Internal Server Error");
        }
        res.status(exception.httpStatus);
        res.json({
            code: exception.code,
            message: exception.message,
        });
    }

    public static responseErrorStatus(res:Response, error:any) {
        Logger.error(error.message, error);
        let exception:Exception;
        if (error instanceof Exception) {
            exception = error;
        } else {
            exception = new Exception(ErrorCode.UNKNOWN.GENERIC, "Internal Server Error");
        }
        res.status(exception.httpStatus);
        res.json({
            status: exception.code,
            code: 100,
            message: exception.message,
        });
    }


    public static parseDtoError(error:any):Exception {
        let exception;
        if (error != null) {
            if (error instanceof Exception) {
                exception = error;
            } else {
                exception = Exception.fromError(ErrorCode.RESOURCE.GENERIC, error, false);
                exception.message = "Internal Database Error";
                if (error.errno != null) {
                    if (error.errno === 1062) {
                        exception.code = ErrorCode.RESOURCE.DUPLICATE_RESOURCE;
                        exception.message = "The same resource already exists.";
                        exception.httpStatus = HttpStatus.BAD_REQUEST;
                    }
                }
                Logger.error(error.message, error);
            }
        } else {
            exception = new Exception(ErrorCode.UNKNOWN.GENERIC, "Unknown Error");
        }
        return exception;
    }

    public static createFolder(pathToFolder:string) {
        if (pathToFolder == null) {
            return Promise.false;
        }

        return new Promise((resolve, reject) => {
            mkdir(pathToFolder, err => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    public static installHook(obj:any) {
        if (obj.hook || obj.unhook) {
            throw new Error("Object already has properties hook and/or unhook");
        }

        obj.hook = (methodName:string, fn:Function, isAsync:boolean) => {
            let methodRef;
            // Make sure method exists
            if (!(Object.prototype.toString.call(obj[methodName]) === "[object Function]")) {
                throw new Error("Invalid method: " + methodName);
            }
            // We should not hook a hook
            if (obj.unhook.methods[methodName]) {
                throw new Error("Method already hooked: " + methodName);
            }
            // Reference default method
            methodRef = (obj.unhook.methods[methodName] = obj[methodName]);
            obj[methodName] = function () {
                let args = Array.prototype.slice.call(arguments);
                // Our hook should take the same number of arguments
                // as the original method so we must fill with undefined
                // optional args not provided in the call
                while (args.length < methodRef.length) {
                    args.push(undefined);
                }
                // Last argument is always original method call
                args.push(function () {
                    let args2 = arguments;
                    if (isAsync) {
                        process.nextTick(function () {
                            methodRef.apply(obj, args2);
                        });
                    } else {
                        methodRef.apply(obj, args2);
                    }
                });
                fn.apply(obj, args);
            };
        };
        obj.unhook = function (methodName) {
            let ref = obj.unhook.methods[methodName];
            if (ref) {
                obj[methodName] = obj.unhook.methods[methodName];
                obj.unhook.methods[methodName] = undefined;
            } else {
                throw new Error("Method not hooked: " + methodName);
            }
        };
        obj.unhook.methods = {};
    }

    static setDataDefault(data, defaultValue:any = "") {
        let ret = data ? data : ((defaultValue !== "") ? defaultValue : "");
        return ret;
    }

    static validateUSPhoneNumber(phoneNumber:string) {
        let result = false;

        phoneNumber = phoneNumber.replace(/\s+/g, '');

        if (phoneNumber.length > 9) {
            result = phoneNumber.match(/^(\+?1-?)?(\([2-9]([02-9]\d|1[02-9])\)|[2-9]([02-9]\d|1[02-9]))-?[2-9]([02-9]\d|1[02-9])-?\d{4}$/) != null ? true : false;
        }

        return result;
    }

    public static compareValues(key:any, order:string='asc') {
        return function(a, b) {
            if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                // property doesn't exist on either object
                return 0; 
            }

            const varA = (typeof a[key] === 'string') ? 
                a[key].toUpperCase() : a[key];
            const varB = (typeof b[key] === 'string') ? 
                b[key].toUpperCase() : b[key];

            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }
            return (
                (order == 'desc') ? (comparison * -1) : comparison
            );
        };
    }

    public static changeSearchKey(val:string) {
        let valnew = "";
        for (let i = 0; i < val.length; i++) {

            if (val.charAt(i) === val.charAt(i).toUpperCase() && val.charAt(i) !== "_") {
                valnew = valnew + "_" + val.charAt(i).toLowerCase();
            } else {
                valnew = valnew + val.charAt(i);
            }
        }
        return valnew;
    }

    public static todayDate() {
        let today = new Date();
        let dd = today.getDate();

        let mm = today.getMonth()+1; 
        let yyyy = today.getFullYear();
        if(dd<10) 
        {
            dd='0'+dd;
        } 

        if(mm<10) 
        {
            mm='0'+mm;
        } 
        return yyyy+'-'+mm+'-'+dd;
    }
    static validatePhoneNumber(phoneNumber:string) {
        let result = false;
        if (/^\d{10}$/.test(phoneNumber)) {
            result = true;
            return result;
        } else {
            return result;
        }
    }
    public static getDateFormat(date) {
        let currentDate = new Date(date);
        let dd = currentDate.getDate();

        let mm = currentDate.getMonth()+1; 
        let yyyy = currentDate.getFullYear();
        if(dd<10) 
        {
            dd='0'+dd;
        } 

        if(mm<10) 
        {
            mm='0'+mm;
        } 
        return yyyy+'-'+mm+'-'+dd;
    }
    public static getYearMonthFormat(date) {
        let currentDate = new Date(date);
        let dd = currentDate.getDate();

        let mm = currentDate.getMonth()+1; 
        let yyyy = currentDate.getFullYear();
        if(dd<10) 
        {
            dd='0'+dd;
        } 

        if(mm<10) 
        {
            mm='0'+mm;
        } 
        return yyyy+'-'+mm;
    }
    public static getMonthName(dt){
        const mlist = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
          return mlist[dt.getMonth()];
        };
}


    
