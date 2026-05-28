import { useCallback, useState } from 'react';
import { UserField } from '@/app/shared/types';
import { logger } from '@/app/shared/utils/logger';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g., data:image/png;base64,)
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const useDocumentExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const extractFieldsFromDocuments = useCallback(async (files: File[]): Promise<UserField[]> => {
    setIsExtracting(true);
    setExtractionError(null);
    let allExtractedFields: UserField[] = [];

    try {
      for (const file of files) {
        logger.info('DOC_EXTRACTION', `Extracting from ${file.name}`);
        const base64 = await fileToBase64(file);
        
        const response = await fetch('/api/autofill/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            base64,
            mimeType: file.type
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to extract from ${file.name}`);
        }

        const data = await response.json();
        if (data.fields && Array.isArray(data.fields)) {
          allExtractedFields = [...allExtractedFields, ...data.fields];
        }
      }
      logger.info('DOC_EXTRACTION', `Total extracted fields: ${allExtractedFields.length}`);
      return allExtractedFields;
    } catch (error) {
      console.error('Error extracting documents:', error);
      setExtractionError(error instanceof Error ? error.message : 'Unknown extraction error');
      throw error;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  return { extractFieldsFromDocuments, isExtracting, extractionError };
};
