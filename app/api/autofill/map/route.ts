import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { PdfFieldInfo, UserField, FieldMapping } from "@/app/shared/types";
import { logger } from "@/app/shared/utils/logger";

const GEMINI_MODEL = 'gemini-3-flash-preview';

const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

const buildFieldMetadata = (pdfFields: PdfFieldInfo[]): string => {
  return pdfFields.map((f, i) => {
    let info = `[${i}]: Type ${f.type}`;
    if (f.options && f.options.length > 0) {
      info += `, Options: ${JSON.stringify(f.options)}`;
    }
    return info;
  }).join('\n');
};

const buildMappingPrompt = (userFields: UserField[], fieldMetadata: string): string => {
  return `
    You are an intelligent form-filling assistant. 
    I will provide you with a PDF file (visually) and a list of User Data.
    
    Your task is to:
    1. VISUALLY look at the PDF. Notice the red numeric markers (e.g. [0], [1], [2]) drawn over the form fields.
    2. Understand what each marker represents by reading the text label NEXT TO or ABOVE it (e.g. "Name:", "City:").
    3. Identify the predominant language of the PDF document and return its ISO 639-1 code (e.g., "en", "es", "fr").
    4. Provide the mapping of user values using the markers' indices.
    5. Return also the unmatched fields.
    6. For the unmatched fields, return an empty string "" for the userValue.

    Rules:
    - If the visual label says "Name", find the User Data for Name.
    - If the visual label says "City", find the User Data for City.
    - If the visual label says "Email", find the User Data for Email.
    - If the visual label is not very specific, try to read the text around the field to get more context to understand what it really represents.
    - Contextual Inference and Synonyms: For example, If User Data has "Car: Tesla", and visual field says "Vehicle", map it.
    - Checkboxes: The 'label' MUST represent the overarching group or question (e.g. "Sex", "Language"). Set 'displayValue' to the specific option text for this checkbox (e.g. "Hombre", "Spanish") regardless of whether it is matched or not. If the user data indicates it should be checked, set 'userValue' to "true". If it is unmatched or not checked, set 'userValue' to "".
    - Dropdowns and Radio Buttons: First visually identify the label on the PDF that matches the User Data. Then, you MUST select EXACTLY ONE of the internal field values provided in the "Options" list from the Field Metadata below that corresponds to that visual label (inferring the mapping based on reading order if the internal values are uninformative like "1", "2"). (e.g., if User Data is "Man", visual label is "Male", and Options has "Male", return "Male". If Options are ["1", "2"], return the option that corresponds to "Male" by order). HOWEVER, if the user's data has no logical match, return the user's data exactly as it is (do NOT return an empty string). This ensures the UI treats it as an inexact match.
    IMPORTANT:
    - 'markerIndex': MUST match the exact numerical index from the red markers (e.g., "0", "1", "2").
    - 'label': The visual label you found on the page (e.g. "First Name").
    - 'isSuggestion': True if inferred/guessed.
    - 'detectedLanguage': Return the ISO 639-1 code for the document's language.

    User Data: ${JSON.stringify(userFields.map(u => ({ key: u.key, value: u.value })))}

    Field Metadata:
    ${fieldMetadata}
  `;
};

const parseMappingResponse = (rawText: string, pdfFields: PdfFieldInfo[]) => {
  const parsed = JSON.parse(rawText) as { mappings: any[], detectedLanguage: string };

  const finalMappings: FieldMapping[] = parsed.mappings.map(m => {
    const fieldIndex = parseInt(m.markerIndex, 10);
    const pdfField = pdfFields[fieldIndex];
    return {
      pdfFieldName: pdfField?.name || "",
      label: m.label,
      userValue: m.userValue,
      confidence: m.confidence,
      isSuggestion: m.isSuggestion,
      type: pdfField?.type,
      displayValue: m.displayValue,
    };
  }).filter(m => m.pdfFieldName);

  return { mappings: finalMappings, detectedLanguage: parsed.detectedLanguage };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pdfFields, userFields, markedBase64 } = body;

    if (!pdfFields || !userFields || !markedBase64) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    const fieldMetadata = buildFieldMetadata(pdfFields);
    const prompt = buildMappingPrompt(userFields, fieldMetadata);

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: markedBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mappings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  markerIndex: { type: Type.STRING, description: "The red marker index visible on the PDF field (e.g., '0', '1')" },
                  label: { type: Type.STRING, description: "The visual label found on the page" },
                  userValue: { type: Type.STRING, description: "The value to fill" },
                  confidence: { type: Type.STRING, enum: ["high", "low"], description: "Confidence level" },
                  isSuggestion: { type: Type.BOOLEAN, description: "True if this is an AI guess/inference, False if direct match" },
                  displayValue: { type: Type.STRING, description: "For checkboxes, the actual selected option text (e.g., 'Hombre')" }
                },
                required: ["markerIndex", "userValue", "confidence", "isSuggestion"]
              }
            },
            detectedLanguage: { type: Type.STRING, description: "ISO 639-1 language code of the document" }
          },
          required: ["mappings", "detectedLanguage"]
        }
      }
    });

    const rawText = response.text || "{\"mappings\":[], \"detectedLanguage\":\"en\"}";
    const result = parseMappingResponse(rawText, pdfFields);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('GEMINI_API', 'Error in mapping endpoint', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
