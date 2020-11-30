
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import AttendanceHandler from "./attendance.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, AttendanceHandler.list)
    .post(authentication, accessrole, AttendanceHandler.create);

router.route("/view/:standardId/:sectionId/:attendanceDate")
    .get(authentication,accessrole,AttendanceHandler.getById)

router.route("/present-attendance-count")
    .post(authentication,accessrole,AttendanceHandler.getAttendanceList);

router.route("/:studentId")
    .get(authentication, accessrole, AttendanceHandler.getAttendanceByStudentId)
    
router.route("/")
    .put(authentication,accessrole,AttendanceHandler.update)

export default router;
