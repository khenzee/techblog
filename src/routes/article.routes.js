import { create, allArticles, singleArticle, update } from "../controllers/article.controller.js";
import { authenticate, authorize } from "../middlewares/protect.midddleware.js";

import express from "express";

const router = express.Router();

router.post("/", authenticate, authorize(["author"]), create)
router.get("/", allArticles)
router.get("/:slug", singleArticle)
router.patch("/:slug", authenticate, authorize(["author"]), update)

export default router;
