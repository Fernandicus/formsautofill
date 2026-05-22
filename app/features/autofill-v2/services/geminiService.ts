import { PdfFieldInfo, UserField, FieldMapping } from "@/app/shared/types";

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
  const response = await fetch('/api/autofill/map', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfFields, userFields, markedBase64 }),
  });

  if (!response.ok) {
    throw new Error('Failed to map fields');
  }

  return response.json();
};

export const extractDataFromDocument = async (file: File): Promise<UserField[]> => {
  const base64 = await fileToBase64(file);
  const response = await fetch('/api/autofill/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, mimeType: file.type }),
  });

  if (!response.ok) {
    throw new Error('Failed to extract data');
  }

  const result = await response.json();
  return result.fields;
};
