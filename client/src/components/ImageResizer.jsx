import { useState, useRef } from "react";

const ImageResizer = ({ image, onResize, onAlign, onDelete }) => {
  const [width, setWidth] = useState(100);
  const containerRef = useRef(null);

  const sizes = [
    { label: "S", value: 25 },
    { label: "M", value: 50 },
    { label: "L", value: 75 },
    { label: "Full", value: 100 },
  ];

  const alignments = [
    { label: "◀", value: "left", title: "Align Left" },
    { label: "◆", value: "center", title: "Center" },
    { label: "▶", value: "right", title: "Align Right" },
  ];

  // Calculate position based on image location
  const getPosition = () => {
    if (!image?.rect) return { top: 100, left: 100 };

    const { rect } = image;
    return {
      top: rect.bottom + 10,
      left: Math.max(10, rect.left),
    };
  };

  const handleSizeChange = (value) => {
    setWidth(value);
    onResize(`${value}%`, "auto");
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setWidth(value);
    onResize(`${value}%`, "auto");
  };

  const position = getPosition();

  return (
    <div
      ref={containerRef}
      className="image-resizer"
      style={{ top: position.top, left: position.left }}
    >
      <div className="resizer-header">
        <h4>Image Options</h4>
      </div>

      {/* Size presets */}
      <div className="resizer-section">
        <label>Size</label>
        <div className="size-presets">
          {sizes.map((size) => (
            <button
              key={size.value}
              type="button"
              className={`size-preset ${width === size.value ? "active" : ""}`}
              onClick={() => handleSizeChange(size.value)}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slider */}
      <div className="resizer-section">
        <label>Custom Size</label>
        <div className="size-slider">
          <input
            type="range"
            min="10"
            max="100"
            value={width}
            onChange={handleSliderChange}
          />
          <span className="size-value">{width}%</span>
        </div>
      </div>

      {/* Alignment */}
      <div className="resizer-section">
        <label>Alignment</label>
        <div className="alignment-buttons">
          {alignments.map((align) => (
            <button
              key={align.value}
              type="button"
              className={`align-btn ${image?.attrs?.alignment === align.value ? "active" : ""}`}
              onClick={() => onAlign(align.value)}
              title={align.title}
            >
              {align.label}
            </button>
          ))}
        </div>
      </div>

      {/* Delete */}
      <div className="resizer-section">
        <button type="button" className="delete-btn" onClick={onDelete}>
          🗑️ Delete Image
        </button>
      </div>
    </div>
  );
};

export default ImageResizer;
