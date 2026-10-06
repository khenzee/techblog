import { Article } from "../models/article.model.js"
import slugify from "slugify"


// Post request ---> create article
export const create = async (req, res) => {
    try {
        const { title, content, thumbnail, category } = req.body;
        if (!title || !content) {
            return res.status(400).json({
                message: "title and content is required"
            })
        }

        const slug = slugify(title, {trim:true, lower:true})
        const article = await Article.create({
            title,
            content,
            thumbnail: thumbnail || "",
            category: category || "",
            slug,
            author: req.user
        })

    } catch (error) {
        return res.status(500).json(
            {
                message: " internal server error",
                error: error.message
            }
        )
    }
}


// get request ---> Get All Articles
export const allArticles = async (req, res) => {
    try {
        const articles = await Article.find()

        //check if there are articles in the database
        if (articles.length === 0) {
            return res.status(404).json({message: "no existing article"})
        }

        return res.status(200).json({
            message: "all articles",
            articles
        })

    } catch (error) {
        return res.status(500).json(
            {
                message: " internal server error",
                error: error.message
            }
        )
    }
}

// get single [:id] request ----> Get Single Article
export const singleArticle = async (req, res) => {
    try {
        const { slug } = req.params
        const article = await Article.findOne({ slug, deletedAt: null })
        if (!article) {
            return res.status(404).json({message: "article not found"})
        }

        return res.status(200).json({
            message: "artcile found",
            article
        })

    } catch (error) {
        return res.status(500).json(
            {
                message: " internal server error",
                error: error.message
            }
        )
    }
}

// Patch request ---> Update an article by slug
export const update = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, content, thumbnail, category, status } = req.body;

        const article = await Article.findOne({ slug, deletedAt: null })
        if (!article) {
            return res.status(404).json({
                message: "Article not found"
            })
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
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: "article updated successfully",
            article: updatedArticle
        })

    } catch (error) {
        return res.status(500).json(
            {
                message: " internal server error",
                error: error.message
            }
        )
    }
}

// Delete request ---> Soft delete an article by slug
export const deleteArticle = async (req, res) => {
    try {
        const { slug } = req.params;

        const article = await Article.findOneAndUpdate(
            { slug, deletedAt: null },
            { deletedAt: new Date() },
            { new: true }
        );

        if (!article) {
            return res.status(404).json({
                message: "Article not found"
            })
        }

        return res.status(200).json({
            message: "article deleted successfully",
            article
        })
    } catch (error) {
        return res.status(500).json({
            message: " internal server error",
            error: error.message
        })
    }
}
