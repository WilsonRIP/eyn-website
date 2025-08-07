import Tesseract from 'tesseract.js';

export interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  words?: any[];
  error?: string;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'spa', name: 'Spanish' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
  { code: 'rus', name: 'Russian' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'kor', name: 'Korean' },
  { code: 'chi_sim', name: 'Chinese Simplified' },
];

export async function performOCR(
  imageFile: File,
  language: string = 'eng',
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  try {
    // Convert file to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

    // Configure Tesseract.js for Next.js environment
    const worker = await Tesseract.createWorker({
      logger: (m) => {
        if (onProgress) {
          onProgress({
            status: m.status,
            progress: m.progress * 100
          });
        }
      },
    });

    // Load language data
    await worker.loadLanguage(language);
    await worker.initialize(language);

    // Perform OCR
    const result = await worker.recognize(base64Image);

    // Terminate worker to free memory
    await worker.terminate();

    return {
      success: true,
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words,
    };

  } catch (error) {
    console.error('OCR Error:', error);
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file' };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  return { valid: true };
}
