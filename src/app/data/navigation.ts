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
    name: "Media Tools",
    items: [
      { name: "Downloader", url: "/download" },
      { name: "Convert", url: "/convert" },
      { name: "Compress", url: "/compress" },
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
    ]
  },
  {
    name: "Code Tools",
    items: [
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
