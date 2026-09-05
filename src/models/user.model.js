import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        min: 6,
        trim: true,
        selected: false
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        enum: ["admin", "author", "reader"],
        default: "reader"
    }
}, {
    timestamps: true
})

export const User = mongoose.model("User", userSchema)