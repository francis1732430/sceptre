
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import ExamHandler from "./exam.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, ExamHandler.list)
    .post(authentication, accessrole, ExamHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,ExamHandler.getById)

    
router.route("/:rid")
    .put(authentication,accessrole,ExamHandler.update)
    .delete(authentication,accessrole,ExamHandler.destroy);

export default router;
