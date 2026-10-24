import { User } from "../models/user.model.js";

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file?.path) {
      return res.status(400).json({ message: "No avatar file uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to upload profile picture",
      error: error.message,
    });
  }
};
