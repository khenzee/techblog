
import mongoose from "mongoose";

const likeSchema = mongoose.Schema({
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

export const Like = mongoose.model("Like", likeSchema)
