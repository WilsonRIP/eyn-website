import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { code, explanationType, language } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Build prompt based on explanation type
    let prompt = `Please explain the following code`;
    
    if (language && language !== 'auto') {
      prompt += ` written in ${language}`;
    }
    
    if (explanationType === 'simple') {
      prompt += ` in simple terms that a beginner can understand`;
    } else if (explanationType === 'line-by-line') {
      prompt += ` line by line, explaining what each line does`;
    } else if (explanationType === 'algorithm') {
      prompt += ` focusing on the algorithm and logic flow`;
    } else {
      prompt += ` in detail, covering the purpose, logic, and how it works`;
    }
    
    prompt += `.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;

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
        { error: 'Failed to explain code' },
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

    const explanation = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ explanation });

  } catch (error) {
    console.error('Code explainer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
