
import {authentication} from "../../middlewares/authentication";
import {accessrole} from "../../middlewares/accessrole";
import ExamEvolutionHandler from "./exam_evolution.handler";
import * as express from "express";
const router = express.Router();

router.route("/")
    .get(authentication, accessrole, ExamEvolutionHandler.list)
    .post(authentication, accessrole, ExamEvolutionHandler.create);

router.route("/view/:examId/:standardId/:sectionId/:subjectId")
    .get(authentication,accessrole,ExamEvolutionHandler.getById)

router.route("/student-marks")
    .post(authentication,accessrole,ExamEvolutionHandler.getStudentMarks);

router.route("/studentDetails")
    .get(authentication,accessrole,ExamEvolutionHandler.getExamBarCodes);

router.route("/studentBarCode/:examId/:standardId/:sectionId/:subjectId")
    .get(authentication,accessrole,ExamEvolutionHandler.getExamPdf1);

router.route("/student-marks/:examId/:standardId/:sectionId/:subjectId")
    .get(authentication,accessrole,ExamEvolutionHandler.getMarksByClass);

router.route("/weak-student-marks/:standardId/:sectionId/:subjectId")
    .get(authentication,accessrole,ExamEvolutionHandler.getWeakStudentMarksClass);

router.route("/pdfContent")
    .post(authentication,accessrole,ExamEvolutionHandler.getPdfContent);

router.route("/")
    .put(authentication,accessrole,ExamEvolutionHandler.update);

router.route("/view-students-reports")
    .post(authentication,accessrole,ExamEvolutionHandler.viewStudentMarks);

router.route("/getExamList/:studentId")
    .get(authentication,accessrole,ExamEvolutionHandler.getExamList);

router.route("/viewExamPdf")
    .post(authentication,accessrole,ExamEvolutionHandler.viewExamPdf);

router.route("/fileUpload")
    .post(authentication,accessrole,ExamEvolutionHandler.uploadFile);
export default router;
