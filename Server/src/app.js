import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import apppointmentRoutes from './routes/appointment.routes.js';
import doctorRoutes from './routes/doctor.routes.js'
const app = express()

app.use(cors());
app.use(express.json());

//auth route middleware
app.use('/api/auth', authRoutes);

//patient route
app.use('/api/patient', patientRoutes);

app.use('/api/appointments', apppointmentRoutes);


//to add mock data to DB
app.use('/api/doctor', doctorRoutes);


app.get('/', (req,res) => {
    res.send("API IS RUNNING");
});



export default app;