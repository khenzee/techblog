import { User } from "../models/user.model.js";
import { hashPassword } from "../utils/hashpassword.js";
import bcrypt from "bcrypt"
import { generateToken } from "../utils/generateToken.js";

export const Register = async (req, res) => {
    try {
        const { fullname, email, password, role, avatar } = req.body
        
        // check if the required! input is not available
        if (!fullname || !email || !password) {
            return res.status(400).json({
                message: "fullname, email and password is required"
            })
        }
        // Check if you have created an account before
        const existingUser = await User.findOne({email})
        if (existingUser) {
            return res.status(400).json({
                message: "user already exist with this email. go ahead and login"
            })
        }

        const hashedPassword = await hashPassword(password)
        const user = await User.create({
            fullname,
            email,
            password: hashedPassword,
            role,
            avatar: avatar || "",
        })

        return res.status(201).json({
            message: "user successfully created",
            user
        })

    } catch (error) {
         return res.status(500).json(
            {
                message: " internal server error",
                error: error.message
            }
        )
    }
}


export const Login = async (req, res) => {
    try {
        const { email, password } = req.body
        
        if (!email || !password) {
            return res.status(400).json({
                message: "email and password required"
            })
        }

        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return res.status(404).json({
                message: "user does not exist"
            })
        }

        const isCorrectPassword = await bcrypt.compare(password, existingUser.password)
        if (!isCorrectPassword) {
            return res.status(400).json({
                message: "invalid password"
            })
        }
        const token = generateToken(existingUser._id)
        
        return res.status(200).json({
            message: "login successfull",
            token,
            existingUser
        })

    } catch (error) {
        return res.status(500).json(
            {
                message: " internal server error",
                error: error.message
            }
        )
    }
}

