
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import BusTrackingHandler from "./assigned_bus.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, BusTrackingHandler.list)
    .post(authentication, accessrole, BusTrackingHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,BusTrackingHandler.getById)

    
router.route("/:rid")
    .put(authentication,accessrole,BusTrackingHandler.update)
    .delete(authentication,accessrole,BusTrackingHandler.destroy);

export default router;
