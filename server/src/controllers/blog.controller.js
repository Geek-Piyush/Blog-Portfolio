import Blog from "../models/blog.model.js";
import { deleteFromCloudinary } from "../middlewares/upload.middleware.js";

// Get all blogs (public - only published)
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true })
      .select("-content")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error("Get all blogs error:", error);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// Get all blogs for admin (including drafts)
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .select("-content")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error("Get all blogs admin error:", error);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// Get single blog by slug (public)
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, published: true });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error("Get blog by slug error:", error);
    res.status(500).json({ message: "Failed to fetch blog" });
  }
};

// Get single blog by ID (admin)
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error("Get blog by ID error:", error);
    res.status(500).json({ message: "Failed to fetch blog" });
  }
};

// Create blog
export const createBlog = async (req, res) => {
  try {
    const { title, slug, content, coverImage, images, tags, published } = req.body;

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({ message: "A blog with this slug already exists" });
    }

    const blog = new Blog({
      title,
      slug,
      content,
      coverImage: coverImage || { url: "", publicId: "" },
      images: images || [],
      tags: tags || [],
      published: published || false,
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ message: "Failed to create blog" });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, coverImage, images, tags, published } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if new slug conflicts with another blog
    if (slug && slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug });
      if (existingBlog) {
        return res.status(400).json({ message: "A blog with this slug already exists" });
      }
    }

    // Update fields
    if (title !== undefined) blog.title = title;
    if (slug !== undefined) blog.slug = slug;
    if (content !== undefined) blog.content = content;
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (images !== undefined) blog.images = images;
    if (tags !== undefined) blog.tags = tags;
    if (published !== undefined) blog.published = published;

    await blog.save();
    res.json(blog);
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ message: "Failed to update blog" });
  }
};

// Delete blog (with image cleanup)
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Delete cover image from Cloudinary if exists
    if (blog.coverImage && blog.coverImage.publicId) {
      try {
        await deleteFromCloudinary(blog.coverImage.publicId);
      } catch (error) {
        console.error("Error deleting cover image:", error);
      }
    }

    // Delete all images from Cloudinary
    if (blog.images && blog.images.length > 0) {
      for (const image of blog.images) {
        if (image.publicId) {
          try {
            await deleteFromCloudinary(image.publicId);
          } catch (error) {
            console.error("Error deleting image:", error);
          }
        }
      }
    }

    // Delete the blog document
    await Blog.findByIdAndDelete(id);

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "Failed to delete blog" });
  }
};
