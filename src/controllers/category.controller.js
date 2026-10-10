import slugify from "slugify";
import { Category } from "../models/category.model.js";

export const create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ message: "name is needed" });
    }
    const slug = slugify(name, {lower: true, strict:true})
    const exists = await Category.findOne({ name: name.toLowerCase() });
      if (exists) {
          res.status(400).json({message: "this category already exists"})
      }
      const category = await Category.create({
        name: name.toLowerCase(),
        description,
        slug
      })
  } catch (error) {
    return res
      .status(500)
      .json({ message: " internal server error", error: error.message });
  }
};
