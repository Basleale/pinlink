import { User, Patient } from "../models/User.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import generateToken from '../utils/generateToken.js';


export const patientInfo = async (req, res) => {
    try{

        //find userID from the decoded token
        const userId = req.user.id;

        if(!userId){
            return res.status(400).json({message: "User Identification missing"});
        }

        const { role } = req.user;

        //REMOVE and allow admin and doc to update patient info
        if(role!=="Patient"){
            return res.status(403).json({
                message: "Forbidden: Access restricted to patients only",
            })
        }

        //get only the required feilds for now no password
        const patient = await Patient.findById(userId).select( 
            " firstName lastName email phoneNumber age gender bloodType height weight allergies emergencyContact "
        );

        if(!patient){
            return res.status(404).json({
                message: "Patient profile not found!",
            });
        }
        
        res.status(200).json({
            message: "Patient Info found sucessfully",
            patient: {
                id: patient._id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                email: patient.email,
                phoneNumber: patient.phoneNumber,
                age: patient.age,
                gender: patient.gender,
                bloodType: patient.bloodType,
                height: patient.height,
                weight: patient.weight,
                allergies: patient.allergies,
                emergencyContact: { //emergency contact info
                    name: patient.emergencyContact?.name || "",
                    relationship: patient.emergencyContact?.relationship || "",
                    phone: patient.emergencyContact?.phone || ""
                }
            }
        })

    }catch(err){
        console.error("Error in patientInfo controller", err);
        res.status(500).json({
            message: err.message || "Something went wrong when fetching patient details",
        });
    }
}


//does not include email and password
export const updatePatientInfo = async (req, res) => {
    try{    

        //find userID from the decoded token
        const userId = req.user.id;

        if(!userId){
            return res.status(400).json({message: "User Identification missing"});
        }


        const { firstName, lastName, phoneNumber, age, height, gender, weight, bloodType, allergies, emergencyContact } = req.body;

        const role = req.user.role; //use role form decoded user if you don't send it from the frontend

        if(role!=="Patient"){
            return res.status(403).json({
                message: "Forbidden access - Only patient can update into",
            });
        }

        const existingUserPhoneNumber = await User.findOne({phoneNumber});


        if (phoneNumber) {
            const existingUserPhoneNumber =
                await User.findOne({ phoneNumber });

            if (
                existingUserPhoneNumber &&
                existingUserPhoneNumber._id.toString() !== userId
            ) {
                return res.status(400).json({
                message: "User with this phone number already exists",
                });
            }
        }


        const updatedPatient = await Patient.findByIdAndUpdate(
            userId,
            {
                $set: {
                    firstName,
                    lastName,
                    phoneNumber,
                    age,
                    bloodType,
                    gender,
                    height,
                    weight,
                    allergies,

                    emergencyContact: {
                        name: emergencyContact.name,
                        relationship: emergencyContact.relationship,
                        phone: emergencyContact.phone
                    }
                }
            },
            {returnDocument: "after", runValidators: true}
        )

        if(!updatedPatient){
            return res.status(404).json({
                message: "PATIENT NOT FOUND",
            });
        }

        res.status(200).json({
            message: "Patient info updated succesfully",
            user: {
                    firstName: updatedPatient.firstName,
                    lastName: updatedPatient.lastName,
                    phoneNumber: updatedPatient.phoneNumber,
                    bloodType: updatedPatient.bloodType,
                    age: updatedPatient.age,
                    gender: updatedPatient.gender,
                    height: updatedPatient.height,
                    weight: updatedPatient.weight,
                    allergies: updatedPatient.allergies,
                    emergencyContact: updatedPatient.emergencyContact,
            }
        });

    }catch(err){
        console.error("Error in patientInfo controller", err);
        res.status(500).json({
            message: err.message || "Something went wrong updating patient info",
        })
    }

}



//get the changed password -- check old pass and new pass comapre on frontEnd
export const changePatientPassword = async (req, res) => {
    try{
        const { newPassword , oldPassword} = req.body;

        //decode user uisng token
        const userID = req.user.id;
        const role = req.user.role;

        if(!userID){
            return res.status(404).json({
                message: "User Identification Missing",
            });
        }

        if(role!=="Patient"){
            return res.status(403).json({
                message: "FORBIDDEN ACCESS",
            });
        }


        const patient = await Patient.findById(userID);
        if(!patient){
            return res.status(404).json({
                message: "Patient Not Found",
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, patient.password);
        if(!isMatch){
            return res.status(403).json({
                message: "Old Password is incorrect",
            })
        }


        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedPatient = await Patient.findByIdAndUpdate(
            userID,
            {
                $set: {
                    password: newHashedPassword
                }
            },
            {returnDocument: "after", runValidators: true},
        );

        if(!updatedPatient){
            res.status(404).json({message: "Patient could not be found"});
        }


        //new token created
        const token = generateToken(Patient);


        res.status(200).json({
            message: "Successful Password Update",
            token: token,
            user: {
                email: updatedPatient.email,
                firstName: updatedPatient.firstName,
                lastName: updatedPatient.lastName,
                phoneNumber: updatedPatient.phoneNumber,
                bloodType: updatedPatient.bloodType,
                age: updatedPatient.age,
                gender: updatedPatient.gedner,
                height: updatedPatient.height,
                weight: updatedPatient.weight,
                allergies: updatedPatient.allergies,
                emergencyContact: updatedPatient.emergencyContact
            }
        })

    }catch(err){
        console.log("Error in changePatientPassword controller", err);
        res.status(500).json({
            message: err.message,
        })
    }
}