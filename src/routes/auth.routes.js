import express from "express";
import {
  Register,
  Login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", Register);
router.post("/login", Login)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
