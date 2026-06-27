import React, { useRef } from 'react';
import { cn } from '@/app/shared/utils/cn';

type FileDropzoneProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  error?: string | null;
  onFilesAdded: (files: FileList | File[]) => void;
};

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  icon,
  title,
  description,
  accept,
  multiple = false,
  disabled = false,
  error = null,
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
    <div className="w-full">
      {/* Desktop Dropzone */}
      <div 
        className={cn(
          "hidden md:flex border-2 border-dashed rounded-xl p-12 flex-col items-center justify-center transition-colors",
          error ? "border-red-400 bg-red-50 hover:bg-red-100" : "border-slate-300 bg-slate-50 hover:bg-slate-100",
          disabled ? "opacity-50 cursor-not-allowed hover:bg-slate-50 hover:border-slate-300" : "cursor-pointer"
        )}
        onClick={() => {
          if (!disabled) fileInputRef.current?.click();
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className={cn("p-3 rounded-full mb-4", error ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600")}>
          {icon}
        </div>
        <p className={cn("font-semibold mb-1 text-center", error ? "text-red-700" : "text-slate-700")}>
          {title}
        </p>
        <p className={cn("text-sm text-center", error ? "text-red-500" : "text-slate-500")}>
          {description}
        </p>
        {error && (
          <p className="mt-4 text-sm font-medium text-red-600 bg-red-100/50 px-3 py-1 rounded-md">
            {error}
          </p>
        )}
      </div>

      {/* Mobile Upload Button */}
      <div className="md:hidden w-full flex flex-col gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) fileInputRef.current?.click();
          }}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 border border-slate-300 bg-white text-slate-700 rounded-xl font-medium shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="[&>svg]:w-5 [&>svg]:h-5 [&>svg]:text-slate-500">
            {icon}
          </span>
          <span>{multiple ? 'Upload files' : 'Upload file'}</span>
        </button>
        {error && (
          <p className="text-sm font-medium text-red-600 text-center">
            {error}
          </p>
        )}
      </div>

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
