
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import SubjectHandler from "./subject.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, SubjectHandler.list)
    .post(authentication, accessrole, SubjectHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,SubjectHandler.getById)

    
router.route("/:rid")
    .put(authentication,accessrole,SubjectHandler.update)
    .delete(authentication,accessrole,SubjectHandler.destroy);

export default router;
