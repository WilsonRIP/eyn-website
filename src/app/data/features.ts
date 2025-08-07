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
    id: "ocr",
    title: "Image-to-Text OCR",
    description: "Extract plain-text from uploaded images using optical character recognition",
    icon: "FileText",
    url: "/ocr",
    benefits: [
      "Extract text from images and screenshots",
      "Support for multiple image formats",
      "High accuracy OCR processing",
    ],
  },
  {
    id: "chatgpt",
    title: "ChatGPT Playground",
    description: "Play with a lightweight LLM for quick prompts and responses",
    icon: "MessageSquare",
    url: "/chatgpt",
    benefits: [
      "Quick AI-powered text generation",
      "Multiple conversation modes",
      "Export chat history",
    ],
  },
  {
    id: "summarize",
    title: "Text Summarizer",
    description: "Generate concise summaries of long articles and documents",
    icon: "FileText",
    url: "/summarize",
    benefits: [
      "AI-powered text summarization",
      "Customizable summary length",
      "Maintains key information",
    ],
  },
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
    id: "metadata-editor",
    title: "Metadata Editor",
    description: "View and edit metadata for images and audio files with professional tools",
    icon: "FileText",
    url: "/metadata-editor",
    benefits: [
      "Edit EXIF data for images",
      "Modify ID3 tags for audio files",
      "Professional metadata templates",
    ],
  },
  {
    id: "svg-optimizer",
    title: "SVG Optimizer",
    description: "Minify and clean SVG markup for better performance",
    icon: "FileCode",
    url: "/svg-optimizer",
    benefits: [
      "Remove unnecessary attributes",
      "Optimize path data",
      "Reduce file size significantly",
    ],
  },
  {
    id: "pomodoro",
    title: "Pomodoro Timer",
    description: "Simple timer to boost focus with work/break cycles",
    icon: "Timer",
    url: "/pomodoro",
    benefits: [
      "25/5 minute work/break cycles",
      "Customizable timer settings",
      "Session tracking and statistics",
    ],
  },
  {
    id: "habit-tracker",
    title: "Habit Tracker",
    description: "Log daily habits and view streaks to build better routines",
    icon: "Calendar",
    url: "/habit-tracker",
    benefits: [
      "Track multiple habits simultaneously",
      "Visual streak indicators",
      "Progress analytics and insights",
    ],
  },
  {
    id: "md-table",
    title: "Markdown Table Generator",
    description: "Build markdown tables from CSV/JSON data with ease",
    icon: "Table",
    url: "/md-table",
    benefits: [
      "Convert CSV/JSON to markdown tables",
      "Customizable table formatting",
      "Copy to clipboard functionality",
    ],
  },
  {
    id: "currency",
    title: "Currency Converter",
    description: "Convert between fiat and crypto currencies with real-time rates",
    icon: "DollarSign",
    url: "/currency",
    benefits: [
      "Real-time exchange rates",
      "Support for 150+ currencies",
      "Crypto currency conversion",
    ],
  },
  {
    id: "tax-calculator",
    title: "Tax Calculator",
    description: "Estimate tax liability for different regions and income types",
    icon: "Calculator",
    url: "/tax-calculator",
    benefits: [
      "Multiple tax bracket calculations",
      "Deduction and credit support",
      "Regional tax rate updates",
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
    id: "color-converter",
    title: "Color Converter",
    description: "Convert colors between different formats and color spaces",
    icon: "Palette",
    url: "/color-converter",
    benefits: [
      "Convert between HEX, RGB, HSL, CMYK",
      "Color space transformations",
      "Batch color conversion",
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
  {
    id: "sentiment-analyzer",
    title: "Sentiment Analyzer",
    description: "Analyze the emotional tone and sentiment of text content",
    icon: "MessageSquare",
    url: "/sentiment-analyzer",
    benefits: [
      "Detect positive, negative, or neutral sentiment",
      "Analyze social media content",
      "Get detailed sentiment scores",
    ],
  },
  {
    id: "slug-generator",
    title: "Slug Generator",
    description: "Generate URL-friendly slugs from text content",
    icon: "Link",
    url: "/slug-generator",
    benefits: [
      "Convert titles to URL-friendly slugs",
      "Remove special characters and spaces",
      "SEO-optimized slug generation",
    ],
  },
  {
    id: "keyword-extractor",
    title: "Keyword Extractor",
    description: "Extract key terms and phrases from text content",
    icon: "FileText",
    url: "/keyword-extractor",
    benefits: [
      "Identify important keywords",
      "Extract key phrases and terms",
      "SEO and content analysis",
    ],
  },
  {
    id: "http-request",
    title: "HTTP Request Builder",
    description: "Craft and test GET/POST requests with custom headers and parameters",
    icon: "Globe",
    url: "/http-request",
    benefits: [
      "Multiple HTTP methods support",
      "Custom headers and parameters",
      "Response inspection and testing",
    ],
  },
  {
    id: "webhook-tester",
    title: "Webhook Tester",
    description: "Receive and inspect webhook payloads for API development",
    icon: "Webhook",
    url: "/webhook-tester",
    benefits: [
      "Generate unique webhook URLs",
      "Real-time payload inspection",
      "Request history and logging",
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
    id: "password-strength",
    title: "Password Strength Meter",
    description: "Visual feedback on password entropy and security",
    icon: "Shield",
    url: "/password-strength",
    benefits: [
      "Real-time strength analysis",
      "Password entropy calculation",
      "Security recommendations",
    ],
  },
  {
    id: "vulnerability-scanner",
    title: "XSS/SQLi Scanner",
    description: "Quick check for common injection vectors in web applications",
    icon: "Bug",
    url: "/vulnerability-scanner",
    benefits: [
      "XSS vulnerability detection",
      "SQL injection testing",
      "Security best practices guidance",
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
