import React from 'react';
import { FileText, Image as ImageIcon, File as FileIcon } from 'lucide-react';

type UploadedFileListProps = {
  files: File[];
  title?: string;
  containerClassName?: string;
};

export const UploadedFileList: React.FC<UploadedFileListProps> = ({ 
  files, 
  title = "Uploaded Documents",
  containerClassName = "mb-8"
}) => {
  if (files.length === 0) return null;

  return (
    <div className={containerClassName}>
      <div className="text-xs font-bold text-slate-400 mb-3 uppercase">{title}</div>
      <div className="flex flex-wrap gap-3">
        {files.map((doc, idx) => {
          let Icon = FileIcon;
          let iconColor = 'text-slate-500';
          let label = '';
          let labelColor = '';

          if (doc.type.includes('pdf')) {
            Icon = FileText;
            iconColor = 'text-red-500';
            label = 'PDF';
            labelColor = 'text-red-500';
          } else if (doc.type.includes('image')) {
            Icon = ImageIcon;
            iconColor = 'text-indigo-500';
            label = 'IMG';
            labelColor = 'text-indigo-500';
          }

          return (
            <div key={idx} className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50">
              {label ? (
                <span className={`${labelColor} font-bold`}>{label}</span>
              ) : (
                <Icon size={18} className={iconColor} strokeWidth={2.5} />
              )}
              <span className="text-slate-700 font-medium">{doc.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
