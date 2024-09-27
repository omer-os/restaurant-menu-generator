import { GoogleGenerativeAI } from "@google/generative-ai";
import { SchemaType } from "@google/generative-ai/server";
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
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        restaurant: { type: SchemaType.STRING },
        sections: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              items: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    name: { type: SchemaType.STRING },
                    price: { type: SchemaType.STRING },
                    image: { type: SchemaType.STRING },
                  },
                  required: ["name", "price", "image"],
                },
              },
            },
            required: ["name", "items"],
          },
        },
        contact: {
          type: SchemaType.OBJECT,
          properties: {
            phone: { type: SchemaType.STRING },
            address: { type: SchemaType.STRING },
          },
          required: ["phone", "address"],
        },
      },
      required: ["name", "restaurant", "sections", "contact"],
    },
  },
});

function cleanJsonString(str: string) {
  str = str.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  return str.trim();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("menuImage") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const result = await model.generateContent([
      "Generate a JSON representation of this menu image. Include the restaurant name, menu name, sections with items (name, price, and a placeholder image URL), and contact information (phone and address).",
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

    // Transform the data to ensure it matches the expected structure
    const transformedData = {
      name: menuData.name || "FOOD MENU",
      restaurant: menuData.restaurant || "Restaurant Name",
      sections: menuData.sections.map((section: any) => ({
        name: section.name,
        items: section.items.map((item: any) => ({
          name: item.name,
          price: item.price,
          image: item.image || "/api/placeholder/200/200",
        })),
      })),
      contact: {
        phone: menuData.contact?.phone || "123-456-7890",
        address: menuData.contact?.address || "123 Anywhere St., Any City",
      },
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error processing menu:", error);
    return NextResponse.json(
      { error: "Error processing menu", details: (error as Error).message },
      { status: 500 }
    );
  }
}
