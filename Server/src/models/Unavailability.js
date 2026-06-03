import mongoose from "mongoose";

const unavailableDateSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        trim: true
    }
    },
    { timestamps: true }
);


const UnavailableDate = mongoose.model("UnavailableDate", unavailableDateSchema);

export default UnavailableDate;


///NOT NEEDED ANYMORE - too much overhead opted for a simple blackout date array on availability