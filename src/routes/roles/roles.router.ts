import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import {RoleHandler} from "./roles.hander";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication,accessrole, RoleHandler.list)

router.route("/:rid")
    .put(authentication,accessrole, RoleHandler.update)
    .delete(authentication,accessrole, RoleHandler.destroy)

router.route("/view/:rid")
    .get(authentication,accessrole, RoleHandler.view)

router.route("/")
    .post(authentication,accessrole, RoleHandler.create);



export default router;
