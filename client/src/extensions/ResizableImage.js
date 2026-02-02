import { Node, mergeAttributes } from "@tiptap/core";

export const ResizableImage = Node.create({
  name: "resizableImage",

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: "100%",
      },
      height: {
        default: "auto",
      },
      dataId: {
        default: null,
      },
      alignment: {
        default: "center",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { alignment, ...attrs } = HTMLAttributes;

    const wrapperStyle =
      {
        left: "text-align: left;",
        center: "text-align: center;",
        right: "text-align: right;",
      }[alignment] || "text-align: center;";

    return [
      "div",
      { class: "image-wrapper", style: wrapperStyle },
      [
        "img",
        mergeAttributes(this.options.HTMLAttributes, attrs, {
          class: "resizable-image",
          draggable: "true",
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setResizableImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      updateImageSize:
        (attrs) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const node = state.doc.nodeAt(selection.from);

          if (node && node.type.name === this.name) {
            if (dispatch) {
              tr.setNodeMarkup(selection.from, undefined, {
                ...node.attrs,
                ...attrs,
              });
              dispatch(tr);
            }
            return true;
          }
          return false;
        },
    };
  },
});

export default ResizableImage;
