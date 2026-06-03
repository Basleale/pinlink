import { User, Patient, Doctor, Admin } from '../models/User.js';
import  Appointment from '../models/Appointment.js';
import jwt from 'jsonwebtoken';
import generateToken from '../utils/generateToken.js';



//get appointments by doctor or patient
export const getAppointments = async (req, res) => {
    try{
        const userId = req.user?.id || req.user?._id;
        const role = req.user.role;

        if(!userId){
            return res.status(400).json({
                message: "User Identification Missing",
            });
        }

        let query = {};

        if (role === "Patient"){
            query = {patient: userId};
        }else if(role === "Doctor"){
            query = {doctor: userId};}
        // }else if(role === "Admin"){
        //     query = req.query.doctorId ? { doctor: req.query.doctorId } : {};
        // }
        else{
            return res.status(403).json({message: "INVALID ROLE permissions"});
        }

        const appointments = await Appointment.find(query)
        .sort({ startTime: 1 })
        .populate({
            path: "patient",
            select: "firstName lastName email phoneNumber gender age bloodType"
        })
        .populate({
            path: "doctor",
            select: "firstName lastName email department staffID"
        });

        return res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });



    }catch(err){
        console.log("Error in the patientAppointments controller");
        res.status(500).json({
            success: false,
            message: "Failed to fetch appointments",
            error: err.message,
        });
    }
}




//no conflict between doctor and patient timeslots
export const createAppointment = async (req, res) => {
    try {
        const { doctor, startTime, endTime, reason, vistType, location } = req.body;
        const patientId = req.user?.id || req.user?._id; //safe decrypting

        //make sure id is there
        if (!patientId){
            return res.status(400).json({
                success: false,
                message: "User Identification not Found!!",
            })
        }

        if (req.user.role !== "Patient"){
            return res.status(403).json({
                success: false,
                message: "Access denied. Only registered patients can shedule appointments."
            });
        }

        if(!doctor || !startTime || !endTime || !reason){
            return res.status(400).json({
                success: false,
                message: "Missing required fields (doctor, startTime, endTime, reason)"
            });
        }


        //verify doctor exists
        const targetDoctor = await User.findOne({_id: doctor, role: "Doctor"});
        if(!targetDoctor){
            return res.status(404).json({
                success: false,
                message: "The requested doctor not exist or is not authorized as a medical provider."
            });
        }


        //patient exists and fetch data
        const targetPatient = await Patient.findOne({_id: patientId, role: "Patient"});
        if (!targetPatient){
            return res.status(404).json({
                success: false,
                message: "A patient with these credentials does not exist."
            });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);


        
        //get apt duration in minutes 
        const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        if (![30, 60].includes(durationMinutes)) {
            return res.status(400).json({
                success: false,
                message: "Appointments must be either 30 or 60 minutes long"
            });
        }

        if(start >= end){
            return res.status(400).json({
                success: false,
                message: "Invalid time range. start time must occur before end time"
            });
        }


        //double booking issue
        const overlappingAppointment = await Appointment.findOne({
            doctor: doctor,
            status: { $in : ["Confirmed", "Rescheduled"]},
            $or: [
                {startTime: { $gte: start, $lt: end }}, //start overlap
                {endTime: { $gt: start, $lte: end }}, //end overlap
                {startTime: { $lte: start }, endTime: { $gte: end }} //new slot block
            ]
        });


        //patient double booking issue
        const overlappingPatientAppointment = await Appointment.findOne({
            patient: patientId,
            status: { $in : ["Confirmed", "Rescheduled"]},
            $or: [
                {startTime: { $gte: start, $lt: end }}, //start overlap
                {endTime: { $gt: start, $lte: end }}, //end overlap
                {startTime: { $lte: start }, endTime: { $gte: end }} //new slot block
            ]
        })


        if(overlappingAppointment){
            return res.status(409).json({ //status code 409 conflict
                success: false,
                message: "The requested Doctor is already booked or unavaliable during this specific time window."
            });
        } else if(overlappingPatientAppointment){
            return res.status(409).json({ //status code 409 conflict
                success: false,
                message: "Patient already has an appointmnet booked during this specific time window."
            });
        }


        const newAppointment = await Appointment.create({
            patient: patientId,
            doctor,
            startTime: start,
            endTime: end,
            reason,
            vistType: vistType || "In-Person",
            location: location || "Main Clinic",
            status: "Confirmed" // create an review option for doctor and admin
        });

        return res.status(201).json({
            success: true,
            message: "Appointment request submitted successfully!",
            appointment: newAppointment
        });

    } catch(error){
        console.error("Error in the createAppointment controller");
        return res.status(500).json({
            success: false,
            message: "Server error trying to create appointment",
            error: error.message
        })
    }
}

export const cancelAppointment = async (req,res) => {
    try{
        const patientId = req.user?.id  || req.user?._id;
        const { appointmentId } = req.params;

        if(!patientId) {
            return res.status(400).json({
                success: false,
                message: "User Identification missing"
            });
        }

        const appointment = await Appointment.findById(appointmentId);

        //check wheter appointment exists in the first place
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        //make sure it is their appointment
        if(appointment.patient.toString() !== patientId){
            return res.status(403).json({
                success: false,
                message: "You can only modify your own appointments"
            });
        }


        if ( appointment.status === "Cancelled" || appointment.status === "Completed" ){
            return res.status(400).json({
                success: false,
                message: "This appointment can no longer be Cancelled"
            });
        }

        
        //cancel appointment
        appointment.status = "Cancelled";
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment has been cancelled",
            cancelledAppointment: appointment
        })
    }catch(error){
        console.error("Could not cancel appointment", error);

        return res.status(500).json({
            success: false,
            message: "Unable to cancel appointment",
            error: error
        })

    }
}


export const RescheduleAppointment = async (req, res) => {
    try{
        const { appointmentId } = req.params;
        const { startTime, endTime } = req.body;

        const patientId = req.user?.id || req.user?._id;

        if(!patientId) {
            return res.status(400).json({
                success: false,
                message: "User Identification missing"
            });
        }

        const appointment = await Appointment.findById(appointmentId);

        //check wheter appointment exists in the first place
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        //make sure it is their appointment
        if(appointment.patient.toString() !== patientId){
            return res.status(403).json({
                success: false,
                message: "You can only modify your own appointments"
            });
        }


        if ( appointment.status === "Cancelled" || appointment.status === "Completed" ){
            return res.status(400).json({
                success: false,
                message: "This appointment can no longer be rescheduled"
            });
        }

        const newStart = new Date(startTime);
        const newEnd = new Date(endTime);

        //check apt duration
        const durationMinutes = (newEnd.getTime() - newStart.getTime()) / (1000 * 60);
        if (![30, 60].includes(durationMinutes)) {
            return res.status(400).json({
                success: false,
                message:
                    "Appointments must be either 30 or 60 minutes long"
            });
        }

        if(newStart >= newEnd){
            return res.status(400).json({
                success: false,
                message: "End time must be after start time"
            });
        }


        if (appointment.startTime < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Past appointments cannot be rescheduled"
            });
        }


         //double booking issue
        const overlappingAppointment = await Appointment.findOne({
            _id: {$ne: appointmentId},
            doctor: appointment.doctor,
            status: { $in : ["Confirmed", "Rescheduled"]},
            $or: [
                {startTime: { $gte: newStart, $lt: newEnd }}, //start overlap
                {endTime: { $gt: newStart, $lte: newEnd }}, //end overlap
                {startTime: { $lte: newStart }, endTime: { $gte: newEnd }} //new slot block
            ]
        });

        if(overlappingAppointment){
            return res.status(409).json({
                success: false,
                message: "Doctor is unavaliable during that time slot."
            });
        }

        const patientConflict = await Appointment.findOne({
            _id: { $ne: appointmentId },
            patient: patientId,
            status: {
                $in: ["Pending", "Rescheduled"]
            },
            $or: [
                { startTime: { $gte: newStart, $lt: newEnd } },
                { endTime: { $gt: newStart, $lte: newEnd } },
                { startTime: { $lte: newStart }, endTime: { $gte: newEnd } }
            ]
        });

        if (patientConflict) {
            return res.status(409).json({
                success: false,
                message: "You already have another appointment during that time"
            });
        }

        appointment.startTime = newStart;
        appointment.endTime = newEnd;
        appointment.status = "Rescheduled"

        await appointment.save();

        //optionally
        // const updatedAppointment = await Appointment.findByIdAndUpdate(
        //     appointmentId,
        //     {
        //         $set: {
        //             startTime: newStart,
        //             endTime: newEnd,
        //             status: "Rescheduled"
        //         }
        //     },
        //     {
        //         new: true,
        //         runValidators: true
        //     }
        // );
        
        return res.status(200).json({
            success: true,
            message: "Appontment rescheduled successfully",
            appointment
        });

    }catch(error){
        console.error("Error rescheduling appointment: ", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reschedule appointment",
            error: error.message
        });
    }
}




//delete appointment

export const deleteAppointment = async (req,res) => {
    try{
        const {appointmentId} = req.params;

        const patientId = req.user?._id || req.user?.id;

        //check appointment existence
        const appointment = await Appointment.findById(appointmentId);
        if(!appointment){
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }


        //delete your own appointments only
        if( appointment.patient.toString() != patientId){
            return res.status(403).json({
                success: false,
                message: "You can only delete your own appointments"
            });
        }


        const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId, {returnDocument: "after"}); //return deleted doc if needed for something

        return res.status(200).json({
            success: true,
            message: "Appointment deleted successfully",
            deletedAppointment //returning deleted appointment
        });

    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to delete appointment",
            error: error.message
        });
    }
}