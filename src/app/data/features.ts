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
