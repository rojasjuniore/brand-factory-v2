import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand_name, industry, tone, visual_style, colors, logo_style } = body;

    const prompt = `Create a professional, minimalist logo design for "${brand_name}", a ${industry} brand.

Style: ${visual_style || "modern and clean"}
Logo type: ${logo_style || "wordmark with simple icon"}
Tone: ${tone}
Colors: ${colors || "professional colors suitable for the industry"}

Requirements:
- Simple, memorable design
- Clean white background
- Vector-style flat design
- Professional and suitable for business use
- No text except the brand name
- Single logo concept`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API error:", data.error);
      return NextResponse.json({ success: false, error: data.error.message }, { status: 500 });
    }

    // Find image in response
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData);

    if (imagePart?.inlineData) {
      const { mimeType, data: imageData } = imagePart.inlineData;
      return NextResponse.json({
        success: true,
        image: `data:${mimeType};base64,${imageData}`,
      });
    }

    // If no image, return error with details
    const textPart = parts.find((p: { text?: string }) => p.text);
    return NextResponse.json({
      success: false,
      error: "No se pudo generar imagen",
      details: textPart?.text || "Modelo no soporta generación de imágenes",
    });
  } catch (error) {
    console.error("Logo generation error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
