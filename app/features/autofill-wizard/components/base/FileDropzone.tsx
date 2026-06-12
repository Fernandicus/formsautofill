import React, { useRef } from 'react';

type FileDropzoneProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  onFilesAdded: (files: FileList | File[]) => void;
};

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  icon,
  title,
  description,
  accept,
  multiple = false,
  disabled = false,
  onFilesAdded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files);
    }
    // Reset value to allow uploading the same file again if needed
    e.target.value = '';
  };

  return (
    <div 
      className={`border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-12 flex flex-col items-center justify-center transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'
      }`}
      onClick={() => {
        if (!disabled) fileInputRef.current?.click();
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="bg-indigo-100 p-3 rounded-full mb-4">
        {icon}
      </div>
      <p className="font-semibold text-slate-700 mb-1 text-center">
        {title}
      </p>
      <p className="text-sm text-slate-500 text-center">
        {description}
      </p>
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
      />
    </div>
  );
};
