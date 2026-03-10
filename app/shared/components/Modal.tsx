import React from 'react';

type ModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
};

export const Modal: React.FC<ModalProps> = ({
  isOpen = true,
  onClose,
  children,
  maxWidth = 'max-w-md',
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
      <div className={`bg-white w-full ${maxWidth} shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 ${className}`}>
        {children}
      </div>
    </div>
  );
};

// --- Subcomponents ---

export const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0 ${className}`}>
    {children}
  </div>
);

export const ModalBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6 scroll-smooth custom-scrollbar ${className}`}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 border-t border-slate-100 flex justify-end gap-3 bg-white z-10 shrink-0 ${className}`}>
    {children}
  </div>
);

