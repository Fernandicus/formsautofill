# Autofill System (v2) - Architecture & Workflow

This document explains the architecture and logic of the current Autofill system (V2), which leverages the **Set-of-Mark** visual strategy and Gemini LLM to drastically improve form-filling accuracy.

## 1. Overview
Instead of relying on internal, often cryptic PDF field names to infer what data belongs in what field, the new system takes a visual approach. It draws explicit, numbered red markers next to each fillable field and sends an image (or base64 version) of the PDF directly to Google's Gemini Vision model.

By asking Gemini to visually analyze the red markers along with their surrounding text (e.g., the label "First Name" next to marker `[0]`), the system accurately correlates User Data with the corresponding PDF fields.

## 2. Core Components
The system resides under `app/features/autofill-v2/` and is divided into three main areas:
- **Hooks (`usePdfProcessing.ts`)**: Oversees the entire state machine of the upload -> analyze -> map -> review -> fill flow.
- **PDF Services (`pdfService.ts`)**: Handles local PDF parsing, red-marker drawing (Set-of-Mark), and final data injection using `pdf-lib`.
- **Gemini Services (`geminiService.ts`)**: Constructs the prompt and context window, calling the Gemini model to intelligently map the user's data to the visually marked fields.

---

## 3. Step-by-Step Workflow

### Step 1: Initialization & Extraction
1. **User Uploads PDF:** The file is passed to `usePdfProcessing.ts` via `handleFileChange`.
2. **Field Extraction (`pdfService.ts`):** We parse the PDF using `pdf-lib` and extract all interactive form fields (`PDFTextField`, `PDFCheckBox`, `PDFDropdown`, `PDFRadioGroup`). 
3. **Capture Coordinates:** For each field, we extract its visual bounding box (`rect`), noting its `x` and `y` coordinates on the page.

### Step 2: Set-of-Mark Generation
1. **Draw Markers (`pdfService.ts`):** We iterate over every extracted field. Using the `rect` coordinates, we draw a prominent red marker string like `[0]`, `[1]`, etc., onto a new temporary copy of the PDF.
2. **Base64 Conversion:** This newly annotated (marked) PDF is converted into a base64 Data URL.

### Step 3: AI Inference (Gemini)
1. **Prepare Data:** The application gathers all user data profiles (e.g., name, emails, addresses) and flattens them into a readable key-value list.
2. **Prompting Gemini (`geminiService.ts`):** 
   - The Marked PDF (base64) and the flattened User Data are sent to `gemini-3-flash-preview`.
   - The prompt instructs the AI to look at each red numerical marker, read the adjacent semantic label (e.g., "Mailing Address: [3]"), and find the best match from the User Data.
   - It also infers the predominant language of the PDF (outputted as an ISO 639-1 code).
3. **Receipt of Mappings:** Gemini returns a JSON object mapping the `markerIndex` to a `userValue`, along with a confidence score and `isSuggestion` flag. 

### Step 4: Index Reconnection & Review
1. **Re-Map Indices:** The returned `markerIndex` strings are mapped back to actual `pdfFieldName` strings in the code.
2. **User Review (`ReviewModal`):** 
   - The user is presented with a modal showing Gemini's inferred mappings (`showReview` state in the hook).
   - Unmatched fields are left blank, and suggested inferences are highlighted.
   - The user can adjust values before confirming.

### Step 5: Final PDF Generation
1. **Fill PDF (`pdfService.ts`):** Upon confirmation, the application iterates over the mappings.
2. **Data Injection:** Using `pdf-lib`, values are injected. 
   - **Text Fields:** Direct string injection.
   - **Checkboxes:** Truthy matches (`true`, `yes`, `x`, `1`) check the box, falsy matches uncheck it.
   - **Dropdowns/Radios:** System attempts an exact match, falling back to a case-insensitive search if needed.
3. **Delivery:** The final populated `Uint8Array` is generated into a Blob and opened in a new browser tab for the user to print or download.
