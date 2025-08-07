import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { text, analysisType } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Build prompt based on analysis type
    let prompt = `Please analyze the following text`;
    
    if (analysisType === 'sentiment') {
      prompt += ` and provide a detailed sentiment analysis. Include the overall sentiment (positive, negative, neutral), emotional tone, and specific examples from the text that support your analysis.`;
    } else if (analysisType === 'readability') {
      prompt += ` for readability. Evaluate the complexity, sentence structure, vocabulary level, and provide suggestions for improvement if needed.`;
    } else if (analysisType === 'tone') {
      prompt += ` and analyze the tone. Identify the writing style, formality level, and emotional undertones present in the text.`;
    } else if (analysisType === 'key-themes') {
      prompt += ` and extract the key themes and topics. Identify the main ideas, recurring concepts, and central messages.`;
    } else if (analysisType === 'writing-style') {
      prompt += ` and analyze the writing style. Examine the structure, language patterns, rhetorical devices, and overall writing approach.`;
    } else {
      prompt += ` comprehensively. Include sentiment analysis, readability assessment, tone analysis, key themes, and writing style evaluation.`;
    }
    
    prompt += `\n\nText to analyze:\n"${text}"\n\nPlease provide a structured and detailed analysis.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to analyze text' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return NextResponse.json(
        { error: 'Invalid response from Gemini API' },
        { status: 500 }
      );
    }

    const analysis = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Text analyzer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
