import mongoose from "mongoose";


const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    startTime: {
        type: Date, required: true
    },

    endTime: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return this.startTime < value;
            },
            message: "End time must be after the start time."
        }
    },

    status: {
        type: String,
        enum: ["Confirmed", "Completed", "Cancelled", "Rescheduled"],
        default: "Confirmed",
    },
    vistType: {
        type: String,
        enum: ["In-Person", "Telehealth"],
        default: "In-Person"
    },

    location: {
        type: String,
        trim: true, //URL STRING
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },

    notes: {
        type: String,
        trim: true
    },

    cancellationReason: {
        type: String,
        trim: true
    }
},
    {timestamps: true}
);


//performance Indexes

appointmentSchema.index({doctor: 1, startTime: 1});
appointmentSchema.index({patient: 1, startTime: 1});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;


// for later
// const overlappingAppointment = await Appointment.findOne({
//     doctor: doctorId,
//     status: { $ne: "Cancelled" },
//     $or: [
//         { startTime: { $lt: endTime, $gte: startTime } },
//         { endTime: { $gt: startTime, $lte: endTime } }
//     ]
// });