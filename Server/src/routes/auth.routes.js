import express from 'express';
import { register, login, updatePatientInfo, protect } from '../controllers/auth.controller.js';
const router = express.Router();

router.post('/register', register);

router.post('/login', login);

//validated token and update patient health info
router.put('/register/additionalInfo',protect, updatePatientInfo)

export default router;