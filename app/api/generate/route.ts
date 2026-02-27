import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const BRAND_PROMPT = `Eres un experto en branding, marketing estratégico y diseño de identidad visual con 20 años de experiencia creando marcas exitosas.

Analiza el brief de marca proporcionado y genera una estrategia completa de branding en formato JSON estructurado.

INSTRUCCIONES:
1. Sé específico y creativo - evita respuestas genéricas
2. Adapta todo al tono, industria y público objetivo
3. Los colores deben tener significado y coherencia con la marca
4. Los buyer personas deben ser realistas y detallados
5. El calendario de contenido debe tener ideas concretas, no genéricas

Responde ÚNICAMENTE con JSON válido (sin markdown, sin explicaciones) con esta estructura exacta:

{
  "posicionamiento": {
    "statement": "Declaración de posicionamiento de marca en una frase poderosa",
    "propuesta_valor": ["Beneficio 1", "Beneficio 2", "Beneficio 3"]
  },
  "voz_de_marca": {
    "tono": "Descripción del tono de comunicación",
    "dos": ["Acción positiva 1", "Acción positiva 2", "Acción positiva 3", "Acción positiva 4"],
    "donts": ["Lo que NO hacer 1", "Lo que NO hacer 2", "Lo que NO hacer 3", "Lo que NO hacer 4"]
  },
  "keywords": ["palabra1", "palabra2", "palabra3", "palabra4", "palabra5", "palabra6"],
  "buyer_personas": [
    {
      "nombre": "Nombre descriptivo del persona",
      "edad": "Rango de edad",
      "ocupacion": "Profesión típica",
      "dolores": ["Dolor 1", "Dolor 2", "Dolor 3"],
      "motivaciones": ["Motivación 1", "Motivación 2", "Motivación 3"]
    },
    {
      "nombre": "Segundo persona",
      "edad": "Rango de edad",
      "ocupacion": "Profesión típica",
      "dolores": ["Dolor 1", "Dolor 2"],
      "motivaciones": ["Motivación 1", "Motivación 2"]
    },
    {
      "nombre": "Tercer persona",
      "edad": "Rango de edad",
      "ocupacion": "Profesión típica",
      "dolores": ["Dolor 1", "Dolor 2"],
      "motivaciones": ["Motivación 1", "Motivación 2"]
    }
  ],
  "identidad_visual": {
    "paleta_colores": {
      "primario": { "hex": "#XXXXXX", "nombre": "Nombre del color", "significado": "Por qué este color" },
      "secundario": { "hex": "#XXXXXX", "nombre": "Nombre del color", "significado": "Por qué este color" },
      "acento": { "hex": "#XXXXXX", "nombre": "Nombre del color", "significado": "Por qué este color" }
    },
    "tipografia": {
      "primaria": { "font": "Nombre de la fuente Google Fonts", "uso": "Para qué se usa" },
      "secundaria": { "font": "Nombre de la fuente Google Fonts", "uso": "Para qué se usa" }
    },
    "estilo_visual": {
      "aesthetic": "Descripción del estilo visual general",
      "elementos_graficos": ["Elemento 1", "Elemento 2", "Elemento 3", "Elemento 4"]
    }
  },
  "estrategia_digital": {
    "plataformas": [
      { "nombre": "Instagram", "frecuencia": "X posts/semana", "enfoque": "Tipo de contenido" },
      { "nombre": "TikTok", "frecuencia": "X videos/semana", "enfoque": "Tipo de contenido" },
      { "nombre": "LinkedIn", "frecuencia": "X posts/semana", "enfoque": "Tipo de contenido" }
    ],
    "pilares_contenido": [
      { "nombre": "Nombre del pilar", "porcentaje": 40, "descripcion": "Qué tipo de contenido" },
      { "nombre": "Nombre del pilar", "porcentaje": 30, "descripcion": "Qué tipo de contenido" },
      { "nombre": "Nombre del pilar", "porcentaje": 30, "descripcion": "Qué tipo de contenido" }
    ],
    "calendario_30_dias": [
      { "dia": 1, "pilar": "Nombre pilar", "formato": "Reel/Carousel/Post", "copy": "Idea específica de contenido" },
      { "dia": 2, "pilar": "Nombre pilar", "formato": "Formato", "copy": "Idea específica" },
      { "dia": 3, "pilar": "Nombre pilar", "formato": "Formato", "copy": "Idea específica" },
      { "dia": 4, "pilar": "Nombre pilar", "formato": "Formato", "copy": "Idea específica" },
      { "dia": 5, "pilar": "Nombre pilar", "formato": "Formato", "copy": "Idea específica" },
      { "dia": 6, "pilar": "Nombre pilar", "formato": "Formato", "copy": "Idea específica" },
      { "dia": 7, "pilar": "Nombre pilar", "formato": "Formato", "copy": "Idea específica" }
    ],
    "hashtags": {
      "branded": ["#HashtagMarca1", "#HashtagMarca2", "#HashtagMarca3"],
      "comunidad": ["#HashtagComunidad1", "#HashtagComunidad2", "#HashtagComunidad3", "#HashtagComunidad4"]
    }
  }
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      brand_name, industry, mission, target_audience, values, tone, differentiators,
      competitors, visual_style, logo_style, color_preference, website_vision
    } = body;

    const userPrompt = `
BRIEF DE MARCA:

INFORMACIÓN BÁSICA:
- Nombre: ${brand_name}
- Industria: ${industry}
- Misión: ${mission}
- Público objetivo: ${target_audience}
- Valores: ${values}
- Tono deseado: ${tone}
- Diferenciadores: ${differentiators}
${competitors ? `- Competencia: ${competitors}` : ''}

PREFERENCIAS VISUALES:
${visual_style ? `- Estilo visual deseado: ${visual_style}` : ''}
${logo_style ? `- Tipo de logo preferido: ${logo_style}` : ''}
${color_preference ? `- Preferencia de colores: ${color_preference}` : ''}
${website_vision ? `- Visión del sitio web: ${website_vision}` : ''}

Genera la estrategia completa de branding para esta marca, teniendo en cuenta todas las preferencias visuales mencionadas.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: BRAND_PROMPT + "\n\n" + userPrompt,
        },
      ],
    });

    // Extract text content
    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON response
    const jsonStr = textContent.text.trim();
    const brandData = JSON.parse(jsonStr);

    return NextResponse.json(brandData);
  } catch (error) {
    console.error("Error generating brand:", error);
    return NextResponse.json(
      { error: "Error generando la marca. Por favor intenta de nuevo." },
      { status: 500 }
    );
  }
}
