import slugify from "slugify";
import { Category } from "../models/category.model.js";

export const create = async (req, res) => {
  try {
    const { name, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "name is needed" });
    }
    const normalizedName = name.trim().toLowerCase();
    const exists = await Category.findOne({ name: normalizedName });
    if (exists) {
      return res.status(400).json({ message: "this category already exists" });
    }

    const slug = slugify(normalizedName, { lower: true, strict: true });
    const category = await Category.create({
      name: normalizedName,
      description,
      slug,
    });

    return res.status(201).json({ message: "Category created", category });
  } catch (error) {
    return res
      .status(500)
      .json({ message: " internal server error", error: error.message });
  }
};
