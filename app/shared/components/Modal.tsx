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

