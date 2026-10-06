import { create, allArticles, singleArticle } from "../controllers/article.controller.js";
import { authenticate, authorize } from "../middlewares/protect.midddleware.js";

import express from "express";

const router = express.Router();

router.post("/", authenticate, authorize(["author"]), create)
router.get("/", allArticles)
router.get("/:slug", singleArticle)

export default router;
