// src/app/data/features.ts

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  benefits: string[];
}

export const features: Feature[] = [
  {
    id: "download",
    title: "Media Downloader",
    description: "Download videos, images, and audio from popular websites",
    icon: "Download",
    url: "/download",
    benefits: [
      "Save online videos for offline viewing",
      "Extract high-quality images from websites",
      "Batch download multiple files at once",
    ],
  },
  {
    id: "convert",
    title: "File Converter",
    description: "Convert files between different formats quickly and easily",
    icon: "FileType",
    url: "/convert",
    benefits: [
      "Convert images to different formats",
      "Change video file types for compatibility",
      "Convert audio files between formats",
    ],
  },
  {
    id: "compress",
    title: "File Compressor",
    description: "Reduce file sizes without losing quality",
    icon: "FileDown",
    url: "/compress",
    benefits: [
      "Optimize images for web use",
      "Reduce video file sizes",
      "Compress files for easier sharing",
    ],
  },
  {
    id: "qr",
    title: "QR Code Generator",
    description: "Create custom QR codes for links, text, and more",
    icon: "QrCode",
    url: "/qr",
    benefits: [
      "Generate QR codes for URLs",
      "Create QR codes for contact information",
      "Customize QR code appearance",
    ],
  },
  {
    id: "colors",
    title: "Color Palette Generator",
    description: "Generate beautiful color palettes for your projects",
    icon: "Palette",
    url: "/colors",
    benefits: [
      "Create harmonious color combinations",
      "Extract palettes from images",
      "Find accessible color contrasts",
    ],
  },
  {
    id: "json",
    title: "JSON Formatter & Validator",
    description: "Format and validate JSON data with ease",
    icon: "Code",
    url: "/json",
    benefits: [
      "Beautify messy JSON code",
      "Validate JSON syntax",
      "Minify JSON for production",
    ],
  },
  {
    id: "base64",
    title: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings and files",
    icon: "Code",
    url: "/base64",
    benefits: [
      "Encode text to Base64",
      "Decode Base64 to text",
      "Handle file encoding/decoding",
    ],
  },
  {
    id: "markdown",
    title: "Markdown Previewer",
    description: "Real-time Markdown editor with live preview",
    icon: "FileText",
    url: "/markdown",
    benefits: [
      "Live Markdown preview",
      "Multiple view modes",
      "Export to HTML",
    ],
  },
  {
    id: "url-encode",
    title: "URL Encoder/Decoder",
    description: "Encode and decode URLs with different methods",
    icon: "Link",
    url: "/url-encode",
    benefits: [
      "Full URL encoding/decoding",
      "Component encoding/decoding",
      "Path encoding/decoding",
    ],
  },
  {
    id: "password",
    title: "Password Generator",
    description: "Generate secure, cryptographically random passwords",
    icon: "Key",
    url: "/password",
    benefits: [
      "Cryptographically secure generation",
      "Customizable character sets",
      "Passphrase generation",
    ],
  },
  {
    id: "hash",
    title: "Hash Generator",
    description: "Generate file and text hashes for verification",
    icon: "Hash",
    url: "/hash",
    benefits: [
      "Multiple hash algorithms (MD5, SHA-1, SHA-256, SHA-512)",
      "File hash generation",
      "Text hash generation",
    ],
  },
  {
    id: "word-counter",
    title: "Word & Character Counter",
    description: "Analyze text with detailed statistics and readability scores",
    icon: "Calculator",
    url: "/word-counter",
    benefits: [
      "Word, character, and sentence counts",
      "Reading time estimation",
      "Flesch Reading Ease score",
    ],
  },
  {
    id: "text-case",
    title: "Text Case Converter",
    description: "Convert text between different cases and formats",
    icon: "FileText",
    url: "/text-case",
    benefits: [
      "UPPERCASE, lowercase, Title Case",
      "camelCase, snake_case, kebab-case",
      "Remove extra spaces and format",
    ],
  },
  {
    id: "lorem-ipsum",
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder text for design and development",
    icon: "FileText",
    url: "/lorem-ipsum",
    benefits: [
      "Generate paragraphs, words, or characters",
      "Start with 'Lorem ipsum dolor sit amet'",
      "Customize output length and format",
    ],
  },
  {
    id: "color-contrast",
    title: "Color Contrast Checker",
    description: "Check color contrast ratios for accessibility",
    icon: "Palette",
    url: "/color-contrast",
    benefits: [
      "WCAG 2.1 compliance checking",
      "Real-time contrast ratio calculation",
      "Suggest accessible color alternatives",
    ],
  },
  {
    id: "css-formatter",
    title: "CSS Formatter & Minifier",
    description: "Beautify or minify CSS code for better readability or performance",
    icon: "FileCode",
    url: "/css-formatter",
    benefits: [
      "Beautify messy CSS code",
      "Minify CSS for production",
      "Customizable indentation",
    ],
  },
  {
    id: "jwt-decoder",
    title: "JWT Decoder",
    description: "Decode and validate JSON Web Tokens to inspect their contents",
    icon: "Shield",
    url: "/jwt-decoder",
    benefits: [
      "Decode JWT header and payload",
      "Validate token expiration",
      "Inspect token claims",
    ],
  },
  {
    id: "csv-to-json",
    title: "CSV to JSON Converter",
    description: "Convert CSV data to JSON format and vice versa with customizable options",
    icon: "FileSpreadsheet",
    url: "/csv-to-json",
    benefits: [
      "Convert CSV to JSON arrays or objects",
      "Handle quoted fields and special characters",
      "Bidirectional conversion",
    ],
  },
  {
    id: "yaml-converter",
    title: "YAML ↔ JSON Converter",
    description: "Convert between YAML and JSON formats with customizable indentation",
    icon: "FileText",
    url: "/yaml-converter",
    benefits: [
      "Bidirectional YAML/JSON conversion",
      "Customizable indentation",
      "Support for comments and complex structures",
    ],
  },
  {
    id: "uuid-generator",
    title: "UUID Generator",
    description: "Generate UUIDs (Universally Unique Identifiers) in different versions for your projects",
    icon: "Key",
    url: "/uuid-generator",
    benefits: [
      "Generate UUID v1, v4, and v5",
      "Bulk UUID generation",
      "Copy to clipboard functionality",
    ],
  },
  {
    id: "regex-tester",
    title: "Regex Tester",
    description: "Test and debug regular expressions with live matching",
    icon: "Code",
    url: "/regex-tester",
    benefits: [
      "Real-time regex testing",
      "Multiple test strings support",
      "Regex explanation and debugging",
    ],
  },
  {
    id: "diff-checker",
    title: "Diff Checker",
    description: "Compare text files and find differences",
    icon: "FileText",
    url: "/diff-checker",
    benefits: [
      "Side-by-side text comparison",
      "Highlight differences clearly",
      "Support for various diff formats",
    ],
  },
];

export const benefits = [
  {
    title: "All-in-One Solution",
    description:
      "Access multiple tools in a single platform without switching between services",
    icon: "LayoutGrid",
  },
  {
    title: "Free to Use",
    description:
      "All tools are completely free with no hidden charges or premium features",
    icon: "BadgeDollarSign",
  },
  {
    title: "Privacy Focused",
    description:
      "Your files are processed locally when possible, respecting your privacy",
    icon: "Shield",
  },
  {
    title: "No Sign-up Required",
    description: "Start using tools immediately without creating an account",
    icon: "UserCheck",
  },
];

export const howItWorks = [
  {
    step: 1,
    title: "Choose a Tool",
    description: "Select from our range of useful tools for your specific need",
    icon: "MousePointerClick",
  },
  {
    step: 2,
    title: "Upload or Input",
    description: "Provide the necessary file, URL, or data for processing",
    icon: "Upload",
  },
  {
    step: 3,
    title: "Process",
    description: "Let our system work its magic on your content",
    icon: "Cpu",
  },
  {
    step: 4,
    title: "Download Results",
    description: "Get your processed files instantly",
    icon: "Download",
  },
];
