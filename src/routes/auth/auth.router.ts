/**
 *      on 7/20/16.
 */
import {authentication} from "../../middlewares/authentication";
import {AuthHandler} from "./auth.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .post(AuthHandler.login)
    .delete(authentication, AuthHandler.logout);

router.route("/resetPassword/:rpToken")
    .post(AuthHandler.resetPassword);




router.route("/sendOtp")
    .post(AuthHandler.sendOtp);

router.route("/resendOtp/:rpToken")
    .get(AuthHandler.resendOtp);

router.route("/verifyOtp/:rpToken")
    .post(AuthHandler.verifyOtp);



export default router;
