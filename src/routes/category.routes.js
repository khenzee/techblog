import Router from "express";
import { create } from "../controllers/category.controller.js";
import { authenticate, authorize } from "../middlewares/protect.midddleware.js";


const router = Router();
router.post("/", authenticate, authorize(["admin","author"]), create)

export default router