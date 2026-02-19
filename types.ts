export interface UserField {
  id: string;
  key: string; // e.g., "Phone Number"
  value: string; // e.g., "555-1234"
}

export interface DataGroup {
  id: string;
  name: string;
  fields: UserField[];
  isExpanded: boolean;
}

export interface PdfFieldInfo {
  name: string;
  type: 'Text' | 'CheckBox' | 'Dropdown' | 'Other';
}

export interface FieldMapping {
  pdfFieldName: string;
  userValue: string;
  confidence?: 'high' | 'low';
  originalValue?: string; // To track edits
  isSuggestion?: boolean; // Indicates if the value was AI-generated rather than from user profile
}

export interface ProcessingStatus {
  step: 'idle' | 'analyzing_pdf' | 'mapping_ai' | 'review' | 'filling' | 'completed' | 'error';
  message?: string;
}