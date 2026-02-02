import { useState, useRef, useEffect } from "react";
import { FONTS, FONT_CATEGORIES } from "../utils/fonts";

const MenuBar = ({
  editor,
  onImageUpload,
  uploadedImages = [],
  onInsertImage,
}) => {
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [draggedImage, setDraggedImage] = useState(null);
  const fontDropdownRef = useRef(null);
  const fontSizeDropdownRef = useRef(null);
  const imageGalleryRef = useRef(null);

  const fontSizes = [
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "24px",
    "28px",
    "32px",
    "36px",
    "48px",
    "64px",
    "72px",
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        fontDropdownRef.current &&
        !fontDropdownRef.current.contains(event.target)
      ) {
        setShowFontDropdown(false);
      }
      if (
        fontSizeDropdownRef.current &&
        !fontSizeDropdownRef.current.contains(event.target)
      ) {
        setShowFontSizeDropdown(false);
      }
      if (
        imageGalleryRef.current &&
        !imageGalleryRef.current.contains(event.target)
      ) {
        setShowImageGallery(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editor) return null;

  const getCurrentFont = () => {
    const attrs = editor.getAttributes("textStyle");
    return attrs.fontFamily || "Inter";
  };

  const getCurrentFontSize = () => {
    const attrs = editor.getAttributes("textStyle");
    return attrs.fontSize || "16px";
  };

  const setFontFamily = (fontFamily) => {
    editor.chain().focus().setFontFamily(fontFamily).run();
    setShowFontDropdown(false);
  };

  const setFontSize = (size) => {
    editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
    setShowFontSizeDropdown(false);
  };

  const buttons = [
    {
      label: "Bold",
      icon: "B",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      disabled: !editor.can().chain().focus().toggleBold().run(),
      style: { fontWeight: "bold" },
    },
    {
      label: "Italic",
      icon: "I",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      disabled: !editor.can().chain().focus().toggleItalic().run(),
      style: { fontStyle: "italic" },
    },
    {
      label: "Underline",
      icon: "U",
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
      style: { textDecoration: "underline" },
    },
    {
      label: "Strike",
      icon: "S",
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
      style: { textDecoration: "line-through" },
    },
    { type: "divider" },
    {
      label: "Heading 1",
      icon: "H1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
    },
    {
      label: "Heading 2",
      icon: "H2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "Heading 3",
      icon: "H3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    { type: "divider" },
    {
      label: "Bullet List",
      icon: "•≡",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "Ordered List",
      icon: "1.",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    { type: "divider" },
    {
      label: "Blockquote",
      icon: "❝",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      label: "Code Block",
      icon: "</>",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive("codeBlock"),
    },
    {
      label: "Horizontal Rule",
      icon: "—",
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    { type: "divider" },
    {
      label: "Undo",
      icon: "↩",
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().chain().focus().undo().run(),
    },
    {
      label: "Redo",
      icon: "↪",
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().chain().focus().redo().run(),
    },
  ];

  return (
    <div className="menu-bar">
      {/* Font Family Dropdown */}
      <div className="font-dropdown-container" ref={fontDropdownRef}>
        <button
          type="button"
          className="font-dropdown-trigger"
          onClick={() => setShowFontDropdown(!showFontDropdown)}
          title="Font Family"
        >
          <span style={{ fontFamily: getCurrentFont() }}>
            {getCurrentFont()}
          </span>
          <span className="dropdown-arrow">▼</span>
        </button>
        {showFontDropdown && (
          <div className="font-dropdown">
            {Object.entries(FONT_CATEGORIES).map(([category, fonts]) => (
              <div key={category} className="font-category">
                <div className="font-category-label">{category}</div>
                {fonts.map((fontName) => {
                  const font = FONTS.find((f) => f.name === fontName);
                  return (
                    <button
                      key={fontName}
                      type="button"
                      className={`font-option ${getCurrentFont() === fontName ? "active" : ""}`}
                      onClick={() => setFontFamily(fontName)}
                      style={{ fontFamily: fontName }}
                    >
                      {fontName}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Font Size Dropdown */}
      <div className="font-dropdown-container" ref={fontSizeDropdownRef}>
        <button
          type="button"
          className="font-size-trigger"
          onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
          title="Font Size"
        >
          <span>{getCurrentFontSize()}</span>
          <span className="dropdown-arrow">▼</span>
        </button>
        {showFontSizeDropdown && (
          <div className="font-dropdown font-size-dropdown">
            {fontSizes.map((size) => (
              <button
                key={size}
                type="button"
                className={`font-option ${getCurrentFontSize() === size ? "active" : ""}`}
                onClick={() => setFontSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="menu-divider" />

      {buttons.map((btn, index) =>
        btn.type === "divider" ? (
          <div key={index} className="menu-divider" />
        ) : (
          <button
            key={index}
            type="button"
            onClick={btn.action}
            disabled={btn.disabled}
            className={`menu-button ${btn.active ? "is-active" : ""}`}
            title={btn.label}
            style={btn.style}
          >
            {btn.icon}
          </button>
        ),
      )}

      <div className="menu-divider" />

      {/* Image Gallery Button */}
      <div className="image-gallery-container" ref={imageGalleryRef}>
        <button
          type="button"
          className={`menu-button image-gallery-btn ${showImageGallery ? "is-active" : ""}`}
          onClick={() => setShowImageGallery(!showImageGallery)}
          title="Images"
        >
          🖼️
        </button>

        {showImageGallery && (
          <div className="image-gallery-dropdown">
            <div className="gallery-header">
              <h4>Images</h4>
              <button
                type="button"
                className="gallery-upload-btn"
                onClick={() => {
                  onImageUpload?.();
                  setShowImageGallery(false);
                }}
              >
                + Upload
              </button>
            </div>

            {uploadedImages.length === 0 ? (
              <div className="gallery-empty">
                <div className="gallery-empty-icon">📷</div>
                <p>No images uploaded yet</p>
                <button
                  type="button"
                  className="gallery-add-btn"
                  onClick={() => {
                    onImageUpload?.();
                    setShowImageGallery(false);
                  }}
                >
                  Add Images
                </button>
              </div>
            ) : (
              <div className="gallery-grid">
                {uploadedImages.map((img) => (
                  <div
                    key={img.id}
                    className="gallery-item"
                    draggable
                    onDragStart={(e) => {
                      setDraggedImage(img);
                      e.dataTransfer.setData("text/plain", img.base64);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onDragEnd={() => setDraggedImage(null)}
                    onClick={() => {
                      onInsertImage?.(img.base64);
                      setShowImageGallery(false);
                    }}
                    title="Click to insert or drag to editor"
                  >
                    <img src={img.base64} alt="Uploaded" />
                    <div className="gallery-item-overlay">
                      <span>Click or Drag</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="gallery-hint">
              💡 Drag images to the editor or click to insert
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuBar;
