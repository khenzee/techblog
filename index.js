import dotenv from "dotenv"
dotenv.config("/.env")

import { app } from "./app.js";
import { connectDB } from "./src/config/database.js";

const PORT = 8000

app.get("/", (req, res) => {
    return res.json({
        name: "emma",
        course: "backend",
        greet: "hello emma, welcome to backend class"
    })
})

const server = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
        return console.log(`server running at http://localhost:${PORT}`)
})
    } catch (error) {
        console.log(error,"internal server error")
    }

}


server()
