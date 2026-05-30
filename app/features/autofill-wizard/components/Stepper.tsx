import React from 'react';
import { WizardStep } from '../hooks/useWizardState';
import { FileText, Database, CheckCircle2 } from 'lucide-react';

type StepperProps = {
  currentStep: WizardStep;
};

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const steps = [
    { 
      num: 1, 
      title: 'Upload PDF', 
      description: 'Upload the form to analyze it',
      icon: FileText
    },
    { 
      num: 2, 
      title: 'Upload Data', 
      description: 'Attach ID or supporting documents',
      icon: Database
    },
    { 
      num: 3, 
      title: 'Download', 
      description: 'Ready to sign and save',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto mb-8 w-full flex flex-col sm:flex-row gap-6 sm:gap-8">
      {steps.map((step) => {
        const isActive = currentStep === step.num;
        const isCompleted = currentStep > step.num;
        const isHighlighted = isActive || isCompleted;

        const Icon = step.icon;

        return (
          <div key={step.num} className="flex-1 flex flex-col">
            {/* Top Indicator Line */}
            <div className={`h-[2px] w-full mb-4 ${isCompleted ? 'bg-emerald-500' : isActive ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            
            <div className={`text-[10px] sm:text-xs font-bold mb-2 uppercase tracking-wide ${isHighlighted ? 'text-indigo-600' : 'text-slate-400'}`}>
              Step {step.num}
            </div>
            
            <div className={`flex items-center gap-2 mb-1.5 ${isHighlighted ? 'text-slate-900' : 'text-slate-500'}`}>
              <Icon size={16} className={isHighlighted ? 'text-indigo-600' : 'text-slate-400'} strokeWidth={isHighlighted ? 2.5 : 2} />
              <span className="font-bold text-sm">{step.title}</span>
            </div>
            
            <div className="text-xs text-slate-500 leading-relaxed">
              {step.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};
