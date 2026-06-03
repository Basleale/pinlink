import mongoose from "mongoose";

const baseUserOptions = {
    discriminatorKey: 'role',
    timestamps: true
};

const baseUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true //change schema to do validation before inserting data
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['Patient', 'Doctor', 'Admin'],
        required: true
    },

    //check here for an error
    isActive: { //can disable account instead of deleting
        type: Boolean,
        default: true
    },
    lastLogin: Date,
}, baseUserOptions);


const User = mongoose.model('User', baseUserSchema); //user model


//discriminators - role based
const Patient = User.discriminator('Patient', new mongoose.Schema({
    //sparse to make sure the unique index doesn't crash when Doctor/admin get phone Number
    phoneNumber: {type: String, unique: true, sparse: true},
    age: Number,
    gender: String,
    bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    height: Number, // in cm
    weight: Number, // in kg
    allergies: [String],
    emergencyContact: { //emergency contact 
        name: { type: String, trim: true },
        relationship: { type: String, trim: true },
        phone: { type: String, trim: true }
    }
}));


const Doctor = User.discriminator('Doctor', new mongoose.Schema({
    department: {
        type: String,
        required: true,
    },
    staffID: {
        type: String,
        required: true,
        unique: true,
        sparse: true 
    },
    hourlyRate: {
        type: Number,
        default: 100
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
        set: value => Math.round(value * 10) / 10
    },
    specialization: {
        type: String,
        trim: true
    },
    yearsOfExperience: {
        type: Number,
        min: 0,
        default: 0
    }
}));


const Admin = User.discriminator('Admin', new mongoose.Schema({
    permissions: [String],
    adminID: {
        type: String,
        unique: true,
        sparse: true,
    },
}));



export { User, Patient, Doctor, Admin };
export default User; // Do not touch this shit!
