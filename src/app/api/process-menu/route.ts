import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  },
});

function cleanJsonString(str: string) {
  str = str.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  return str.trim();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("menuImage");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // @ts-ignore
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const result = await model.generateContent([
      "Generate a JSON representation of this menu image.",
      {
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      },
    ]);

    const response = await result.response;
    const cleanedJsonString = cleanJsonString(response.text());
    const menuData = JSON.parse(cleanedJsonString);

    return NextResponse.json(menuData);
  } catch (error) {
    console.error("Error processing menu:", error);
    return NextResponse.json(
      { error: "Error processing menu", details: error?.message as string },
      { status: 500 }
    );
  }
}
