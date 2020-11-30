
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import LessonsHandler from "./lesson.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, LessonsHandler.list)
    .post(authentication, accessrole, LessonsHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,LessonsHandler.getById)

router.route("/")
    .put(authentication,accessrole,LessonsHandler.update)
router.route("/:rid")
    .delete(authentication,accessrole,LessonsHandler.destroy);

export default router;
