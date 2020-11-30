
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import BusHandler from "./bus.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, BusHandler.list)
    .post(authentication, accessrole, BusHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,BusHandler.getById)

    
router.route("/:rid")
    .put(authentication,accessrole,BusHandler.update)
    .delete(authentication,accessrole,BusHandler.destroy);

export default router;
