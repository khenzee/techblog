import express from "express"
import authRoutes from "./src/routes/auth.routes.js"

export const app = express()

app.use(express.json())
app.use("/api/v1/auth", authRoutes)

