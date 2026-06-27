import React from 'react';
import { Button } from '@/app/shared/components/Button';

type MobileFixedBottomButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
};

export const MobileFixedBottomButton: React.FC<MobileFixedBottomButtonProps> = ({
  onClick,
  disabled,
  isLoading,
  children,
}) => {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-50">
      <Button 
        variant="primary" 
        onClick={onClick} 
        disabled={disabled}
        isLoading={isLoading}
        className="w-full"
        size="lg"
      >
        {children}
      </Button>
    </div>
  );
};
