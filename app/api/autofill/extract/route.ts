import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { UserField } from "@/app/shared/types";
import { logger } from "@/app/shared/utils/logger";

const GEMINI_MODEL = 'gemini-3-flash-preview';

const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

const buildExtractionPrompt = (): string => {
  return `
    Analyze this document (image or PDF) and extract all relevant data fields that would be useful for filling forms.
    Focus on extracting specific values like:
    - Personal Information (Name, Address, DOB, Phone, Email, etc.)
    - Identification Numbers (Passport, Driver's License, SSN, etc.)
    - Financial or Employment Data if present.
    - Vehicle information if present.
    
    Do not extract long paragraphs. Extract concise Key-Value pairs.
    Return the output as a JSON List of objects with 'key' and 'value' properties.
  `;
};

const parseExtractionResponse = (rawText: string): UserField[] => {
  const data = JSON.parse(rawText) as { key: string, value: string }[];
  logger.info('DOCUMENT_SCRAPING', `Extracted ${data.length} fields from document.`);

  return data.map(item => ({
    id: crypto.randomUUID(),
    key: item.key,
    value: item.value
  }));
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { base64, mimeType } = body;

    if (!base64 || !mimeType) {
      return NextResponse.json(
        { error: 'Missing base64 or mimeType' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    const prompt = buildExtractionPrompt();

    logger.info('GEMINI_API', 'Sending data to Gemini for extraction...');
    const startTime = performance.now();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING },
              value: { type: Type.STRING }
            }
          }
        }
      }
    });

    const endTime = performance.now();
    logger.info('GEMINI_API', `Received response from Gemini in ${(endTime - startTime).toFixed(2)}ms`);

    const rawText = response.text || "[]";
    const result = parseExtractionResponse(rawText);

    return NextResponse.json({ fields: result });
  } catch (error) {
    logger.error('DOCUMENT_SCRAPING', 'Error in extraction endpoint', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
