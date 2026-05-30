import React, { ReactNode } from 'react';

type WizardCardProps = {
  children: ReactNode;
  className?: string;
};

export const WizardCard: React.FC<WizardCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto w-full ${className}`}>
      {children}
    </div>
  );
};
