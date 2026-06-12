import React, { ReactNode } from 'react';

type WizardCardProps = {
  children: ReactNode;
  className?: string;
};

export const WizardCard: React.FC<WizardCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`sm:bg-white sm:rounded-xl sm:border sm:border-slate-200 sm:shadow-sm sm:p-8 max-w-3xl mx-auto w-full ${className}`}>
      {children}
    </div>
  );
};
