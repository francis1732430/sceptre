
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import FeesHandler from "./fees.handler";
import * as express from "express";

import { FeesUseCase } from "../../domains";
import { FeesTypeTableSchema, FeesTableSchema, AdminUserTableSchema, FeesAssigneesTableSchema } from "../../data/schemas";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, FeesHandler.list)
    .post(authentication, accessrole, FeesHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,FeesHandler.getById1);

router.route("/:standardId/:sectionId/:studentId")
    .get(authentication,accessrole,FeesHandler.getFeesAmountByStudent);

router.route("/:rid")
    .put(authentication,accessrole,FeesHandler.update)
    .delete(authentication,accessrole,FeesHandler.destroy);

router.route("/create-fees-payment")
    .post(authentication,accessrole,FeesHandler.createFeesPayment);

router.route("/getPaymentList")
    .get(authentication, accessrole, FeesHandler.getFeesListByStudent);

router.route("/getPaidFeesList")
    .get(authentication, accessrole, FeesHandler.getPaidFeesList);

router.route("/collected-amount")
    .post(authentication, accessrole, FeesHandler.getTotalPaidAmount);

router.route("/paidFees/:standardId/:sectionId/:studentId")
    .delete(authentication,accessrole,FeesHandler.destroyPaidFees);
    router.route("/pj")
    .get(authentication,accessrole, FeesHandler.getFeesReport);
export default router;
