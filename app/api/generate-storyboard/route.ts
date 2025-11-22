import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

/**
 * Safely extract JSON from Gemini output.
 * Handles cases where the model wraps JSON in ``` or ```json fences.
 */
function extractJsonString(text: string): string {
  const trimmed = text.trim();

  // If it already looks like plain JSON, return as is
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }

  // Try to find first { and last }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  // Fallback – return original (will likely throw, but we log the text)
  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const { character, premise, sceneCount } = await req.json();

    const count = Math.min(Math.max(Number(sceneCount) || 3, 3), 6);

    const prompt = `
You are a storyboard writer.

Create a short, visually descriptive story broken into exactly ${count} scenes.

You MUST respond ONLY with valid JSON. Do NOT include any backticks, code fences, markdown, or additional text.

JSON shape:
{
  "title": "string",
  "scenes": [
    {
      "id": 1,
      "short_title": "string",
      "narration": "2-4 sentences of story text",
      "visual_prompt": "visual description for image generation"
    }
  ]
}

Main character: ${character}
Premise: ${premise}

Return ONLY pure JSON, nothing else.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    console.log("Gemini raw output:", rawText);

    const jsonString = extractJsonString(rawText);
    const parsed = JSON.parse(jsonString);

    const scenes = (parsed.scenes || []) as any[];

    // No real images yet – but we keep the field for future extension
    const scenesWithImages = scenes.map((scene, index) => ({
      id: scene.id ?? index + 1,
      short_title: scene.short_title,
      narration: scene.narration,
      imageUrl: undefined,
    }));

    return NextResponse.json(
      {
        title: parsed.title || "Storyboard",
        scenes: scenesWithImages,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /api/generate-storyboard:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate storyboard" },
      { status: 500 }
    );
  }
}
