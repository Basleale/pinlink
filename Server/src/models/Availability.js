import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    startDate: {
        type: Date,
        required: true,
    },

    endDate: {
        type: Date,
        required: true,
    },

    weeklySchedule: {
        monday: {
            isAvailable: { type: Boolean, default: false },
            startTime: String,
            endTime: String
        },
        tuesday: {
            isAvailable: { type: Boolean, default: false },
            startTime: String,
            endTime: String
        },
        wednesday: {
            isAvailable: { type: Boolean, default: false },
            startTime: String,
            endTime: String
        },
        thursday: {
            isAvailable: { type: Boolean, default: false },
            startTime: String,
            endTime: String
        },
        friday: {
            isAvailable: { type: Boolean, default: false },
            startTime: String,
            endTime: String
        },
        saturday: {
            isAvailable: { type: Boolean, default: false },
            startTime: String,
            endTime: String
        },
        sunday: {
            isAvailable: { type: Boolean, default: false },
            startTime: String,
            endTime: String
        }
    },

    blackoutDates: [
        {
            type: Date
        }
    ]},
    {timestamps: true}
);






const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;


