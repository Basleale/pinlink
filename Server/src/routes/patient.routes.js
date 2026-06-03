import express from "express";
import { protect } from "../controllers/auth.controller.js";
import { patientInfo, updatePatientInfo, changePatientPassword } from "../controllers/patient.controller.js";


const router = express.Router();

router.get('/me', protect, patientInfo);
router.put('/me', protect, updatePatientInfo);
router.put('/me/pass', protect, changePatientPassword);



export default router;