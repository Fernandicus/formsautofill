import { useReducer, useCallback } from 'react';
import { ProcessingStatus, FieldMapping } from '@/app/shared/types';

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
    | { type: 'CANCEL_REVIEW' };

const initialState: PdfProcessingState = {
    status: { step: 'idle' },
    mappings: [],
    pdfLanguage: 'en',
    showReview: false,
    currentFile: null,
};

const reducer = (state: PdfProcessingState, action: PdfProcessingAction): PdfProcessingState => {
    switch (action.type) {
        case 'SET_STATUS':
            return { ...state, status: action.payload };
        case 'SET_FILE':
            return { ...state, currentFile: action.payload, status: { step: 'idle' } };
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
        default:
            return state;
    }
};

export const usePdfProcessingState = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const setStatus = useCallback((status: ProcessingStatus) => {
        dispatch({ type: 'SET_STATUS', payload: status });
    }, []);

    const setFile = useCallback((file: File | null) => {
        dispatch({ type: 'SET_FILE', payload: file });
    }, []);

    const setMappingComplete = useCallback((mappings: FieldMapping[], pdfLanguage: string) => {
        dispatch({ type: 'MAPPING_COMPLETE', payload: { mappings, pdfLanguage } });
    }, []);

    const closeStatusModal = useCallback(() => {
        dispatch({ type: 'SET_STATUS', payload: { step: 'idle' } });
    }, []);

    const cancelReview = useCallback(() => {
        dispatch({ type: 'CANCEL_REVIEW' });
    }, []);

    return {
        state,
        setStatus,
        setFile,
        setMappingComplete,
        closeStatusModal,
        cancelReview,
    };
};
