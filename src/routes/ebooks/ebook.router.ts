
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import EbookHandler from "./ebook.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, EbookHandler.list)
    .post(authentication, accessrole, EbookHandler.create);

router.route("/view/:rid")
    .get(authentication,accessrole,EbookHandler.getById)

router.route("/upload-file")
    .post(authentication,accessrole,EbookHandler.uploadFile);

router.route("/")
    .put(authentication,accessrole,EbookHandler.update)
router.route("/:rid")
    .delete(authentication,accessrole,EbookHandler.destroy);

export default router;
