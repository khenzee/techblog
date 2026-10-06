import jwt from "jsonwebtoken"

export const generateToken = (userID) => {
    return jwt.sign(
        { id: userID },
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    )
}