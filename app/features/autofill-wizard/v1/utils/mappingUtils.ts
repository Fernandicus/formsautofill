import { FieldMapping } from '@/app/shared/types';

export const mergeGeminiMappings = (pdfFields: any[], geminiMappings: FieldMapping[]): FieldMapping[] => {
  return pdfFields.map(field => {
      const foundMapping = geminiMappings.find(mapping => mapping.pdfFieldName === field.name);

      if (foundMapping) {
          return foundMapping;
      }

      return {
          pdfFieldName: field.name,
          userValue: '',
          label: field.label || field.name,
          isSuggestion: false,
          confidence: 'low',
          type: field.type,
          options: field.options
      };
  });
};
