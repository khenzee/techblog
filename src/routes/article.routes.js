import { create, allArticles, singleArticle } from "../controllers/article.controller.js";
import express from "express";

const router = express.Router();

router.post("/", create)
router.get("/", allArticles)
router.get("/:slug", singleArticle)

export default router;
