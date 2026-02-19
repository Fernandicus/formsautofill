import { GoogleGenAI, Type } from "@google/genai";
import { PdfFieldInfo, UserField, FieldMapping } from "../types";

export const mapFieldsWithGemini = async (
  pdfFields: PdfFieldInfo[],
  userFields: UserField[]
): Promise<FieldMapping[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an intelligent form-filling assistant. 
    I will provide you with a list of available Form Fields found in a PDF file, and a list of User Data (Key-Value pairs).
    
    Your task is to match the User Data to the PDF Fields using strict matching AND contextual reasoning.
    
    Rules:
    1. Analyze the field name to understand what information it requires.
    2. Look at the User Data to find the best matching value.
    3. **Contextual Inference (CRITICAL)**: If a direct match isn't found, use logical reasoning based on available User Data.
       - Example: If User Data contains "Car Model: Tesla", and PDF Field is "Needs Parking" or "Vehicle Owner", infer "Yes" or "true".
       - Example: If User Data contains "Children: 3", and PDF Field is "Has Dependents", infer "Yes".
       - Example: If User Data contains "Employment: Unemployed", and PDF Field is "Work Phone", leave blank or "N/A".
    4. **General Suggestions**: If no user data provides a clue, generate a plausible common value.
       - Example: "Date" -> Today's date (2025).
       - Example: "City" -> "Unknown City" (or leave blank if unsure).
    5. For Checkboxes: Return "true", "false", "yes", "no", "checked", or "unchecked".
    
    IMPORTANT for JSON Output:
    - 'isSuggestion': Set to TRUE if the value was inferred (Rule 3) or guessed (Rule 4). Set to FALSE only for direct matches (e.g. Name -> Name).
    - 'confidence': 'high' if matched or strongly inferred. 'low' if a random guess.

    PDF Fields: ${JSON.stringify(pdfFields.map(f => ({ name: f.name, type: f.type })))}
    User Data: ${JSON.stringify(userFields.map(u => ({ key: u.key, value: u.value })))}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            pdfFieldName: { type: Type.STRING, description: "The exact name of the field in the PDF" },
            userValue: { type: Type.STRING, description: "The value to fill" },
            confidence: { type: Type.STRING, enum: ["high", "low"], description: "Confidence level" },
            isSuggestion: { type: Type.BOOLEAN, description: "True if this is an AI guess/inference, False if direct match" }
          },
          required: ["pdfFieldName", "userValue", "confidence", "isSuggestion"]
        }
      }
    }
  });

  const rawText = response.text || "[]";
  try {
    const mappings = JSON.parse(rawText) as FieldMapping[];
    return mappings;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
};

export const extractDataFromDocument = async (file: File): Promise<UserField[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  // Convert File to Base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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
    model: 'gemini-3-flash-preview',
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
  
  const rawText = response.text || "[]";
  try {
      const data = JSON.parse(rawText) as {key: string, value: string}[];
      return data.map(item => ({
          id: Date.now().toString() + Math.random().toString(),
          key: item.key,
          value: item.value
      }));
  } catch (e) {
      console.error("Failed to parse extracted data", e);
      return [];
  }
};
