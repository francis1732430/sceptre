
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import StandardHandler from "./standard.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, StandardHandler.list)
    .post(authentication, accessrole, StandardHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,StandardHandler.getById)

    
router.route("/:rid")
    .put(authentication,accessrole,StandardHandler.update)
    .delete(authentication,accessrole,StandardHandler.destroy);

export default router;
