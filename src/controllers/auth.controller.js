import { User } from "../models/user.model.js";
import { hashPassword } from "../utils/hashpassword.js";
import bcrypt from "bcrypt"
import { generateToken } from "../utils/generateToken.js";
import { randomInt, createHmac } from "node:crypto";
import { sendEmail } from "../utils/email.js";

const OTP_EXPIRATION_MS = 10 * 60 * 1000;
const hashOtp = (otp) =>
    createHmac("sha256", process.env.JWT_SECRET).update(otp).digest("hex");

const escapeHtml = (value = "") =>
    value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);

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

export const forgotPassword = async (req, res) => {
    const genericMessage = "If this email is registered, an OTP will be sent.";

    try {
        const emailValue = req.body?.email;
        const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
        if (!email) {
            return res.status(400).json({ message: "email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: genericMessage });
        }

        const otp = randomInt(100000, 1000000).toString();
        user.resetPasswordOtpHash = hashOtp(otp);
        user.resetPasswordExpires = new Date(Date.now() + OTP_EXPIRATION_MS);
        await user.save();

        const name = escapeHtml(user.fullname || "there");
        const subject = "TechHub - Password Reset Request";
        const text = `Hi ${user.fullname || "there"}, your password reset OTP is ${otp}. It expires in 10 minutes.`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Hi ${name}, use this one-time password to reset your password:</p>
                <p style="font-size: 28px; font-weight: bold; letter-spacing: 5px;">${otp}</p>
                <p>This OTP expires in 10 minutes. If you did not request it, you can ignore this email.</p>
            </div>`;

        try {
            await sendEmail({ to: user.email, subject, text, html });
        } catch (emailError) {
            await User.updateOne(
                { _id: user._id, resetPasswordOtpHash: hashOtp(otp) },
                { $unset: { resetPasswordOtpHash: 1, resetPasswordExpires: 1 } },
            );
            console.error("Failed to send password reset OTP:", emailError.message);
            return res.status(503).json({
                message: "Unable to send password reset email. Check the SMTP configuration and try again.",
            });
        }

        return res.status(200).json({ message: genericMessage });
    } catch (error) {
        console.error("Failed to process password reset OTP:", error.message);
        return res.status(500).json({ message: "Failed to process password reset request" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const emailValue = req.body?.email;
        const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
        const otp = req.body?.otp?.toString().trim();
        const newPassword = req.body?.newPassword;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "email, otp and newPassword are required",
            });
        }
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({ message: "otp must be a 6-digit code" });
        }
        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({
                message: "newPassword must be at least 6 characters",
            });
        }

        const user = await User.findOne({
            email,
            resetPasswordOtpHash: hashOtp(otp),
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const password = await hashPassword(newPassword);
        const updateResult = await User.updateOne(
            {
                _id: user._id,
                resetPasswordOtpHash: hashOtp(otp),
                resetPasswordExpires: { $gt: new Date() },
            },
            {
                $set: { password },
                $unset: { resetPasswordOtpHash: 1, resetPasswordExpires: 1 },
            },
        );
        if (!updateResult.matchedCount) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        return res.status(200).json({
            message: "Password has been successfully reset",
        });
    } catch (error) {
        console.error("Failed to reset password:", error.message);
        return res.status(500).json({ message: "Failed to reset password" });
    }
};

