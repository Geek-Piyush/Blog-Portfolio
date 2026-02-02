import { Router } from "express";
import {
  getAllBlogs,
  getAllBlogsAdmin,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/slug/:slug", getBlogBySlug);

// Protected admin routes
router.get("/admin", verifyToken, getAllBlogsAdmin);
router.get("/admin/:id", verifyToken, getBlogById);
router.post("/", verifyToken, createBlog);
router.put("/:id", verifyToken, updateBlog);
router.delete("/:id", verifyToken, deleteBlog);

export default router;
