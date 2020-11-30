
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import ExamTypeHandler from "./exam_type.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, ExamTypeHandler.list)
    .post(authentication, accessrole, ExamTypeHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,ExamTypeHandler.getById)

    
router.route("/:rid")
    .put(authentication,accessrole,ExamTypeHandler.update)
    .delete(authentication,accessrole,ExamTypeHandler.destroy);

export default router;
