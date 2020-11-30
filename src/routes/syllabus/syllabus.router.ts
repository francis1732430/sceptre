
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import SyllabusHandler from "./syllabus.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, SyllabusHandler.list)
    .post(authentication, accessrole, SyllabusHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,SyllabusHandler.getById)

    
router.route("/:rid")
    .put(authentication,accessrole,SyllabusHandler.update)
    .delete(authentication,accessrole,SyllabusHandler.destroy);

export default router;
