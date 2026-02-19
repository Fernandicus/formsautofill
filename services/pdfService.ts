import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';
import { PdfFieldInfo, FieldMapping } from '../types';

export const extractFormFields = async (file: File): Promise<PdfFieldInfo[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  return fields.map(f => {
    let type: PdfFieldInfo['type'] = 'Other';
    
    // Use instanceof for reliable type checking (works better with minified bundles)
    if (f instanceof PDFTextField) type = 'Text';
    else if (f instanceof PDFCheckBox) type = 'CheckBox';
    else if (f instanceof PDFDropdown) type = 'Dropdown';
    else if (f instanceof PDFRadioGroup) type = 'Dropdown'; // Treat radio groups similar to dropdowns (selection)

    return {
      name: f.getName(),
      type
    };
  });
};

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
        // Only select if the exact value exists in options
        if (options.includes(map.userValue)) {
          field.select(map.userValue);
        } else {
            // Optional: Try case-insensitive match? 
            // For now, log warning to avoid crash
            console.warn(`Option "${map.userValue}" not found in dropdown "${map.pdfFieldName}". Available: ${options.join(', ')}`);
        }
      }

      // Handle Radio Groups
      else if (field instanceof PDFRadioGroup) {
         const options = field.getOptions();
         if (options.includes(map.userValue)) {
            field.select(map.userValue);
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
