import express from "express";
import { uploadProfilePicture } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/protect.midddleware.js";
import { uploadCloudinary } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/upload-avatar",
  authenticate,
  uploadCloudinary.single("avatar"),
  uploadProfilePicture,
);

export default router;
