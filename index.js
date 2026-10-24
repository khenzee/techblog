import "dotenv/config"

import { app } from "./app.js";
import { connectDB } from "./src/config/database.js";

const PORT = 8000


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
