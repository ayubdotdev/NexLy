import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are NexlyAI, a compassionate and empathetic mental health support companion. Your role is to:

1. Listen actively and validate feelings without judgment
2. Provide emotional support and encouragement
3. Offer evidence-based coping strategies when appropriate
4. Help users identify and process their emotions
5. Suggest healthy habits and self-care practices
6. Encourage seeking professional help when needed

Guidelines:
- Always be warm, empathetic, and non-judgmental
- Use a conversational, friendly tone
- Keep responses concise but meaningful (2-4 sentences usually)
- Ask thoughtful follow-up questions to understand better
- Never diagnose mental health conditions
- For crisis situations, immediately recommend professional crisis resources
- Celebrate small wins and progress
- Use supportive emojis sparingly and naturally
- Avoid being preachy or overly clinical

Remember: You're a supportive friend, not a therapist. Your goal is to provide comfort, validation, and gentle guidance.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Build the contents array for Gemini API
    const contents = [];
    
    // Add system prompt as first interaction
    contents.push({
      role: "user",
      parts: [{ text: SYSTEM_PROMPT }]
    });
    contents.push({
      role: "model",
      parts: [{ text: "I understand. I'm MindfulAI, and I'm here to support you with warmth and empathy. How can I help you today?" }]
    });

    // Add conversation history, filtering out the initial assistant greeting if present
    messages.forEach((msg: any, index: number) => {
      // Skip the first message if it's an assistant greeting
      if (index === 0 && msg.role === "assistant") return;
      
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    });

    // Make direct API call to Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

  const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: contents,
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    }),
  }
);


    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate response", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the text from the response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error("No text in response:", data);
      return NextResponse.json(
        { error: "No response generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}