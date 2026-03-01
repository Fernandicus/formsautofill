# Autofill System Architecture & Workflow

This document provides a comprehensive overview of how the Autofill System works in the application. The system is designed to take an uploaded PDF form, intelligently map user profile data into the applicable visual fields using the Gemini AI model, allow the user to review the mappings, and generate a filled PDF document.

## Overview of Components

The Autofill System uses a combination of React Hooks and isolated service modules for processing data cleanly, maintaining a separation of concerns according to the project's **Feature-First** architecture.

### Feature Location
Everything specific to the autofill flow is encapsulated under `app/features/autofill/`, primarily split between:
- **`services/pdfService.ts`**: Utilities for reading bounding boxes/names from PDFs and filling PDFs using `pdf-lib`.
- **`services/geminiService.ts`**: Integration with Google's GenAI for visual layout understanding and intelligent mapping.
- **`hooks/usePdfProcessing.ts`**: The orchestration layer uniting services and handling UI state progressions.
- **`hooks/useReviewMappings.ts`**: Specialized hook for the Review Modal, managing interactive mapping approvals.

---

## Step-by-Step Workflow

### Step 1: Document Upload & Pre-analysis (`usePdfProcessing.ts`)
The workflow begins when a user uploads a target PDF document. 
1. The `handleFileChange` function is called and updates the current state layer. 
2. The UI enters a scanning state, yielding execution for brief periods so the main thread limits UI blockages.

### Step 2: Field Extraction (`pdfService.ts`)
The `extractFormFields` function is called.
- It parses the raw `ArrayBuffer` of the PDF via `pdf-lib`.
- The system fetches every internal field representation (e.g., `PDFTextField`, `PDFCheckBox`, `PDFDropdown`).
- It grabs key attributes for every field: its internal `name` and its physical `rect` boundary coordinates. This is a crucial fallback since many internal PDF names are non-descript (e.g., "TextBox1").

### Step 3: AI-Powered Field Mapping (`geminiService.ts`)
Once fields are extracted, both the extracted fields list and the user's available profile data are handed off to `mapFieldsWithGemini()`.
- The actual PDF file is converted to a base64 string.
- Using `gemini-3-flash-preview`'s multimodal capabilities, both the file outline and textual details are given to the AI.
- **The Magic Step**: The prompt commands the AI to *visually look* at the PDF using the field `rect` data to find adjacent descriptions (e.g., matching the literal text "First Name:" visually near an input box with internal ID "text_01").
- **Output Validation**: Gemini enforces a JSON schema that returns exact mappings against internal PDF names alongside a confidence score and whether the mapping was an explicit known variable match versus an educated "suggestion". It simultaneously scans the document to detect the PDF's target language.

### Step 4: The Review Stage (`useReviewMappings.ts`)
When Gemini completes its response, `usePdfProcessing.ts` groups the fields into a reviewable state and stops at the `review` step. 

The `useReviewMappings` hook manages this view:
- **Categorization**: Fields are strictly bucketed into "Matched from Profile", "AI Suggestions", and "Missing Data".
- **Interaction Options**:
  - AI Suggestions can be blanket approved (`handleAcceptAllSuggestions`) or wiped.
  - Users can toggle inclusion settings, fill blank data manually, or adjust mappings.
  - A translation feature uses `translate` to translate the inferred visual labels (often returned by Gemini) into the user's native language.
- **Saving Missing Fields**: If a user manually inputs text into a "Missing Data" mapping, the system halts final generation to prompt the user to save these fresh datapoints back to their profile (`handleGenerateClick`).

### Step 5: PDF Generation (`pdfService.ts`)
Upon confirmation of all mapped definitions:
- The finalized map is pushed into `fillPdf`.
- The `pdf-lib` utility spins up a fresh buffer layer. 
- It matches types specifically: mapping truthy text matches ("true", "checked", "yes") correctly to `check()` methods for `PDFCheckBox` modules and performs case-insensitive dropdown selection routines.
- It reserializes the PDF.

### Step 6: Completion
- A UI blob output is constructed natively within browser memory using `URL.createObjectURL(blob)`.
- The filled PDF pops open in a new tab, completely localized without saving PII onto an external server layer past the ephemeral Gemini mapping requests.

---

## Architectural Principles Adhered To

- **Single Responsibility**: `pdfService` strictly interacts with `pdf-lib` and binary logic. `geminiService` abstracts network mapping tasks.
- **Non-blocking UI**: Hard processing stages explicitly yield execution to React's main thread with standard `Promises` so loaders have time to render.
- **Smart Validation Models**: Utilizing the `.config.responseSchema` standard provided by the `@google/genai` API guarantees the application operates on strictly-typed JSON schemas avoiding error-prone parsing.
