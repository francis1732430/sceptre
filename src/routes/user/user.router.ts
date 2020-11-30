
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import UserHandler from "./user.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, UserHandler.list)
    .post(authentication, accessrole, UserHandler.create);

router.route("/fileUpload")
    .post(UserHandler.uploadFile);

router.route("/getUsers")
    .post(UserHandler.getuserList);

router.route("/getUsersCount")
    .post(UserHandler.getUserListCount);
    
router.route("/view/:rid/:roleId")
    .get(authentication,accessrole,UserHandler.getById)

    
router.route("/:rid")
    .put(authentication,accessrole,UserHandler.update)
    .delete(authentication,accessrole,UserHandler.destroy);

export default router;
