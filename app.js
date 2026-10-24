import express from "express"
import authRoutes from "./src/routes/auth.routes.js"
import articleRoutes from "./src/routes/article.routes.js"
import categoryRoutes from "./src/routes/category.routes.js"
import userRoutes from "./src/routes/user.routes.js"
import swaggerUi from "swagger-ui-express"
import { openapi } from "./src/docs/openapi.js"

export const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/article", articleRoutes)
app.use("/api/v1/category", categoryRoutes)
app.use("/api/v1/user", userRoutes)
app.get("/api-docs.json", (req, res) => res.json(openapi))
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi))

// Keep errors from middleware (including Multer/Cloudinary) readable in API responses.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)

  const detail =
    typeof error?.message === "string"
      ? error.message
      : typeof error === "string"
        ? error
        : (() => {
            try {
              return JSON.stringify(error)
            } catch {
              return "Unknown error"
            }
          })()

  console.error("Request failed:", detail)
  return res.status(error?.statusCode || error?.status || 500).json({
    message: "Request failed",
    error: detail || "Unknown error",
  })
})

