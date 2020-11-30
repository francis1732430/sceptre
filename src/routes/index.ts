/**
 *      on 7/20/16.
 */
import auth from "./auth/auth.router";
import roles from "./roles/roles.router";
import users from "./user/user.router";
import locations from "./locations/locations.router";
import standard from "./standard/standard.router";
import section from "./section/section.router";
import subject from "./subject/subject.router";
import classRoute from "./class/class.router";
import homeWorkRoute from "./home_work/home_work.router";
import MarkEvolutionRoute from "./mark_evolution/mark_evolution.router";
import ExamTypeRoute from "./exam_type/exam_type.router";
import ExamRoute from "./exam/exam.router";
import ExamEvolutionRoute from "./exam_evolution/exam_evolution.router";
import AttendanceRoute from "./attendance/attendance.router";
import FeesTypeRoute from "./fees_type/fees_type.router";
import FeesRoute from "./fees/fees.router";
import LessonsRoute from "./lessons/lesson.router";
import SyllabusRoute from "./syllabus/syllabus.router";
import Bus from "./bus/bus.router";
import BusTracking from "./bus_tracking/bus_tracking.router";
import AssignedBus from "./assigned_bus/assigned_bus.router";
import Ebooks from "./ebooks/ebook.router";
import * as express from "express";

const router = express.Router();
router.use("/auth", auth);
router.use("/roles", roles);
router.use("/users", users);
router.use("/standard", standard);
router.use("/section", section);
router.use("/subject", subject);
router.use("/class", classRoute);
router.use("/home_work", homeWorkRoute);
router.use("/mark_evolution", MarkEvolutionRoute);
router.use("/exam_type", ExamTypeRoute);
router.use("/exam", ExamRoute);
router.use("/exam_evalution", ExamEvolutionRoute);
router.use("/attendance", AttendanceRoute);
router.use("/fees_type", FeesTypeRoute);
router.use("/fees", FeesRoute);
router.use("/lessons", LessonsRoute);
router.use("/syllabus", SyllabusRoute);
router.use("/bus", Bus);
router.use("/bus-tracking", BusTracking);
router.use("/assigned-bus", AssignedBus);
router.use("/e-book", Ebooks);
router.use("/locations", locations);

router.get("/", (req:express.Request, res:express.Response) => {
    
    res.end();
});

export default router; 
