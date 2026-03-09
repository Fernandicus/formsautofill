# Clean Code & React Architectural Patterns

## 1. Guard Clauses (Early Return)
Eliminate nested `if/else` logic by handling edge cases first.

**Bad:**
```typescript
function processUser(user: User | null) {
  if (user) {
    if (user.isActive) {
      if (!user.isBanned) {
        // complex logic
        return performAction();
      } else {
        throw new Error("User banned");
      }
    }
  }
}
```

**Good:**
```typescript
function processUser(user: User | null) {
  if (!user) return;
  if (!user.isActive) return;
  if (user.isBanned) throw new Error("User is banned");
  
  // Happy path
  return performAction();
}
```

## 2. React Hook Separation (Feature-First Architecture)
Keep components clean by delegating state and side effects to focused custom hooks.

**Component (View):**
```typescript
// MarkedPdfPreview.tsx
export const MarkedPdfPreview = ({ documentId }: { documentId: string }) => {
  const { pdfState, isLoading, error, handleConfirm } = usePdfProcessing({ documentId });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <PdfViewer 
      data={pdfState} 
      onConfirm={handleConfirm} 
    />
  );
};
```

**Hook (Logic):**
```typescript
// hooks/usePdfProcessing.ts
export const usePdfProcessing = ({ documentId }) => {
  const [pdfState, setPdfState] = useState<PdfState | null>(null);
  
  // Encapsulate all internal effects and fetching steps
  // Expose only what the component needs to render and interact.
  
  return { pdfState, isLoading, error, handleConfirm };
};
```

## 3. Avoid Magic Values
Extract semantic constants for readability.

```typescript
// Bad
if (status === 2 || status === 4) { ... }

// Good
const STATUS_PUBLISHED = 2;
const STATUS_ARCHIVED = 4;
if (status === STATUS_PUBLISHED || status === STATUS_ARCHIVED) { ... }
```
