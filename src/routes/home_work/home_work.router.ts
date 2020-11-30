
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import HomeWorkHandler from "./home_work.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, HomeWorkHandler.list)
    .post(authentication, accessrole, HomeWorkHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,HomeWorkHandler.getById)

    
router.route("/:rid")
    .put(authentication,accessrole,HomeWorkHandler.update)
    .delete(authentication,accessrole,HomeWorkHandler.destroy);

export default router;
