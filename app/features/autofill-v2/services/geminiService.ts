import { GoogleGenAI, Type } from "@google/genai";
import { PdfFieldInfo, UserField, FieldMapping } from "@/app/shared/types";
import { logger } from "@/app/shared/utils/logger";

const GEMINI_MODEL = 'gemini-3-flash-preview';

/**
 * Converts a File object to a base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const mapFieldsWithGemini = async (
  pdfFields: PdfFieldInfo[],
  userFields: UserField[],
  markedBase64: string
): Promise<{ mappings: FieldMapping[], detectedLanguage: string }> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
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
    - Checkboxes: Return "true", "yes", "checked" if applicable.
    
    IMPORTANT:
    - 'markerIndex': MUST match the exact numerical index from the red markers (e.g., "0", "1", "2").
    - 'label': The visual label you found on the page (e.g. "First Name").
    - 'isSuggestion': True if inferred/guessed.
    - 'detectedLanguage': Return the ISO 639-1 code for the document's language.

    User Data: ${JSON.stringify(userFields.map(u => ({ key: u.key, value: u.value })))}
  `;

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
                isSuggestion: { type: Type.BOOLEAN, description: "True if this is an AI guess/inference, False if direct match" }
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

  try {
    const rawText = response.text || "{\"mappings\":[], \"detectedLanguage\":\"en\"}";
    const parsed = JSON.parse(rawText) as { mappings: any[], detectedLanguage: string };
    
    // Map markerIndex back to pdfFieldName
    const finalMappings: FieldMapping[] = parsed.mappings.map(m => ({
      pdfFieldName: pdfFields[parseInt(m.markerIndex, 10)]?.name || "",
      label: m.label,
      userValue: m.userValue,
      confidence: m.confidence,
      isSuggestion: m.isSuggestion,
    })).filter(Math => Math.pdfFieldName);

    return { mappings: finalMappings, detectedLanguage: parsed.detectedLanguage };
  } catch (e) {
    logger.error('GEMINI_API', 'Failed to parse Gemini response', e);
    return { mappings: [], detectedLanguage: "en" };
  }
};

export const extractDataFromDocument = async (file: File): Promise<UserField[]> => {
  const apiKey = process.env.GEMINI_API_KEY;


  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });
  const base64 = await fileToBase64(file);

  const prompt = `
    Analyze this document (image or PDF) and extract all relevant data fields that would be useful for filling forms.
    Focus on extracting specific values like:
    - Personal Information (Name, Address, DOB, Phone, Email, etc.)
    - Identification Numbers (Passport, Driver's License, SSN, etc.)
    - Financial or Employment Data if present.
    - Vehicle information if present.
    
    Do not extract long paragraphs. Extract concise Key-Value pairs.
    Return the output as a JSON List of objects with 'key' and 'value' properties.
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: {
        parts: [
            { inlineData: { mimeType: file.type, data: base64 } },
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
  
  try {
    const rawText = response.text || "[]";
    const data = JSON.parse(rawText) as {key: string, value: string}[];
    logger.info('DOCUMENT_SCRAPING', `Extracted ${data.length} fields from document.`);
    return data.map(item => ({
        id: crypto.randomUUID(),
        key: item.key,
        value: item.value
    }));
  } catch (e) {
    logger.error('DOCUMENT_SCRAPING', 'Failed to parse extracted data', e);
    return [];
  }
};
