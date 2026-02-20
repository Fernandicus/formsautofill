import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFName } from 'pdf-lib';
import { PdfFieldInfo, FieldMapping } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// Helper to get coordinates
const getFieldRect = (field: any, doc: PDFDocument) => {
  try {
    const widgets = field.acroField.getWidgets();
    if (widgets && widgets.length > 0) {
      const rect = widgets[0].getRectangle();
      // Find which page this widget belongs to
      // This is expensive if we iterate all pages. 
      // For now, let's assume we just want the rect and we'll tell Gemini "Page X" if we can find it.
      // pdf-lib doesn't easily give page index from widget.
      // We'll return the rect and hope Gemini can figure it out or we just send the rect context.
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, pageIndex: 0 }; 
    }
  } catch (e) {
    // ignore
  }
  return undefined;
};

export const extractFormFields = async (file: File): Promise<PdfFieldInfo[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  const extractedFields: PdfFieldInfo[] = fields.map(f => {
    let type: PdfFieldInfo['type'] = 'Other';
    
    if (f instanceof PDFTextField) type = 'Text';
    else if (f instanceof PDFCheckBox) type = 'CheckBox';
    else if (f instanceof PDFDropdown) type = 'Dropdown';
    else if (f instanceof PDFRadioGroup) type = 'Dropdown';

    let options: string[] | undefined = undefined;
    if (f instanceof PDFDropdown || f instanceof PDFRadioGroup) {
        try {
            options = f.getOptions();
        } catch (e) {
            // ignore if no options
        }
    }

    return {
      name: f.getName(),
      type,
      rect: getFieldRect(f, pdfDoc),
      options
    };
  });

  // Now enrich with labels using Gemini
  // OPTIMIZATION: We now do visual mapping in the main mapping step, so we skip this separate enrichment step
  // to save time and API calls. The main mapping step will return visual labels.
  return extractedFields;
};

// Removed enrichFieldsWithLabels function as it is no longer needed


export const fillPdf = async (file: File, mappings: FieldMapping[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();

  for (const map of mappings) {
    if (!map.userValue) continue;

    try {
      // Get the field by exact name
      const field = form.getField(map.pdfFieldName);
      
      // Handle Text Fields
      if (field instanceof PDFTextField) {
        field.setText(map.userValue);
      }
      
      // Handle Checkboxes
      else if (field instanceof PDFCheckBox) {
        const val = map.userValue.toLowerCase().trim();
        // Broaden the truthy checks
        if (['true', 'yes', 'checked', 'x', '1', 'on'].includes(val)) {
          field.check();
        } else if (['false', 'no', 'unchecked', '0', 'off'].includes(val)) {
            field.uncheck();
        }
      }
      
      // Handle Dropdowns
      else if (field instanceof PDFDropdown) {
        const options = field.getOptions();
        // Try exact match
        if (options.includes(map.userValue)) {
          field.select(map.userValue);
        } else {
            // Try case-insensitive match
            const lowerValue = map.userValue.toLowerCase();
            const match = options.find(o => o.toLowerCase() === lowerValue);
            if (match) {
                field.select(match);
            } else {
                console.warn(`Option "${map.userValue}" not found in dropdown "${map.pdfFieldName}". Available: ${options.join(', ')}`);
            }
        }
      }

      // Handle Radio Groups
      else if (field instanceof PDFRadioGroup) {
         const options = field.getOptions();
         if (options.includes(map.userValue)) {
            field.select(map.userValue);
         } else {
            // Try case-insensitive match
            const lowerValue = map.userValue.toLowerCase();
            const match = options.find(o => o.toLowerCase() === lowerValue);
            if (match) {
                field.select(match);
            }
         }
      }

    } catch (e) {
      console.warn(`Could not fill field ${map.pdfFieldName}:`, e);
    }
  }

  // Saving usually updates appearances, but for some viewers, fields might appear empty until clicked 
  // if the font is not standard. pdf-lib handles standard fonts well. 
  // We return the bytes.
  return await pdfDoc.save();
};
