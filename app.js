import express from "express"
import authRoutes from "./src/routes/auth.routes.js"
import articleRoutes from "./src/routes/article.routes.js"
import categoryRoutes from "./src/routes/category.routes.js"

export const app = express()

app.use(express.json())
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/article", articleRoutes)
app.use("/api/v1/category", categoryRoutes)

