import { useState, useEffect } from 'react';
import { ProcessingStatus } from '@/app/shared/types';

const LOADING_TIPS = [
    "Analyzing document layout...",
    "Reading your profile data...",
    "Matching fields with AI...",
    "Applying smart context...",
    "Almost there..."
];

export const useStatusOverlayLogic = (status: ProcessingStatus) => {
    const [progress, setProgress] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);

    const isProcessing = ['analyzing_pdf', 'mapping_ai', 'filling'].includes(status.step);
    const isError = status.step === 'error';
    const isCompleted = status.step === 'completed';
    const show = isProcessing || isError || isCompleted;

    useEffect(() => {
        if (!isProcessing) {
            setProgress(0);
            setTipIndex(0);
            return;
        }

        let currentProgress = progress;
        const progressInterval = setInterval(() => {
            currentProgress += (98 - currentProgress) * 0.012;
            setProgress(Math.min(98, currentProgress));
        }, 150);

        return () => clearInterval(progressInterval);
    }, [isProcessing, progress, status.step]);

    useEffect(() => {
        if (status.step !== 'mapping_ai') return;

        const tipInterval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
        }, 2000);

        return () => clearInterval(tipInterval);
    }, [status.step]);

    let title = "Processing...";
    let message = status.message;

    if (status.step === 'analyzing_pdf') {
        title = 'Reading PDF...';
        message = status.message || 'Scanning form fields...';
    } else if (status.step === 'mapping_ai') {
        title = 'AI Matching...';
        message = LOADING_TIPS[tipIndex];
    } else if (status.step === 'filling') {
        title = 'Creating PDF...';
        message = status.message || 'Finalizing document...';
    }

    return {
        progress,
        isProcessing,
        isError,
        isCompleted,
        show,
        title,
        message
    };
};
