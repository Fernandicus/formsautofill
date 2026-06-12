# Migration Architecture Examples

This document contains practical structure and code examples for performing safe migrations using feature-based versioning.

---

## 1. Feature-Based Versioning Folder Structure

When migrating a feature (e.g., `autofill-wizard`), restructure its directory to separate legacy and new versions while keeping common structures in `shared/`:

```text
src/features/autofill-wizard/
├── shared/                          # "Shared Core" for elements identical in both versions
│   ├── components/
│   │   └── WizardStepHeader.tsx     # Reusable layout header
│   └── hooks/
│       └── useUploadLimits.ts       # Shared calculation hook
├── v1/                              # Legacy version (STABLE & PROD)
│   ├── components/
│   │   ├── Step1UploadPdf.tsx
│   │   └── Step2UploadDocs.tsx
│   └── hooks/
│       └── useSyncDocProcessor.ts   # V1 synchronous processor
└── v2/                              # Migrated version (IN DEVELOPMENT / ACTIVE MIGRATION)
    ├── components/
    │   ├── Step1UploadPdf.tsx       # Redesigned PDF Step
    │   └── Step2UploadDocs.tsx       # Redesigned Docs Step with Async UI
    └── hooks/
        └── useAsyncDocProcessor.ts  # V2 asynchronous processor
```

---

## 2. Import Guidelines

Avoid cross-version imports between `v1` and `v2`. Only import from the current version's folder or from the `shared/` core.

### 🚫 Incorrect (Cross-Importing)
```tsx
// v2/components/Step2UploadDocs.tsx
// Importing logic directly from v1 is strictly forbidden
import { useSyncDocProcessor } from '../../v1/hooks/useSyncDocProcessor'; 
import { WizardStepHeader } from '../../v1/components/WizardStepHeader';
```

### ✅ Correct (Isolated Version Imports)
```tsx
// v2/components/Step2UploadDocs.tsx
// Importing from own version (v2) and shared core folder
import { useAsyncDocProcessor } from '../hooks/useAsyncDocProcessor'; 
import { WizardStepHeader } from '../../shared/components/WizardStepHeader';
```

---

## 3. Refactoring Code Sample (Clean Code Standards)

Below is an example of refactoring logic from a legacy monolithic hook (`v1`) to a modular, clean version (`v2`) using **Guard Clauses**, **SRP**, and **Meaningful Naming**.

### 🚫 Legacy Monolithic Implementation (v1 hook)
This hook has multiple responsibilities, deep nesting, and hardcoded variables:

```typescript
// v1/hooks/useDocProcessor.ts
import { useState } from 'react';

export function useDocProcessor(file: File | null, type: string) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState<string | null>(null);

  const processFile = async () => {
    if (file) {
      if (type === 'pdf') {
        setStatus('loading');
        try {
          const res = await fetch('/api/pdf', { method: 'POST', body: file });
          if (res.ok) {
            const data = await res.json();
            setStatus('success');
            return data;
          } else {
            setStatus('error');
            setError('Failed to process PDF file.');
          }
        } catch (e) {
          setStatus('error');
          setError('Network error');
        }
      } else {
        setStatus('loading');
        try {
          const res = await fetch('/api/docx', { method: 'POST', body: file });
          if (res.ok) {
            const data = await res.json();
            setStatus('success');
            return data;
          } else {
            setStatus('error');
            setError('Failed to process document.');
          }
        } catch (e) {
          setStatus('error');
          setError('Network error');
        }
      }
    } else {
      setError('No file selected');
    }
  };

  return { processFile, status, error };
}
```

### ✅ Clean & Modular Refactoring (v2 hook)
We extract specific API fetch logic to satisfy the **Single Responsibility Principle (SRP)** and employ **Guard Clauses (Early Return)**:

```typescript
// v2/hooks/useAsyncDocProcessor.ts
import { useState } from 'react';

type ProcessStatus = 'idle' | 'processing' | 'completed' | 'failed';

const ENDPOINTS = {
  PDF: '/api/pdf',
  DOCX: '/api/docx',
} as const;

// Helper function to handle individual API calls (SRP)
async function sendFileToProcessor(file: File, endpoint: string): Promise<unknown> {
  const response = await fetch(endpoint, {
    method: 'POST',
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Server returned status ${response.status}`);
  }

  return response.json();
}

export function useAsyncDocProcessor() {
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const processDocument = async (file: File | null, fileType: string) => {
    // 1. Guard Clauses (Early Returns)
    if (!file) {
      setError('No document selected.');
      return null;
    }

    const endpoint = fileType === 'pdf' ? ENDPOINTS.PDF : ENDPOINTS.DOCX;
    setStatus('processing');
    setError(null);

    // 2. Happy path logic is isolated at lowest nesting level
    try {
      const parsedData = await sendFileToProcessor(file, endpoint);
      setStatus('completed');
      return parsedData;
    } catch (err) {
      setStatus('failed');
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    }
  };

  return { processDocument, status, error };
}
```
