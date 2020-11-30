
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import AssignedBusHandler from "./bus_tracking.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, AssignedBusHandler.list)
    .post(authentication, accessrole, AssignedBusHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,AssignedBusHandler.getById)

router.route("/:busId")
    .get(authentication, accessrole, AssignedBusHandler.getBusInfo)
    
router.route("/:rid")
    .put(authentication,accessrole,AssignedBusHandler.update)
    .delete(authentication,accessrole,AssignedBusHandler.destroy);

export default router;
