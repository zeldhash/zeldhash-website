import { NextRequest, NextResponse } from "next/server";
import { FAQ_CONTEXT } from "@/lib/faq-context";

// Simple in-memory cache for common questions
const cache = new Map<string, { answer: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function getCachedAnswer(question: string): string | null {
  const normalized = question.toLowerCase().trim();
  const cached = cache.get(normalized);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.answer;
  }
  return null;
}

function setCachedAnswer(question: string, answer: string) {
  const normalized = question.toLowerCase().trim();
  cache.set(normalized, { answer, timestamp: Date.now() });

  // Limit cache size to prevent memory issues
  if (cache.size > 1000) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    // Validation
    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: "Question is too long (max 500 characters)" },
        { status: 400 }
      );
    }

    // Check cache first
    const cachedAnswer = getCachedAnswer(question);
    if (cachedAnswer) {
      return NextResponse.json({ answer: cachedAnswer, cached: true });
    }

    // Check for API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not configured");
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }

    // Call Groq API
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: FAQ_CONTEXT },
            { role: "user", content: question },
          ],
          temperature: 0.3, // More factual, less creative
          max_tokens: 800,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error: ${response.status}`, errorText);

      if (response.status === 429) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "An error occurred. Please try again." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const answer =
      data.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    // Cache the answer
    setCachedAnswer(question, answer);

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AMA Error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

