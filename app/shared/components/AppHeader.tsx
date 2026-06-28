import React from 'react';
import Link from 'next/link';
import { AutoFillLogoIcon } from '@/icons';

export const AppHeader: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-indigo-600 rounded-lg p-1.5">
            <AutoFillLogoIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            AutoFill AI
          </h1>
        </Link>

        <div className="flex items-center gap-6">
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Powered by Gemini 3 Flash
          </div>
          <nav className="flex items-center gap-4">
            <Link 
              href="/profile" 
              className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Profile
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
