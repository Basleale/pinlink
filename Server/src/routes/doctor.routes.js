import express from 'express';
import { createDoctor, createDoctorAvailability, getAllDoctors } from '../controllers/doctor.controller.js';
import {protect} from '../controllers/auth.controller.js'

const router = express.Router()

router.post("/", createDoctor);
router.post("/availibility", createDoctorAvailability)
router.get('/',protect, getAllDoctors)


export default router;