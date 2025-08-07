import { NextRequest, NextResponse } from 'next/server';
import { performOCR, validateImageFile } from '@/src/lib/ocr';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const language = formData.get('language') as string || 'eng';

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate the image file
    const validation = validateImageFile(imageFile);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Perform OCR
    const result = await performOCR(imageFile, language);

    if (result.success) {
      return NextResponse.json({
        success: true,
        text: result.text,
        confidence: result.confidence,
        words: result.words,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'OCR processing failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'OCR API endpoint. Use POST with image file.',
    supportedLanguages: ['eng', 'fra', 'deu', 'spa', 'ita', 'por', 'rus', 'jpn', 'kor', 'chi_sim'],
  });
}
