
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import SectionHandler from "./section.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, SectionHandler.list)
    .post(authentication, accessrole, SectionHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,SectionHandler.getById)

    
router.route("/:rid")
    .put(authentication,accessrole,SectionHandler.update)
    .delete(authentication,accessrole,SectionHandler.destroy);

export default router;
