import { useCallback } from 'react';
import { useLocalStorage } from '@/app/shared/hooks/useLocalStorage';

export const useOnboarding = () => {
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage<boolean>('hasCompletedOnboarding', false);

    const completeOnboarding = useCallback(() => {
        setHasCompletedOnboarding(true);
    }, [setHasCompletedOnboarding]);

    return {
        hasCompletedOnboarding,
        completeOnboarding
    };
};
