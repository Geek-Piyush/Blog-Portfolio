import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  getBlog,
  createBlog,
  updateBlog,
  uploadMultipleImages,
} from "../services/api";
import { useToast } from "../context/ToastContext";
import MenuBar from "../components/MenuBar";
import ContextMenu from "../components/ContextMenu";
import ImageResizer from "../components/ImageResizer";
import ResizableImage from "../extensions/ResizableImage";
import FontFamily from "../extensions/FontFamily";
import FontSize from "../extensions/FontSize";
import {
  compressImage,
  cacheImage,
  getCachedImage,
  clearImageCache,
  getAllCachedImages,
  cacheDraft,
  getCachedDraft,
  clearDraftCache,
} from "../utils/imageCache";
import { loadGoogleFonts } from "../utils/fonts";

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const isEditing = !!id;
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    coverImage: { url: "", publicId: "" },
    images: [],
    tags: [],
    published: false,
  });

  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localImages, setLocalImages] = useState({}); // Map of local image IDs to base64
  const [coverImageLocal, setCoverImageLocal] = useState(null); // Local cover image

  // Load Google Fonts on mount
  useEffect(() => {
    loadGoogleFonts();
  }, []);

  // Tiptap Editor with custom extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
      Placeholder.configure({
        placeholder:
          "Start writing your blog post... (Right-click for formatting options, drag & drop images)",
      }),
      TextStyle,
      FontFamily,
      FontSize,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData((prev) => ({
        ...prev,
        content: html,
      }));
      // Auto-save draft
      saveDraftToCache(html);
    },
    onSelectionUpdate: ({ editor }) => {
      // Check if an image is selected
      const { state } = editor;
      const { selection } = state;
      const node = state.doc.nodeAt(selection.from);

      if (node?.type.name === "resizableImage") {
        const pos = selection.from;
        const domNode = editor.view.nodeDOM(pos);
        if (domNode) {
          const rect = domNode.getBoundingClientRect();
          setSelectedImage({
            node,
            pos,
            rect,
            attrs: node.attrs,
          });
        }
      } else {
        setSelectedImage(null);
      }
    },
  });

  // Load blog data or cached draft
  useEffect(() => {
    const initEditor = async () => {
      if (isEditing) {
        fetchBlog();
      } else {
        // Load cached draft for new posts
        const cachedDraft = await getCachedDraft();
        if (cachedDraft) {
          setFormData((prev) => ({
            ...prev,
            ...cachedDraft,
          }));
          if (cachedDraft.content && editor) {
            editor.commands.setContent(cachedDraft.content);
          }
          toast.info("Restored draft from cache");
        }
      }
    };
    initEditor();
  }, [id, editor]);

  // Update editor content when blog is loaded
  useEffect(() => {
    if (
      editor &&
      formData.content &&
      !editor.getHTML().includes(formData.content.slice(0, 50))
    ) {
      editor.commands.setContent(formData.content);
    }
  }, [editor, formData.content]);

  // Save draft to cache
  const saveDraftToCache = useCallback(
    async (content) => {
      const draftData = {
        ...formData,
        content,
        localImages,
        coverImageLocal,
      };
      await cacheDraft(draftData);
    },
    [formData, localImages, coverImageLocal],
  );

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const response = await getBlog(id);
      setFormData(response.data);
      toast.success("Blog loaded successfully");
    } catch (error) {
      console.error("Failed to fetch blog:", error);
      toast.error("Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Auto-generate slug when title changes
    if (name === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: slug,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Drag and Drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (files.length > 0) {
        await processAndInsertImages(files);
      }
    },
    [editor, localImages],
  );

  // Process images: compress, cache locally, insert as base64
  const processAndInsertImages = async (files) => {
    toast.info(
      `Processing ${files.length} image${files.length > 1 ? "s" : ""}...`,
    );

    for (const file of files) {
      try {
        // Compress the image
        const compressed = await compressImage(file);

        // Generate unique ID
        const imageId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Convert to base64 for display
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(compressed);
        });

        // Cache the image
        await cacheImage(imageId, {
          file: compressed,
          base64,
          originalName: file.name,
          size: compressed.size,
        });

        // Store in local state
        setLocalImages((prev) => ({
          ...prev,
          [imageId]: base64,
        }));

        // Insert into editor with base64 source
        editor
          ?.chain()
          .focus()
          .setResizableImage({
            src: base64,
            dataId: imageId,
          })
          .run();
      } catch (error) {
        console.error("Failed to process image:", error);
        toast.error(`Failed to process ${file.name}`);
      }
    }

    toast.success("Images added to editor (will be uploaded on save)");
  };

  // Cover image - store locally
  const handleCoverImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.info("Processing cover image...");

    try {
      const compressed = await compressImage(file);
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(compressed);
      });

      const imageId = `cover_${Date.now()}`;
      await cacheImage(imageId, {
        file: compressed,
        base64,
        originalName: file.name,
        isCover: true,
      });

      setCoverImageLocal({ id: imageId, base64, file: compressed });
      setFormData((prev) => ({
        ...prev,
        coverImage: { url: base64, publicId: imageId, isLocal: true },
      }));

      toast.success("Cover image ready (will be uploaded on save)");
    } catch (error) {
      console.error("Cover processing failed:", error);
      toast.error("Failed to process cover image");
    } finally {
      setUploading(false);
    }
  };

  const removeCoverImage = () => {
    setCoverImageLocal(null);
    setFormData((prev) => ({
      ...prev,
      coverImage: { url: "", publicId: "" },
    }));
    toast.info("Cover image removed");
  };

  // Content images upload via button
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleContentImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    await processAndInsertImages(files);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Image resizer handlers
  const handleImageResize = (width, height) => {
    if (!selectedImage || !editor) return;

    editor
      .chain()
      .focus()
      .setNodeSelection(selectedImage.pos)
      .updateAttributes("resizableImage", { width, height })
      .run();
  };

  const handleImageAlign = (alignment) => {
    if (!selectedImage || !editor) return;

    editor
      .chain()
      .focus()
      .setNodeSelection(selectedImage.pos)
      .updateAttributes("resizableImage", { alignment })
      .run();
  };

  const handleImageDelete = () => {
    if (!selectedImage || !editor) return;

    editor
      .chain()
      .focus()
      .setNodeSelection(selectedImage.pos)
      .deleteSelection()
      .run();

    setSelectedImage(null);
  };

  // Tags handling
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Extract local images from editor content
  const extractLocalImages = () => {
    const content = editor?.getHTML() || "";
    const regex = /data:image\/[^;]+;base64,[^"]+/g;
    const matches = content.match(regex) || [];
    return matches;
  };

  // Upload all local images to Cloudinary and update content
  const uploadAllImages = async () => {
    const cachedImages = await getAllCachedImages();
    const uploadedImages = [];

    // Upload cover image if local
    if (coverImageLocal?.file) {
      toast.info("Uploading cover image...");
      try {
        const response = await uploadMultipleImages([coverImageLocal.file]);
        if (response.data.images?.[0]) {
          uploadedImages.push({
            local: coverImageLocal.base64,
            remote: response.data.images[0],
          });
          setFormData((prev) => ({
            ...prev,
            coverImage: response.data.images[0],
          }));
        }
      } catch (error) {
        console.error("Cover upload failed:", error);
        throw new Error("Failed to upload cover image");
      }
    }

    // Upload content images
    const contentImages = Object.values(cachedImages).filter(
      (img) => !img.isCover,
    );
    if (contentImages.length > 0) {
      toast.info(`Uploading ${contentImages.length} content images...`);

      const files = contentImages.map((img) => img.file);
      try {
        const response = await uploadMultipleImages(files);
        const cloudinaryImages = response.data.images;

        // Map local base64 to cloudinary URLs
        contentImages.forEach((img, index) => {
          if (cloudinaryImages[index]) {
            uploadedImages.push({
              local: img.base64,
              remote: cloudinaryImages[index],
            });
          }
        });
      } catch (error) {
        console.error("Content images upload failed:", error);
        throw new Error("Failed to upload content images");
      }
    }

    return uploadedImages;
  };

  // Replace local images in content with Cloudinary URLs
  const replaceLocalImagesInContent = (content, imageMap) => {
    let updatedContent = content;

    for (const { local, remote } of imageMap) {
      // Escape special regex characters in base64
      const escapedLocal = local.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      updatedContent = updatedContent.replace(
        new RegExp(escapedLocal, "g"),
        remote.url,
      );
    }

    return updatedContent;
  };

  // Submit - upload all images then save
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload all local images to Cloudinary
      toast.info("Uploading images to cloud...");
      const uploadedImages = await uploadAllImages();

      // Get current content and replace local images
      let content = editor?.getHTML() || formData.content;
      content = replaceLocalImagesInContent(content, uploadedImages);

      // Prepare data
      const dataToSave = {
        ...formData,
        content,
        images: uploadedImages
          .filter((img) => !img.remote?.isCover)
          .map((img) => img.remote),
      };

      // Remove local flag from cover
      if (dataToSave.coverImage?.isLocal) {
        delete dataToSave.coverImage.isLocal;
      }

      toast.info("Saving blog...");

      if (isEditing) {
        await updateBlog(id, dataToSave);
        toast.success("Blog updated successfully!");
      } else {
        await createBlog(dataToSave);
        toast.success("Blog created successfully!");
      }

      // Clear caches after successful save
      await clearImageCache();
      await clearDraftCache();
      setLocalImages({});
      setCoverImageLocal(null);

      setTimeout(() => navigate("/dashboard"), 500);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(error.message || "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading blog...</p>
      </div>
    );
  }

  return (
    <div className="editor-page">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleContentImagesUpload}
        style={{ display: "none" }}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverImageUpload}
        style={{ display: "none" }}
      />

      {/* Header */}
      <header className="editor-top-bar">
        <div className="editor-top-left">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>
          <span className="editor-title-label">
            {isEditing ? "Edit Blog" : "New Blog"}
          </span>
        </div>
        <div className="editor-top-right">
          <div className="publish-toggle-inline">
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
            <span
              className={`publish-label ${formData.published ? "published" : ""}`}
            >
              {formData.published ? "Published" : "Draft"}
            </span>
          </div>
          <button
            type="button"
            className="save-btn"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Uploading & Saving..." : "Save"}
          </button>
        </div>
      </header>

      <div className="editor-main">
        {/* Sidebar */}
        <aside className="editor-sidebar">
          {/* Cover Image */}
          <div className="sidebar-section">
            <h3>Cover Image</h3>
            {formData.coverImage?.url ? (
              <div className="cover-preview">
                <img src={formData.coverImage.url} alt="Cover" />
                {formData.coverImage.isLocal && (
                  <span className="local-badge">Local</span>
                )}
                <button
                  type="button"
                  className="remove-cover-btn"
                  onClick={removeCoverImage}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="upload-cover-btn"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Processing..." : "+ Add Cover Image"}
              </button>
            )}
          </div>

          {/* Tags */}
          <div className="sidebar-section">
            <h3>Tags</h3>
            <div className="tags-container">
              {formData.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder="Add tag..."
              className="tag-input"
            />
          </div>

          {/* Quick Insert */}
          <div className="sidebar-section">
            <h3>Insert</h3>
            <button
              type="button"
              className="insert-btn"
              onClick={triggerImageUpload}
            >
              🖼️ Add Images
            </button>
            <p className="sidebar-hint">
              💡 Tip: Drag & drop images directly into the editor
            </p>
          </div>

          {/* Cache Info */}
          {Object.keys(localImages).length > 0 && (
            <div className="sidebar-section cache-info">
              <h3>📦 Cached Images</h3>
              <p>{Object.keys(localImages).length} image(s) ready to upload</p>
              <p className="sidebar-hint">
                Images will be uploaded when you save
              </p>
            </div>
          )}
        </aside>

        {/* Main Editor Area */}
        <div className="editor-content-area">
          {/* Title Input */}
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Blog Title"
            className="title-input"
            required
          />

          {/* Tiptap Toolbar */}
          <MenuBar
            editor={editor}
            onImageUpload={triggerImageUpload}
            uploadedImages={Object.entries(localImages).map(([id, base64]) => ({
              id,
              base64,
            }))}
            onInsertImage={(base64) => {
              editor?.chain().focus().setResizableImage({ src: base64 }).run();
            }}
          />

          {/* Tiptap Editor with Drag & Drop */}
          <div
            ref={dropZoneRef}
            className={`tiptap-wrapper ${isDragging ? "dragging" : ""}`}
            onContextMenu={handleContextMenu}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="drop-overlay">
                <div className="drop-overlay-content">
                  <span className="drop-icon">📷</span>
                  <p>Drop images here</p>
                </div>
              </div>
            )}
            <EditorContent editor={editor} className="tiptap-editor" />
          </div>

          {/* Context Menu */}
          {contextMenu && (
            <ContextMenu
              editor={editor}
              position={contextMenu}
              onClose={closeContextMenu}
              onImageUpload={triggerImageUpload}
            />
          )}

          {/* Image Resizer */}
          {selectedImage && (
            <ImageResizer
              image={selectedImage}
              onResize={handleImageResize}
              onAlign={handleImageAlign}
              onDelete={handleImageDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
