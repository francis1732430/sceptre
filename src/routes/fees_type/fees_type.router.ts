
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import FeesTypeHandler from "./fees_type.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, FeesTypeHandler.list)
    .post(authentication, accessrole, FeesTypeHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,FeesTypeHandler.getById)

    
router.route("/:rid")
    .put(authentication,accessrole,FeesTypeHandler.update)
    .delete(authentication,accessrole,FeesTypeHandler.destroy);

export default router;
