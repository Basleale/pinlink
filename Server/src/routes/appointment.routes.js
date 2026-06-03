import express from 'express';
import { protect }from '../controllers/auth.controller.js'
import { createAppointment, deleteAppointment, getAppointments, cancelAppointment, RescheduleAppointment } from '../controllers/appointment.controller.js';


const router = express.Router()

router.use(protect); //use for all

router.get("/", getAppointments);
router.post("/", createAppointment);
router.put("/:appointmentId/cancel", cancelAppointment)
router.put("/:appointmentId/reschedule", RescheduleAppointment);
router.delete("/:appointmentId/delete", deleteAppointment);


export default router;