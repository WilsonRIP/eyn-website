// src/data/navigation.ts

export interface NavigationLink {
  name: string;
  url: string;
  isExternal?: boolean;
}

export interface NavigationGroup {
  title: string;
  links: NavigationLink[];
}

export interface NavigationCategory {
  name: string;
  items: NavigationLink[];
}

// Organized navigation categories for dropdown menus
export const navigationCategories: NavigationCategory[] = [
  {
    name: "AI Tools",
    items: [
      { name: "Image-to-Text OCR", url: "/ocr" },
      { name: "ChatGPT Playground", url: "/chatgpt" },
      { name: "Text Summarizer", url: "/summarize" },
    ]
  },
  {
    name: "Media Tools",
    items: [
      { name: "Downloader", url: "/download" },
      { name: "Converter (Video, Audio, Image)", url: "/convert" },
      { name: "Compress", url: "/compress" },
      { name: "SVG Optimizer", url: "/svg-optimizer" },
      { name: "Metadata Editor", url: "/metadata-editor" },
    ]
  },
  {
    name: "Productivity",
    items: [
      { name: "Pomodoro Timer", url: "/pomodoro" },
      { name: "Habit Tracker", url: "/habit-tracker" },
      { name: "Markdown Table Generator", url: "/md-table" },
    ]
  },
  {
    name: "Finance",
    items: [
      { name: "Currency Converter", url: "/currency" },
      { name: "Tax Calculator", url: "/tax-calculator" },
    ]
  },
  {
    name: "Generators",
    items: [
      { name: "QR Code Generator", url: "/qr" },
      { name: "Password Generator", url: "/password" },
      { name: "UUID Generator", url: "/uuid-generator" },
      { name: "Lorem Ipsum Generator", url: "/lorem-ipsum" },
    ]
  },
  {
    name: "Color Tools",
    items: [
      { name: "Color Palette Generator", url: "/colors" },
      { name: "Color Contrast Checker", url: "/color-contrast" },
      { name: "Color Converter", url: "/color-converter" },
    ]
  },
  {
    name: "Text Tools",
    items: [
      { name: "JSON Formatter", url: "/json" },
      { name: "Base64 Encoder/Decoder", url: "/base64" },
      { name: "Markdown Previewer", url: "/markdown" },
      { name: "URL Encoder/Decoder", url: "/url-encode" },
      { name: "Text Case Converter", url: "/text-case" },
      { name: "Word Counter", url: "/word-counter" },
      { name: "Regex Tester", url: "/regex-tester" },
      { name: "Diff Checker", url: "/diff-checker" },
      { name: "Sentiment Analyzer", url: "/sentiment-analyzer" },
      { name: "Slug Generator", url: "/slug-generator" },
      { name: "Keyword Extractor", url: "/keyword-extractor" },
    ]
  },
  {
    name: "Developer Utilities",
    items: [
      { name: "HTTP Request Builder", url: "/http-request" },
      { name: "Webhook Tester", url: "/webhook-tester" },
      { name: "CSS Formatter & Minifier", url: "/css-formatter" },
      { name: "YAML ↔ JSON Converter", url: "/yaml-converter" },
      { name: "CSV to JSON Converter", url: "/csv-to-json" },
    ]
  },
  {
    name: "Security",
    items: [
      { name: "Hash Generator", url: "/hash" },
      { name: "JWT Decoder", url: "/jwt-decoder" },
      { name: "Password Strength Meter", url: "/password-strength" },
      { name: "XSS/SQLi Scanner", url: "/vulnerability-scanner" },
    ]
  }
];

// Flattened list for mobile menu and other uses
export const mainNavLinks: NavigationLink[] = [
  { name: "Home", url: "/" },
  ...navigationCategories.flatMap(category => category.items)
];

// Additional links for footer only
export const resourceLinks: NavigationLink[] = [
  { name: "Blog", url: "/blog" },
  { name: "Portfolio", url: "/projects" },
  { name: "Resume", url: "/resume", isExternal: true },
];

// Organized footer link groups
export const footerLinkGroups: NavigationGroup[] = [
  {
    title: "Navigation",
    links: mainNavLinks,
  },
  {
    title: "Resources",
    links: resourceLinks,
  },
];
