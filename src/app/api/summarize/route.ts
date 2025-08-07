import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const { text, length, style } = await request.json();

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

    // Create prompt based on style and length preferences
    let prompt;
    
    if (style === 'bullet') {
      prompt = `Please summarize the following text using bullet points. Each key point should start with a bullet (•). Keep the summary to approximately ${length}% of the original length. Format your response as:

• First key point
• Second key point  
• Third key point
(and so on...)

Here's the text to summarize:

${text}`;
    } else {
      prompt = `Please summarize the following text`;
      
      if (style === 'concise') {
        prompt += ` in a concise manner`;
      } else if (style === 'detailed') {
        prompt += ` in a detailed manner`;
      }
      
      prompt += `, keeping it to approximately ${length}% of the original length. Here's the text to summarize:\n\n${text}`;
    }

    const response = await fetch(GEMINI_API_URL, {
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
        { error: 'Failed to generate summary' },
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

    const summary = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
