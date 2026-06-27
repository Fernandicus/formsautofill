import { useCallback, useState } from 'react';
import { UserField } from '@/app/shared/types';
import { logger } from '@/app/shared/utils/logger';
import { fetchExtractedFields } from '../services/wizardApiService';

export const useDocumentExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const extractFieldsFromDocuments = useCallback(async (files: File[]): Promise<UserField[]> => {
    setIsExtracting(true);
    setExtractionError(null);

    try {
      const extractionPromises = files.map(async (file) => {
        logger.info('DOC_EXTRACTION', `Uploading and extracting from ${file.name}...`);
        
        // 1. Get signed upload URL
        const uploadUrlResponse = await fetch('/api/autofill/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type })
        });
        
        if (!uploadUrlResponse.ok) {
          throw new Error(`Failed to get signed upload URL for ${file.name}`);
        }
        
        const { signedUrl, gcsUri } = await uploadUrlResponse.json();
        
        // 2. Upload the file directly to GCS via PUT
        logger.info('DOC_EXTRACTION', `PUT upload to GCS for ${file.name}...`);
        const putResponse = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });
        
        if (!putResponse.ok) {
          throw new Error(`Failed to upload ${file.name} to Cloud Storage`);
        }
        
        // 3. Request server-side extraction using GCS URI
        logger.info('DOC_EXTRACTION', `Triggering backend extraction for ${file.name}...`);
        return fetchExtractedFields(gcsUri, file.type);
      });

      const results = await Promise.all(extractionPromises);
      const allExtractedFields = results.flat();

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
