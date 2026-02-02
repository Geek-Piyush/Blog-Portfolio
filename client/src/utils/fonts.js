// Font configuration for the blog editor
// Includes Google Fonts that will be loaded dynamically

export const FONTS = [
  // Sans-Serif Fonts
  {
    name: "League Spartan",
    family: "'League Spartan', sans-serif",
    category: "sans-serif",
  },
  { name: "Arial", family: "Arial, sans-serif", category: "sans-serif" },
  { name: "Roboto", family: "'Roboto', sans-serif", category: "sans-serif" },
  {
    name: "Open Sans",
    family: "'Open Sans', sans-serif",
    category: "sans-serif",
  },
  { name: "Lato", family: "'Lato', sans-serif", category: "sans-serif" },
  {
    name: "Montserrat",
    family: "'Montserrat', sans-serif",
    category: "sans-serif",
  },
  { name: "Poppins", family: "'Poppins', sans-serif", category: "sans-serif" },
  { name: "Inter", family: "'Inter', sans-serif", category: "sans-serif" },

  // Serif Fonts
  {
    name: "Times New Roman",
    family: "'Times New Roman', Times, serif",
    category: "serif",
  },
  { name: "Georgia", family: "Georgia, serif", category: "serif" },
  {
    name: "Playfair Display",
    family: "'Playfair Display', serif",
    category: "serif",
  },
  { name: "Merriweather", family: "'Merriweather', serif", category: "serif" },
  { name: "Lora", family: "'Lora', serif", category: "serif" },
  {
    name: "Libre Baskerville",
    family: "'Libre Baskerville', serif",
    category: "serif",
  },

  // Cursive/Script Fonts
  {
    name: "Dancing Script",
    family: "'Dancing Script', cursive",
    category: "cursive",
  },
  { name: "Pacifico", family: "'Pacifico', cursive", category: "cursive" },
  {
    name: "Great Vibes",
    family: "'Great Vibes', cursive",
    category: "cursive",
  },
  { name: "Satisfy", family: "'Satisfy', cursive", category: "cursive" },

  // Monospace Fonts
  {
    name: "JetBrains Mono",
    family: "'JetBrains Mono', monospace",
    category: "monospace",
  },
  {
    name: "Fira Code",
    family: "'Fira Code', monospace",
    category: "monospace",
  },

  // Display Fonts
  {
    name: "Bebas Neue",
    family: "'Bebas Neue', sans-serif",
    category: "display",
  },
  { name: "Oswald", family: "'Oswald', sans-serif", category: "display" },
];

// Google Fonts to load
export const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Montserrat:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@300;400;700&family=Lora:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Dancing+Script:wght@400;500;600;700&family=Pacifico&family=Great+Vibes&family=Satisfy&family=JetBrains+Mono:wght@400;500;700&family=Fira+Code:wght@400;500;700&family=Bebas+Neue&family=Oswald:wght@300;400;500;600;700&display=swap";

// Load Google Fonts
export const loadGoogleFonts = () => {
  if (document.querySelector('link[href*="fonts.googleapis.com"]')) {
    return; // Already loaded
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = GOOGLE_FONTS_URL;
  document.head.appendChild(link);
};

// Get fonts by category
export const getFontsByCategory = (category) => {
  return FONTS.filter((font) => font.category === category);
};

// Get font by name
export const getFontByName = (name) => {
  return FONTS.find((font) => font.name === name);
};

// Font categories for organized dropdowns
export const FONT_CATEGORIES = {
  "Sans-Serif": [
    "Inter",
    "League Spartan",
    "Arial",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
  ],
  Serif: [
    "Times New Roman",
    "Georgia",
    "Playfair Display",
    "Merriweather",
    "Lora",
    "Libre Baskerville",
  ],
  Cursive: ["Dancing Script", "Pacifico", "Great Vibes", "Satisfy"],
  Monospace: ["JetBrains Mono", "Fira Code"],
  Display: ["Bebas Neue", "Oswald"],
};
