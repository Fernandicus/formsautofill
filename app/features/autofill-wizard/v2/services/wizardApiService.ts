import { UserField } from '@/app/shared/types';

export const fetchExtractedFields = async (gcsUri: string, mimeType: string): Promise<UserField[]> => {
  const response = await fetch('/api/autofill/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gcsUri,
      mimeType
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to extract data`);
  }

  const data = await response.json();
  return data.fields || [];
};

export const fetchMappedFields = async (
  pdfFields: any[], 
  extractedFields: UserField[], 
  markedPdfBase64: string
): Promise<{ mappings: any[], detectedLanguage: string }> => {
  const response = await fetch('/api/autofill/map', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        pdfFields,
        userFields: extractedFields.map(f => ({ key: f.key, value: f.value })),
        markedBase64: markedPdfBase64
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to map fields');
  }

  return response.json();
};

export const fetchMappedFieldsV3 = async (
  pdfFields: any[], 
  extractedFields: UserField[], 
  markedMarkdown: string
): Promise<{ mappings: any[], detectedLanguage: string }> => {
  const response = await fetch('/api/autofill/map-v3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        pdfFields,
        userFields: extractedFields.map(f => ({ key: f.key, value: f.value })),
        markedMarkdown
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to map fields (v3)');
  }

  return response.json();
};
