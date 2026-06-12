# Autofill System (v3) - Wizard & Dynamic Extraction Workflow

## 1. Overview
This document explains the architecture and logic of the current Autofill system (V3), implemented under the `app/features/autofill-wizard` directory. 

While the previous system (v2) relied on a pre-configured user profile (static data) and a modal-based UI, V3 introduces a complete step-by-step wizard. It dynamically extracts user data directly from uploaded supporting documents (e.g., ID cards, passports, contracts) and uses Google's Gemini LLM to map this extracted data onto the main PDF form using an advanced markdown-based structural approach.

## 2. Architecture & Differences from V2

The codebase currently contains two similar folders (`autofill-v2` and `autofill-wizard`). `autofill-wizard` is the new, active V3 iteration.

### Key Differences:
- **Data Source:** 
  - `autofill-v2`: Relied on structured user profile `groups` (e.g., predefined fields like First Name, Last Name passed from the user's saved account) to map against the PDF fields.
  - `autofill-wizard` (V3): Uses dynamic extraction. Users upload "supporting documents" in Step 2. The system reads these files and dynamically generates user data on the fly using the `/api/autofill/extract` endpoint.
- **AI Mapping Strategy:**
  - `autofill-v2`: Used a "Set-of-Mark" visual strategy, drawing literal red markers on an image of the PDF and passing a base64 image along with the profile data to Gemini (`/api/autofill/map`).
  - `autofill-wizard` (V3): Uses a more efficient textual/structural approach. It generates Markdown with embedded markers from the PDF (`generateMarkdownFromPdf`), passing this text representation along with the dynamically extracted fields to Gemini (`/api/autofill/map-v3`).
- **User Interface:**
  - `autofill-v2`: Used a `ReviewModal` popup after selecting a file.
  - `autofill-wizard`: Introduces a dedicated, 4-step wizard interface:
    1. Upload Main PDF.
    2. Upload Supporting Docs.
    3. Review & Fix Mappings.
    4. Download Filled PDF.

## 3. Step-by-Step Workflow (Current Process)

### Step 1: Upload Main Form (`Step1UploadPdf.tsx`)
1. The user uploads the target PDF form they wish to complete.
2. The `useWizardWorkflow.ts` hook handles validation, checking if the PDF is valid, and uses `pdfService.ts` (`extractFormFields`) to parse the PDF and extract all interactive fillable fields.

### Step 2: Upload Supporting Documents (`Step2UploadDocs.tsx`)
1. The user uploads unstructured images/PDFs containing their personal information (e.g., IDs, bills, contracts).
2. The UI component manages file validation and states before triggering the main extraction.

### Step 3: Concurrent Extraction & AI Mapping (`useWizardWorkflow.ts` & `wizardApiService.ts`)
When the user clicks "Continue" in Step 2, a highly optimized concurrent process begins:
1. **Extraction:** The supporting documents are converted to base64 and sent to the `/api/autofill/extract` endpoint (`useDocumentExtraction.ts`). Gemini reads these files and extracts a generic list of `UserField` objects.
2. **Context Generation:** Concurrently, the system generates a Markdown representation of the main PDF, embedding specific markers for each fillable field (`generateMarkdownFromPdf`).
3. **Mapping Inference:** Both the extracted `UserField`s and the generated Markdown are sent to `/api/autofill/map-v3`.
4. **Result:** Gemini analyzes the data fields alongside the document context, returning an array of mapped data that pairs each PDF marker with the optimal value from the supporting documents. 

### Step 4: User Review (`Step3Review.tsx` & `useReviewState.ts`)
1. The UI presents a completion percentage.
2. The user is prompted to manually fix mappings, which are categorized into:
   - **Error Fields:** Mappings that have invalid data types or format errors.
   - **Missing Fields:** PDF fields that the AI couldn't confidently map from the provided supporting docs.
3. The `useReviewState.ts` hook handles interactive state tracking for user edits.

### Step 5: Final PDF Generation (`Step4Download.tsx`)
1. The user confirms the final, edited mappings.
2. The `fillPdf` function (from `autofill-v2/services/pdfService.ts`) injects the data into the PDF fields.
3. The filled PDF is compiled into a `Uint8Array`, converted to a Blob URL, and presented to the user for download in Step 4.
