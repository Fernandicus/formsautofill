import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, rgb, StandardFonts } from 'pdf-lib';
import { PdfFieldInfo, FieldMapping } from '@/app/shared/types';
import { logger } from '@/app/shared/utils/logger';

const TRUTHY_VALUES = ['true', 'yes', 'checked', 'x', '1', 'on'];
const FALSY_VALUES = ['false', 'no', 'unchecked', '0', 'off'];

/**
 * Helper to get field coordinates
 */
const getFieldRect = (field: any, doc: PDFDocument) => {
  try {
    const widgets = field.acroField.getWidgets();
    if (widgets && widgets.length > 0) {
      const widget = widgets[0];
      const rect = widget.getRectangle();
      
      let pageIndex = 0;
      const pages = doc.getPages();
      const pageRef = widget.P();
      
      if (pageRef) {
        pageIndex = pages.findIndex(p => p.ref === pageRef);
      } else {
        const widgetRef = doc.context.getObjectRef(widget.dict);
        if (widgetRef) {
          const page = doc.findPageForAnnotationRef(widgetRef);
          if (page) {
            pageIndex = pages.findIndex(p => p.ref === page.ref);
          }
        }
      }
      
      if (pageIndex === -1) pageIndex = 0;

      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, pageIndex }; 
    }
  } catch (e) {
    // ignore
  }
  return undefined;
};

export const extractFormFields = async (file: File): Promise<PdfFieldInfo[]> => {
  const arrayBuffer = await file.arrayBuffer();
  logger.info('PDF_SERVICE', 'Extracting fields from PDF document...', { fileName: file.name });
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
      rect: getFieldRect(f, pdfDoc),
      options
    };
  });
};

export const fillPdf = async (file: File, mappings: FieldMapping[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  logger.info('PDF_SERVICE', 'Loading PDF for filling...');
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();
  let fillCount = 0;

  for (const map of mappings) {
    if (!map.userValue) continue;

    try {
      const field = form.getField(map.pdfFieldName);
      
      if (field instanceof PDFTextField) {
        field.setText(map.userValue);
        fillCount++;
      }
      
      else if (field instanceof PDFCheckBox) {
        const val = map.userValue.toLowerCase().trim();
        if (TRUTHY_VALUES.includes(val)) {
          field.check();
          fillCount++;
        } else if (FALSY_VALUES.includes(val)) {
          field.uncheck();
          fillCount++;
        }
      }
      
      else if (field instanceof PDFDropdown || field instanceof PDFRadioGroup) {
        const options = field.getOptions();
        const lowerValue = map.userValue.toLowerCase();
        
        // Try exact match first, then case-insensitive
        if (options.includes(map.userValue)) {
          field.select(map.userValue);
          fillCount++;
        } else {
          const match = options.find(o => o.toLowerCase() === lowerValue);
          if (match) {
            field.select(match);
            fillCount++;
          } else if (field instanceof PDFDropdown) {
            logger.warn('PDF_FILL', `Option "${map.userValue}" not found for dropdown "${map.pdfFieldName}"`);
          }
        }
      }

    } catch (e) {
      logger.warn('PDF_FILL', `Could not fill field ${map.pdfFieldName}`, e);
    }
  }

  logger.info('PDF_SERVICE', `Filled ${fillCount} fields in the document.`);
  return await pdfDoc.save();
};

export const generateMarkedPdfBase64 = async (file: File, fields: PdfFieldInfo[]): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  logger.info('PDF_SERVICE', 'Generating marked PDF...');
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  fields.forEach((field, index) => {
    if (field.rect) {
      const pageIndex = field.rect.pageIndex || 0;
      if (pageIndex < pages.length) {
        const page = pages[pageIndex];
        page.drawText(`[${index}]`, {
          x: field.rect.x,
          y: field.rect.y + field.rect.height / 2, 
          size: 14,
          font: font,
          color: rgb(1, 0, 0),
        });
      }
    }
  });

  const pdfBytes = await pdfDoc.save();
  let binary = '';
  const bytes = new Uint8Array(pdfBytes);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};
