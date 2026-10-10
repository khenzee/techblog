import { Article } from "../models/article.model.js";
import slugify from "slugify";
import { Category } from "../models/category.model.js";

// Post request ---> create article
export const create = async (req, res) => {
  try {
    const { title, content, thumbnail, category } = req.body;
    if (!title || !content || !category) {
      return res
        .status(400)
        .json({ message: "title, content and category is required" });
      }
      const existingCategory = await Category.findOne({name: category})
      if(!existingCategory){
          res.status(404).json({message: "category not found"})
      }
    const slug = slugify(title, { trim: true, lower: true });
    const article = await Article.create({
      title,
      content,
      thumbnail: thumbnail || "",
      category: existingCategory._id,
      slug,
      author: req.user._id,
    });
    res.status(201).json({ message: "Article created", article });
  } catch (error) {
    return res
      .status(500)
      .json({ message: " internal server error", error: error.message });
  }
};

// get request ---> Get All Articles
export const allArticles = async (req, res) => {
  try {
    const {
      search,
      status,
      category,
      author,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const allowedSortFields = ["title", "createdAt", "updatedAt", "status"];

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ message: "page must be >= 1 and limit must be between 1 and 100" });
    }
    if (!allowedSortFields.includes(sortBy) || !["asc", "desc"].includes(order)) {
      return res.status(400).json({ message: "Invalid sortBy or order" });
    }
    if (status !== undefined && !["draft", "published"].includes(status)) {
      return res.status(400).json({ message: "status must be draft or published" });
    }

    const filter = { deletedAt: null };
    if (status) filter.status = status;
    if (category?.trim()) {
      const escapedCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matchingCategory = await Category.findOne({
        name: { $regex: `^${escapedCategory}$`, $options: "i" },
      }).select("_id");

      // A non-matching category name should return an empty result set.
      filter.category = matchingCategory?._id ?? null;
    }
    if (author) filter.author = author;
    if (search?.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { content: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const sort = { [sortBy]: order === "asc" ? 1 : -1 };
    const skip = (page - 1) * limit;
    const [articles, totalArticles] = await Promise.all([
      Article.find(filter).populate("category", "name").sort(sort).skip(skip).limit(limit),
      Article.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: "articles fetched successfully",
      pagination: {
        page,
        limit,
        totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
      },
      articles,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: " internal server error", error: error.message });
  }
};

// get single [:id] request ----> Get Single Article
export const singleArticle = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug, deletedAt: null });
    if (!article) {
      return res.status(404).json({ message: "article not found" });
    }

    return res.status(200).json({ message: "artcile found", article });
  } catch (error) {
    return res
      .status(500)
      .json({ message: " internal server error", error: error.message });
  }
};

// Patch request ---> Update an article by slug
export const update = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, thumbnail, category, status } = req.body;

    const article = await Article.findOne({ slug, deletedAt: null });
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const updates = {};

    if (title !== undefined) {
      updates.title = title;
      updates.slug = slugify(title, { trim: true, lower: true });
    }
    if (content !== undefined) updates.content = content;
    if (thumbnail !== undefined) updates.thumbnail = thumbnail;
    if (category !== undefined) updates.category = category;
    if (status !== undefined) updates.status = status;

    const updatedArticle = await Article.findByIdAndUpdate(
      article._id,
      updates,
      { new: true, runValidators: true },
    );

    return res
      .status(200)
      .json({
        message: "article updated successfully",
        article: updatedArticle,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: " internal server error", error: error.message });
  }
};

// Delete request ---> Soft delete an article by slug
export const deleteArticle = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOneAndUpdate(
      { slug, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    );

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res
      .status(200)
      .json({ message: "article deleted successfully", article });
  } catch (error) {
    return res
      .status(500)
      .json({ message: " internal server error", error: error.message });
  }
};
