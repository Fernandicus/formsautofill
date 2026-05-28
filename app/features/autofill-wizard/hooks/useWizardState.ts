import { useReducer } from 'react';
import { FieldMapping, UserField } from '@/app/shared/types';

export type WizardStep = 1 | 2 | 3 | 4;

export type WizardState = {
  currentStep: WizardStep;
  mainPdf: File | null;
  supportingDocs: File[];
  extractedFields: UserField[];
  mappings: FieldMapping[];
  pdfLanguage: string;
  generatedPdfUrl: string | null;
  isProcessing: boolean;
  loadingMessage: string;
  error: string | null;
};

type WizardAction =
  | { type: 'SET_MAIN_PDF'; payload: File }
  | { type: 'ADD_SUPPORTING_DOCS'; payload: File[] }
  | { type: 'SET_PROCESSING'; payload: { isProcessing: boolean; message?: string } }
  | { type: 'SET_MAPPINGS'; payload: { mappings: FieldMapping[]; pdfLanguage: string; extractedFields: UserField[] } }
  | { type: 'SET_GENERATED_PDF'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' }
  | { type: 'GO_TO_STEP'; payload: WizardStep };

const initialState: WizardState = {
  currentStep: 1,
  mainPdf: null,
  supportingDocs: [],
  extractedFields: [],
  mappings: [],
  pdfLanguage: 'en',
  generatedPdfUrl: null,
  isProcessing: false,
  loadingMessage: '',
  error: null,
};

const reducer = (state: WizardState, action: WizardAction): WizardState => {
  switch (action.type) {
    case 'SET_MAIN_PDF':
      return { ...state, mainPdf: action.payload, currentStep: 2, error: null };
    case 'ADD_SUPPORTING_DOCS':
      return { ...state, supportingDocs: [...state.supportingDocs, ...action.payload] };
    case 'SET_PROCESSING':
      return { 
        ...state, 
        isProcessing: action.payload.isProcessing, 
        loadingMessage: action.payload.message || '',
        error: null 
      };
    case 'SET_MAPPINGS':
      return {
        ...state,
        mappings: action.payload.mappings,
        pdfLanguage: action.payload.pdfLanguage,
        extractedFields: action.payload.extractedFields,
        currentStep: 3,
        isProcessing: false,
      };
    case 'SET_GENERATED_PDF':
      return {
        ...state,
        generatedPdfUrl: action.payload,
        currentStep: 4,
        isProcessing: false,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isProcessing: false };
    case 'RESET':
      return { ...initialState };
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
    default:
      return state;
  }
};

export const useWizardState = () => {
  return useReducer(reducer, initialState);
};
