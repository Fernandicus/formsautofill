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

const buildMappingPrompt = (userFields: UserField[], fieldMetadata: string, markedMarkdown: string): string => {
  return `
    You are an intelligent form-filling assistant. 
    I am providing you with a Markdown representation of a form, and a list of User Data.
    
    Your task is to:
    1. Read the Markdown text below. Notice the numerical markers (e.g. [0], [1], [2]) embedded in the text. These represent the interactive form fields.
    2. Understand what each marker represents by reading the text label NEXT TO, ABOVE, or AROUND it in the Markdown structure (e.g. "Name: [0]", "City: [1]").
    3. Identify the predominant language of the document and return its ISO 639-1 code (e.g., "en", "es", "fr").
    4. Provide the mapping of user values using the markers' indices.
    5. Return also the unmatched fields.
    6. For the unmatched fields, return an empty string "" for the userValue.

    Rules:
    - If the semantic context around a marker implies "Name", find the User Data for Name.
    - If the semantic context implies "City", find the User Data for City.
    - If the label is not very specific, use the surrounding text to get more context to understand what it represents.
    - Contextual Inference and Synonyms: For example, If User Data has "Car: Tesla", and the text says "Vehicle: [4]", map it.
    - Checkboxes: The 'label' MUST represent the overarching group or question (e.g. "Sex", "Language"). Set 'displayValue' to the specific option text for this checkbox (e.g. "Hombre", "Spanish") regardless of whether it is matched or not. If the user data indicates it should be checked, set 'userValue' to "true". If it is unmatched or not checked, set 'userValue' to "".
    - Dropdowns: First identify the label that matches the User Data. Then, you MUST select EXACTLY ONE of the internal field values provided in the "Options" list from the Field Metadata below that corresponds to that label. HOWEVER, if the user's data has no logical match, return the user's data exactly as it is (do NOT return an empty string). This ensures the UI treats it as an inexact match.
    - RadioGroups: First identify the overarching group or question (e.g. "Gender"). Then, select EXACTLY ONE of the internal field values provided in the "Options" list from the Field Metadata below that corresponds to the label that matches the user data. Set 'userValue' to this exact internal field value. If the user's data has no logical match, set 'userValue' to "". You MUST also provide 'radioOptionsMap', an array mapping every internal option value to its human-readable label found in the Markdown.

    IMPORTANT:
    - 'markerIndex': MUST match the exact numerical index from the markers (e.g., "0", "1", "2").
    - 'label': The inferred label you found in the text for that marker.
    - 'isSuggestion': True if inferred/guessed.
    - 'detectedLanguage': Return the ISO 639-1 code for the document's language.

    User Data: ${JSON.stringify(userFields.map(u => ({ key: u.key, value: u.value })))}

    Field Metadata:
    ${fieldMetadata}
    
    --- Document Markdown ---
    ${markedMarkdown}
    -------------------------
  `;
};

const parseMappingResponse = (rawText: string, pdfFields: PdfFieldInfo[]) => {
  const parsed = JSON.parse(rawText) as { mappings: any[], detectedLanguage: string };

  const finalMappings: FieldMapping[] = parsed.mappings.map(m => {
    const fieldIndex = parseInt(m.markerIndex, 10);
    const pdfField = pdfFields[fieldIndex];
    const radioMap = m.radioOptionsMap?.reduce((acc: any, item: any) => {
      acc[item.internalValue] = item.visualLabel;
      return acc;
    }, {} as Record<string, string>);

    return {
      pdfFieldName: pdfField?.name || "",
      label: m.label,
      userValue: m.userValue,
      confidence: m.confidence,
      isSuggestion: m.isSuggestion,
      type: pdfField?.type,
      displayValue: m.displayValue,
      options: pdfField?.options,
      radioOptionsMap: radioMap,
    };
  }).filter(m => m.pdfFieldName);

  return { mappings: finalMappings, detectedLanguage: parsed.detectedLanguage };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pdfFields, userFields, markedMarkdown } = body;

    if (!pdfFields || !userFields || !markedMarkdown) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    const fieldMetadata = buildFieldMetadata(pdfFields);
    const prompt = buildMappingPrompt(userFields, fieldMetadata, markedMarkdown);

    logger.info('GEMINI_API', 'Sending data to Gemini for mapping (v3)...');
    const startTime = performance.now();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
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
                  displayValue: { type: Type.STRING, description: "For checkboxes, the actual selected option text (e.g., 'Hombre')" },
                  radioOptionsMap: {
                    type: Type.ARRAY,
                    description: "For RadioGroups, map internal option values to their visual labels",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        internalValue: { type: Type.STRING },
                        visualLabel: { type: Type.STRING }
                      },
                      required: ["internalValue", "visualLabel"]
                    }
                  }
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

    const endTime = performance.now();
    logger.info('GEMINI_API', `Received response from Gemini in ${(endTime - startTime).toFixed(2)}ms`);

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
