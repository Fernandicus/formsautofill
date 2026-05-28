import { useCallback, useState } from 'react';
import { UserField } from '@/app/shared/types';
import { logger } from '@/app/shared/utils/logger';
import { fileToBase64 } from '../utils/fileUtils';
import { fetchExtractedFields } from '../services/wizardApiService';

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
        
        const fields = await fetchExtractedFields(base64, file.type);
        allExtractedFields = [...allExtractedFields, ...fields];
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
