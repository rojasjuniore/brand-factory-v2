import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand_name, industry, tone, visual_style, colors, logo_style } = body;

    const prompt = `Create a professional logo design for a brand called "${brand_name}" in the ${industry} industry.

Style requirements:
- Tone: ${tone}
- Visual style: ${visual_style || "modern and minimalist"}
- Logo style: ${logo_style || "wordmark with icon"}
- Color preference: ${colors || "based on industry standards"}

The logo should be:
- Clean and professional
- Suitable for both digital and print
- Memorable and distinctive
- On a clean white or transparent background
- Vector-style, flat design aesthetic

Generate a single, high-quality logo concept.`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: prompt,
      config: {
        responseModalities: ["image", "text"],
      },
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts || [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagePart = parts.find((p: any) => p.inlineData?.data);

    if (imagePart?.inlineData) {
      const imageData = imagePart.inlineData.data as string;
      const mimeType = (imagePart.inlineData.mimeType as string) || "image/png";
      
      return NextResponse.json({
        success: true,
        image: `data:${mimeType};base64,${imageData}`,
      });
    }

    return NextResponse.json({
      success: false,
      error: "No image generated",
    });
  } catch (error) {
    console.error("Error generating logo:", error);
    return NextResponse.json(
      { success: false, error: "Error generating logo" },
      { status: 500 }
    );
  }
}
