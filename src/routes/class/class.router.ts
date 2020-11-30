
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import ClassHandler from "./class.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, ClassHandler.list)
    .post(authentication, accessrole, ClassHandler.create);

router.route("/view/:standardId/:sectionId")
    .get(authentication,accessrole,ClassHandler.getById)

    
router.route("/:rid")
    .put(authentication,accessrole,ClassHandler.update)
    .delete(authentication,accessrole,ClassHandler.destroy);

export default router;
