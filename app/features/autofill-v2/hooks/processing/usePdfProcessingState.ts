import { useReducer } from 'react';
import { FieldMapping, ProcessingStatus, PdfFieldInfo } from '@/app/shared/types';

export type PdfProcessingState = {
    status: ProcessingStatus;
    mappings: FieldMapping[];
    pdfLanguage: string;
    showReview: boolean;
    currentFile: File | null;
};

export type PdfProcessingAction =
    | { type: 'SET_STATUS'; payload: ProcessingStatus }
    | { type: 'SET_FILE'; payload: File | null }
    | { type: 'MAPPING_COMPLETE'; payload: { mappings: FieldMapping[]; pdfLanguage: string } }
    | { type: 'CANCEL_REVIEW' }
    | { type: 'HIDE_REVIEW' };

const initialState: PdfProcessingState = {
    status: { step: 'idle' },
    mappings: [],
    pdfLanguage: 'en',
    showReview: false,
    currentFile: null
};

const reducer = (state: PdfProcessingState, action: PdfProcessingAction): PdfProcessingState => {
    switch (action.type) {
        case 'SET_STATUS':
            return { ...state, status: action.payload };
        case 'SET_FILE':
            return {
                ...state,
                currentFile: action.payload,
                status: { step: 'idle' }
            };
        case 'MAPPING_COMPLETE':
            return {
                ...state,
                mappings: action.payload.mappings,
                pdfLanguage: action.payload.pdfLanguage,
                status: { step: 'review' },
                showReview: true
            };
        case 'CANCEL_REVIEW':
            return { ...state, showReview: false, status: { step: 'idle' } };
        case 'HIDE_REVIEW':
            return { ...state, showReview: false };
        default:
            return state;
    }
};

export const usePdfProcessingState = () => {
    return useReducer(reducer, initialState);
};
