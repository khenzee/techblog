import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
    comment: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
        required: true
    }
}, {
    timestamps: true
})

export const Comment = mongoose.model("Comment", commentSchema)
