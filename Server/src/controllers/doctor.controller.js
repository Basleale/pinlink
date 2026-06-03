import bcrypt from "bcryptjs";
import { Doctor } from "../models/User.js";
import Availability from "../models/Availability.js";

//get all doctors
export const getAllDoctors = async (req,res) => {
    try{
        const userId = req.user?.id || req.user?._id;

        if(!userId){
            return res.status(400).json({
                success: false,
                message: "User Identification Missing",
            });
        }

        const doctors = await Doctor.find({
            isActive: true,}
        ).select(
            " _id firstName lastName role department hourlyRate rating specialization yearsOfExperience "
        ).sort({
            department: 1,
            firstName: 1
        });

        return res.status(200).json({
            success: true,
            message: "Successfully got all doctors",
            count: doctors.length,
            doctors
        });

    }catch(error){
        console.log("Error fetching doctors:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch doctors",
            error: error.message
        })
    }

}





//doctor creation middleware to insert mock data
export const createDoctor = async (req, res) => {
    try {
        // const adminId = req.user?.id || req.user?._id;

        // if (!adminId) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "User identification missing"
        //     });
        // }

        // if (req.user.role !== "Admin") {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Only administrators can create doctor accounts"
        //     });
        // }

        const {
            email,
            password,
            firstName,
            lastName,
            department,
            specialization,
            yearsOfExperience,
            hourlyRate,
            staffID,
            rating
        } = req.body;

        if (
            !email ||
            !password ||
            !firstName ||
            !lastName ||
            !department ||
            !staffID
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email, password, first name, last name, department and staff ID are required"
            });
        }

        const existingDoctor = await Doctor.findOne({
            $or: [
                { email: email.toLowerCase() },
                { staffID }
            ]
        });

        if (existingDoctor) {
            return res.status(409).json({
                success: false,
                message:
                    existingDoctor.email === email.toLowerCase()
                        ? "A user with this email already exists"
                        : "A doctor with this staff ID already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const doctor = await Doctor.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            role: "Doctor",
            department,
            specialization: specialization || "",
            yearsOfExperience: yearsOfExperience || 0,
            hourlyRate: hourlyRate || 100,
            staffID,
            rating: rating
        });

        return res.status(201).json({
            success: true,
            message: "Doctor created successfully",
            doctor: {
                id: doctor._id,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                email: doctor.email,
                department: doctor.department,
                specialization: doctor.specialization,
                yearsOfExperience: doctor.yearsOfExperience,
                hourlyRate: doctor.hourlyRate,
                staffID: doctor.staffID,
                rating: doctor.rating,
                role: doctor.role
            }
        });

    } catch (error) {
        console.error("Error creating doctor:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create doctor",
            error: error.message
        });
    }
};




//create mock data for the createDoctorAvailability
export const createDoctorAvailability = async (req, res) => {
    try {
        const {
            doctor,
            startDate,
            endDate,
            weeklySchedule,
            blackoutDates
        } = req.body;

        if (
            !doctor ||
            !startDate ||
            !endDate ||
            !weeklySchedule
        ) {
            return res.status(400).json({
                success: false,
                message: "doctor, startDate, endDate and weeklySchedule are required"
            });
        }

        const doctorExists = await Doctor.findById(doctor);

        if (!doctorExists) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date"
            });
        }

        const existingAvailability = await Availability.findOne({
            doctor
        });

        if (existingAvailability) {
            return res.status(409).json({
                success: false,
                message: "Doctor already has an availability schedule"
            });
        }

        const availability = await Availability.create({
            doctor,
            startDate: start,
            endDate: end,
            weeklySchedule,
            blackoutDates: blackoutDates || []
        });

        return res.status(201).json({
            success: true,
            message: "Doctor availability created successfully",
            availability
        });

    } catch (error) {
        console.error("Error creating availability:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create doctor availability",
            error: error.message
        });
    }
};