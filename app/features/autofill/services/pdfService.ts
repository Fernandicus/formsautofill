import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';
import { PdfFieldInfo, FieldMapping } from '@/app/shared/types';

const TRUTHY_VALUES = ['true', 'yes', 'checked', 'x', '1', 'on'];
const FALSY_VALUES = ['false', 'no', 'unchecked', '0', 'off'];

/**
 * Helper to get field coordinates
 */
const getFieldRect = (field: any) => {
  try {
    const widgets = field.acroField.getWidgets();
    if (widgets && widgets.length > 0) {
      const rect = widgets[0].getRectangle();
      // Find which page this widget belongs to
      // This is expensive if we iterate all pages. 
      // For now, let's assume page 0 or handle page context if needed.
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

  return fields.map(f => {
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
      rect: getFieldRect(f),
      options
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
      const field = form.getField(map.pdfFieldName);
      
      if (field instanceof PDFTextField) {
        field.setText(map.userValue);
      }
      
      else if (field instanceof PDFCheckBox) {
        const val = map.userValue.toLowerCase().trim();
        if (TRUTHY_VALUES.includes(val)) {
          field.check();
        } else if (FALSY_VALUES.includes(val)) {
          field.uncheck();
        }
      }
      
      else if (field instanceof PDFDropdown || field instanceof PDFRadioGroup) {
        const options = field.getOptions();
        const lowerValue = map.userValue.toLowerCase();
        
        // Try exact match first, then case-insensitive
        if (options.includes(map.userValue)) {
          field.select(map.userValue);
        } else {
          const match = options.find(o => o.toLowerCase() === lowerValue);
          if (match) {
            field.select(match);
          } else if (field instanceof PDFDropdown) {
            console.warn(`Option "${map.userValue}" not found in dropdown "${map.pdfFieldName}"`);
          }
        }
      }

    } catch (e) {
      console.warn(`Could not fill field ${map.pdfFieldName}:`, e);
    }
  }

  return await pdfDoc.save();
};
