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

// Main navigation links used in both navbar and footer
export const mainNavLinks: NavigationLink[] = [
  { name: "Home", url: "/" },
  { name: "Downloader", url: "/download" },
  { name: "Convert", url: "/convert" },
  { name: "Compress", url: "/compress" },
  { name: "QR Code Generator", url: "/qr" },
  { name: "Color Palette Generator", url: "/colors" },
  { name: "JSON Formatter", url: "/json" },
  { name: "Base64 Encoder/Decoder", url: "/base64" },
  { name: "Markdown Previewer", url: "/markdown" },
  { name: "URL Encoder/Decoder", url: "/url-encode" },
  { name: "Password Generator", url: "/password" },
  { name: "Hash Generator", url: "/hash" },
  { name: "Word Counter", url: "/word-counter" },
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
