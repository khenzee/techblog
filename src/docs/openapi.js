const messageResponse = {
  type: "object",
  properties: { message: { type: "string" } },
};

const errorResponse = {
  type: "object",
  properties: {
    message: { type: "string" },
    error: { type: "string" },
  },
};

const bearerAuth = [{ bearerAuth: [] }];

export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "TechHub API",
    version: "1.0.0",
    description:
      "API documentation for TechHub authentication, articles, categories, and user profile uploads.",
  },
  servers: [{ url: "http://localhost:8000", description: "Local API server" }],
  tags: [
    { name: "Authentication" },
    { name: "Articles" },
    { name: "Categories" },
    { name: "Users" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6651d6c2b326a3559ca80123" },
          fullname: { type: "string", example: "Ada Lovelace" },
          email: { type: "string", format: "email", example: "ada@example.com" },
          role: { type: "string", enum: ["admin", "author", "reader"] },
          avatar: { type: "string", format: "uri", nullable: true },
          emailVerified: { type: "boolean" },
        },
      },
      Category: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string", example: "Tech" },
          slug: { type: "string", example: "tech" },
          description: { type: "string" },
        },
      },
      Article: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          slug: { type: "string" },
          content: { type: "string" },
          thumbnail: { type: "string", format: "uri" },
          status: { type: "string", enum: ["draft", "published"] },
          category: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Category" }] },
          author: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Error: errorResponse,
    },
  },
  paths: {
    "/api/v1/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullname", "email", "password"],
                properties: {
                  fullname: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" },
                  role: { type: "string", enum: ["admin", "author", "reader"] },
                  avatar: { type: "string", format: "uri" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User created", content: { "application/json": { schema: messageResponse } } },
          400: { description: "Required fields missing or email already registered", content: { "application/json": { schema: messageResponse } } },
          500: { description: "Server error", content: { "application/json": { schema: errorResponse } } },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in and receive a JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful; response contains token and user" },
          400: { description: "Missing credentials or invalid password", content: { "application/json": { schema: messageResponse } } },
          404: { description: "User does not exist", content: { "application/json": { schema: messageResponse } } },
        },
      },
    },
    "/api/v1/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Email a password reset OTP",
        description: "Sends a six-digit OTP that expires after ten minutes. The response is generic to avoid disclosing whether an email is registered.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["email"], properties: { email: { type: "string", format: "email" } } } } },
        },
        responses: {
          200: { description: "Generic confirmation", content: { "application/json": { schema: messageResponse } } },
          400: { description: "Email is required", content: { "application/json": { schema: messageResponse } } },
          503: { description: "SMTP email delivery failed", content: { "application/json": { schema: messageResponse } } },
        },
      },
    },
    "/api/v1/auth/reset-password": {
      post: {
        tags: ["Authentication"],
        summary: "Reset a password with an emailed OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otp", "newPassword"],
                properties: {
                  email: { type: "string", format: "email" },
                  otp: { type: "string", pattern: "^\\d{6}$", example: "123456" },
                  newPassword: { type: "string", format: "password", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Password reset successfully", content: { "application/json": { schema: messageResponse } } },
          400: { description: "Missing fields or invalid/expired OTP", content: { "application/json": { schema: messageResponse } } },
        },
      },
    },
    "/api/v1/article": {
      get: {
        tags: ["Articles"],
        summary: "List articles",
        parameters: [
          { in: "query", name: "search", schema: { type: "string" }, description: "Search title and content" },
          { in: "query", name: "status", schema: { type: "string", enum: ["draft", "published"] } },
          { in: "query", name: "category", schema: { type: "string" }, description: "Category name" },
          { in: "query", name: "author", schema: { type: "string" }, description: "Author MongoDB ID" },
          { in: "query", name: "sortBy", schema: { type: "string", enum: ["title", "createdAt", "updatedAt", "status"], default: "createdAt" } },
          { in: "query", name: "order", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
          { in: "query", name: "page", schema: { type: "integer", minimum: 1, default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          200: { description: "Paginated articles" },
          400: { description: "Invalid pagination, sort, or status parameters", content: { "application/json": { schema: messageResponse } } },
        },
      },
      post: {
        tags: ["Articles"],
        summary: "Create an article with a thumbnail upload",
        description: "Requires a JWT for an author account. The category field is the existing category name.",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["title", "content", "category", "thumbnail"],
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  category: { type: "string" },
                  thumbnail: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Article created" },
          400: { description: "Missing fields or thumbnail", content: { "application/json": { schema: messageResponse } } },
          401: { description: "Authentication required" },
          403: { description: "Author role required" },
          404: { description: "Category not found", content: { "application/json": { schema: messageResponse } } },
          500: { description: "Article creation or thumbnail upload failed", content: { "application/json": { schema: errorResponse } } },
        },
      },
    },
    "/api/v1/article/{slug}": {
      parameters: [{ in: "path", name: "slug", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Articles"],
        summary: "Get an article by slug",
        responses: {
          200: { description: "Article found" },
          404: { description: "Article not found", content: { "application/json": { schema: messageResponse } } },
        },
      },
      patch: {
        tags: ["Articles"],
        summary: "Update an article by slug",
        description: "Requires a JWT for an author account. Category is a category ID; thumbnail is a URL string.",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  thumbnail: { type: "string", format: "uri" },
                  category: { type: "string" },
                  status: { type: "string", enum: ["draft", "published"] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Article updated" },
          401: { description: "Authentication required" },
          403: { description: "Author role required" },
          404: { description: "Article not found", content: { "application/json": { schema: messageResponse } } },
        },
      },
    },
    "/api/v1/category": {
      post: {
        tags: ["Categories"],
        summary: "Create a category",
        description: "Requires a JWT for an admin or author account.",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: { name: { type: "string" }, description: { type: "string" } },
              },
            },
          },
        },
        responses: {
          201: { description: "Category created" },
          400: { description: "Missing or duplicate category name", content: { "application/json": { schema: messageResponse } } },
          401: { description: "Authentication required" },
          403: { description: "Admin or author role required" },
        },
      },
    },
    "/api/v1/user/upload-avatar": {
      post: {
        tags: ["Users"],
        summary: "Upload the authenticated user's avatar",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["avatar"],
                properties: { avatar: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: {
          200: { description: "Avatar uploaded and profile updated" },
          400: { description: "No avatar file uploaded", content: { "application/json": { schema: messageResponse } } },
          401: { description: "Authentication required" },
          500: { description: "Avatar upload failed" },
        },
      },
    },
  },
};
