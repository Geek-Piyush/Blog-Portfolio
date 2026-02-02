import { useState, useEffect, useRef } from "react";

const ContextMenu = ({ editor, position, onClose, onImageUpload }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!position) return null;

  const menuItems = [
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
      label: "Paragraph",
      icon: "¶",
      action: () => editor.chain().focus().setParagraph().run(),
      active: editor.isActive("paragraph"),
    },
    {
      label: "Bullet List",
      icon: "•",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "Numbered List",
      icon: "1.",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    { type: "divider" },
    {
      label: "Blockquote",
      icon: '"',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      label: "Code Block",
      icon: "</>",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive("codeBlock"),
    },
    { type: "divider" },
    {
      label: "Upload Image",
      icon: "🖼️",
      action: onImageUpload,
      highlight: true,
    },
    {
      label: "Horizontal Rule",
      icon: "—",
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
  ];

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
      }}
    >
      {menuItems.map((item, index) =>
        item.type === "divider" ? (
          <div key={index} className="context-menu-divider" />
        ) : (
          <button
            key={index}
            className={`context-menu-item ${item.active ? "active" : ""} ${item.highlight ? "highlight" : ""}`}
            onClick={() => {
              item.action();
              onClose();
            }}
          >
            <span className="context-menu-icon">{item.icon}</span>
            <span className="context-menu-label">{item.label}</span>
          </button>
        ),
      )}
    </div>
  );
};

export default ContextMenu;
