import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Patient } from '../models/User.js';
import generateToken from '../utils/generateToken.js';


//login ----- needs some adjustment for doctor and Admin login
export const login = async (req, res) => {
    try{
        const{ email, password, role } = req.body;

        //find user
        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({
                message: "Invalid credentials"
            });
        }

        //role check
        if(user.role !== role){
            return res.status(403).json({
                message: "Unauthorized role",
            });
        }

        //compare password
        const isMatch = await bcrypt.compare( password, user.password );

        if(!isMatch){
            return res.status(400).json({
                message: "Invalid credentials - Password is incorrect",
            })
        }

        const responsePayload = {
            id:user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        };

        // Dynamically attach role-specific profiles -- try new thing  ----sample for admin and Doctor login
        // if (user.role === 'Patient') {
        //     responsePayload.phoneNumber = user.phoneNumber || "";
        //     responsePayload.emergencyContact = user.emergencyContact || null;
        // } else if (user.role === 'Doctor') {
        //     responsePayload.staffID = user.staffID || "";
        //     responsePayload.department = user.department || "";
        // } else if (user.role === 'Admin') {
        //     responsePayload.adminID = user.adminID || "";
        //     responsePayload.permissions = user.permissions || [];
        // }


        //token
        const token = generateToken(user);

        res.status(200).json({
            message: "Login successful",
            token,
            user: responsePayload,
        });

    } catch(error){
        res.status(500).json({
            message: error.message,
        })
    }
}


//register patinet
export const register = async (req,res) => {
    try{
        const {firstName, lastName, email, password, role} = req.body;

        //check existing user
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                message: "User with this email already exists",
            });
        }


        //hash password
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);


        //create user
        const user = await Patient.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
        });


        //token
        const token = generateToken(user);

        res.status(201).json({
            message: "User successfully created",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });

    }catch(error){
        res.status(500).json({
            message: error.message,
        })
    }
}



//token validation middleware
export const protect = (req,res,next) => {
    //get token
    const token = req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({message: "Not authorized, no token"});
    }

    //validate token
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        

        next();
    } catch(error){
        res.status(401).json({message: "NOT AUTHORIZED, token validation failed"});
    }
};





//add patient details after registration

export const updatePatientInfo = async (req, res) => {
    
    try{
        const { phoneNumber, age, gender, bloodType, height, weight, allergies, emergencyContact } = req.body;

        //find userID --- user from validated token
        const userId = req.user.id;

        if(!userId){
            return res.status(400).json({message: "User Identification missing"});
        }


        //exclude patient with this phone number
        const existingUser = await Patient.findOne({phoneNumber, _id: {$ne: userId}});
        if(existingUser){
            return res.status(400).json({
                message: "User with this Phone Number already exists",
            });
        }


        const updatedUser = await Patient.findByIdAndUpdate(
            userId,
            {
                $set: {
                    phoneNumber,
                    age,
                    gender,
                    bloodType,
                    height,
                    weight,
                    allergies,
                    emergencyContact: { //handle emergency Contact
                        name: emergencyContact?.name || "",
                        relationship: emergencyContact?.relationship || "",
                        phone: emergencyContact?.phone || ""
                    }
                }
            },
            {returnDocument: "after", runValidators: true} //return updated doc and run validation
        )

        if(!updatedUser){
            return res.status(404).json({message: "Patient not found"});
        }

        res.status(200).json({
            message: "Health profile updated successfully",
            user: {
                id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                role: updatedUser.role,
                phoneNumber: updatedUser.phoneNumber,
                bloodType: updatedUser.bloodType,
                emergencyContact: updatedUser.emergencyContact
            }
        });
        
    }catch(error){
        res.status(500).json({
            message: error.message,
        });
    }

};