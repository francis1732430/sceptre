
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import MarkEvolutionHandler from "./mark_evolution.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, MarkEvolutionHandler.list)
    .post(authentication, accessrole, MarkEvolutionHandler.create);

router.route("/view/:homeWorkId/:standardId/:sectionId")
    .get(authentication,accessrole,MarkEvolutionHandler.getById);

router.route("/home-work-details/:studentId")
    .get(authentication,accessrole,MarkEvolutionHandler.getMarkDetailsByStudentId);
router.route("/")
    .put(authentication,accessrole,MarkEvolutionHandler.update)

export default router;
