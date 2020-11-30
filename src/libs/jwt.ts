import {AdminUserSessionModel} from "../models/admin_user_session";
import * as jwt from "jsonwebtoken";
import {DefaultVal} from "./constants";
import e = require("compression");

export interface BearerObject {
    userId:string;
    accountId:string;
    exp:number;
    iat:number;
    iss:string;
    aud:string;
    role:string;
    token?:string;
    otp?:string;
    otpVerify?:number;
    roleId: string;
}

export class JsonWebToken {
    private password:string;
    private issuer:string;
    private defaultClient:string;

    constructor(opts:any) {
        opts = opts || {};
        this.password = "school admin";
        this.issuer = "school admin";
        this.defaultClient = "simulator";
    }

    public decodeResetToken(token):any {
        if (token != null) {
            return jwt.decode(token);
        }
        return null;
    }

    public verifyResetToken(token:string):boolean {
        return jwt.verify(token, this.password, {
            issuer: this.issuer,
        });
    }

    public encodeResetToken(userId:string):any {
        if (userId != null ) {
            let current = Date.now();
            return jwt.sign({
                userId: userId,
                //accountId: accountId,
                exp: current + DefaultVal.RESET_PASSWORD_EXPIRED, // 15 mins
                iat: current,
                iss: this.issuer,
                //role: role
            }, this.password);
        }
        return null;
    }

    public encodeResetOtp(userId:string,otp:string,otpVerify:number):any {
        if (userId != null && otp!=null ) {
            let current = Date.now();
            return jwt.sign({
                userId: userId,
                otp: otp,
                otpVerify:otpVerify,
                exp: current + DefaultVal.RESET_PASSWORD_EXPIRED, // 15 mins
                iat: current,
                iss: this.issuer
            }, this.password);
        }
        return null;
    }

    public encode(session:AdminUserSessionModel, client = this.defaultClient):any {
        if (session != null) {
            let current = Date.now();
            let expiredTime = current + DefaultVal.TOKEN_EXPIRED;
            let token = jwt.sign({
                // Payload part
                userId: session.userId,
                // Standard
                exp: expiredTime, // 2 days
                iat: current,
                iss: this.issuer,
                aud: client,
                //role: session.role
            }, this.password);

            return token ;
        }
        return null;
    }

    public decode(token:string):BearerObject {
        return jwt.decode(token, this.password);
    }

    public verify(token:string, client = this.defaultClient):boolean {
        return jwt.verify(token, this.password, {
            // audience: client,
            issuer: this.issuer,
        });
    }
}

export default new JsonWebToken(null);
