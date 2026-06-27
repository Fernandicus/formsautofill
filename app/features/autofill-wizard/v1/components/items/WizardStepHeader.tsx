import React from 'react';

type WizardStepHeaderProps = {
  title: string;
  description: React.ReactNode;
  titleClassName?: string;
  containerClassName?: string;
};

export const WizardStepHeader: React.FC<WizardStepHeaderProps> = ({ 
  title, 
  description, 
  titleClassName = "text-2xl",
  containerClassName = "mb-6 text-center"
}) => {
  return (
    <div className={containerClassName}>
      <h2 className={`${titleClassName} font-bold text-slate-900 mb-2`}>{title}</h2>
      <p className="text-slate-500">
        {description}
      </p>
    </div>
  );
};
