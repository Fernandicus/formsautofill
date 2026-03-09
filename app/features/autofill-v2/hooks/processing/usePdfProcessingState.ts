import { useReducer } from 'react';
import { FieldMapping, ProcessingStatus, PdfFieldInfo } from '@/app/shared/types';

export type PdfProcessingState = {
    status: ProcessingStatus;
    mappings: FieldMapping[];
    pdfLanguage: string;
    showReview: boolean;
    currentFile: File | null;
    markedBase64: string | null;
    pendingPdfFields: PdfFieldInfo[];
};

export type PdfProcessingAction =
    | { type: 'SET_STATUS'; payload: ProcessingStatus }
    | { type: 'SET_FILE'; payload: File | null }
    | { type: 'MAPPING_COMPLETE'; payload: { mappings: FieldMapping[]; pdfLanguage: string } }
    | { type: 'START_MARKS_REVIEW'; payload: { markedBase64: string; pendingPdfFields: PdfFieldInfo[] } }
    | { type: 'CANCEL_REVIEW' }
    | { type: 'CANCEL_MARKS_REVIEW' }
    | { type: 'HIDE_REVIEW' }
    | { type: 'CLEAR_PENDING' };

const initialState: PdfProcessingState = {
    status: { step: 'idle' },
    mappings: [],
    pdfLanguage: 'en',
    showReview: false,
    currentFile: null,
    markedBase64: null,
    pendingPdfFields: []
};

const reducer = (state: PdfProcessingState, action: PdfProcessingAction): PdfProcessingState => {
    switch (action.type) {
        case 'SET_STATUS':
            return { ...state, status: action.payload };
        case 'SET_FILE':
            return {
                ...state,
                currentFile: action.payload,
                status: { step: 'idle' },
                markedBase64: null,
                pendingPdfFields: []
            };
        case 'MAPPING_COMPLETE':
            return {
                ...state,
                mappings: action.payload.mappings,
                pdfLanguage: action.payload.pdfLanguage,
                status: { step: 'review' },
                showReview: true,
                markedBase64: null,
                pendingPdfFields: []
            };
        case 'START_MARKS_REVIEW':
            return {
                ...state,
                markedBase64: action.payload.markedBase64,
                pendingPdfFields: action.payload.pendingPdfFields,
                status: { step: 'review_marks' }
            };
        case 'CANCEL_REVIEW':
            return { ...state, showReview: false, status: { step: 'idle' } };
        case 'CANCEL_MARKS_REVIEW':
            return { ...state, status: { step: 'idle' }, markedBase64: null, pendingPdfFields: [] };
        case 'HIDE_REVIEW':
            return { ...state, showReview: false };
        case 'CLEAR_PENDING':
            return { ...state, markedBase64: null, pendingPdfFields: [] };
        default:
            return state;
    }
};

export const usePdfProcessingState = () => {
    return useReducer(reducer, initialState);
};
