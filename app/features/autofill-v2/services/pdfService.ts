import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, rgb, StandardFonts, PDFField } from 'pdf-lib';
import { PdfFieldInfo, FieldMapping } from '@/app/shared/types';
import { logger } from '@/app/shared/utils/logger';

const TRUTHY_VALUES = ['true', 'yes', 'checked', 'x', '1', 'on'];
const FALSY_VALUES = ['false', 'no', 'unchecked', '0', 'off'];

/**
 * Gets the page index for a given PDF widget.
 */
const getWidgetPageIndex = (widget: any, doc: PDFDocument): number => {
  const pages = doc.getPages();
  const pageRef = widget.P();

  if (pageRef) {
    return pages.findIndex(p => p.ref === pageRef);
  }

  const widgetRef = doc.context.getObjectRef(widget.dict);
  if (!widgetRef) return 0;

  const page = doc.findPageForAnnotationRef(widgetRef);
  if (!page) return 0;

  return pages.findIndex(p => p.ref === page.ref);
};

/**
 * Helper to get field coordinates
 */
const getFieldRect = (field: any, doc: PDFDocument) => {
  try {
    const widgets = field.acroField.getWidgets();
    if (!widgets || widgets.length === 0) {
      return undefined;
    }

    const widget = widgets[0];
    const rect = widget.getRectangle();

    let pageIndex = getWidgetPageIndex(widget, doc);
    if (pageIndex === -1) pageIndex = 0;

    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, pageIndex };
  } catch (e) {
    return undefined;
  }
};

const getFieldType = (field: PDFField): PdfFieldInfo['type'] => {
  if (field instanceof PDFTextField) return 'Text';
  if (field instanceof PDFCheckBox) return 'CheckBox';
  if (field instanceof PDFDropdown) return 'Dropdown';
  if (field instanceof PDFRadioGroup) return 'RadioGroup';
  return 'Other';
};

export const extractFormFields = async (file: File): Promise<PdfFieldInfo[]> => {
  const arrayBuffer = await file.arrayBuffer();
  logger.info('PDF_SERVICE', 'Extracting fields from PDF document...', { fileName: file.name });

  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  return fields.map(field => {
    let options: string[] | undefined = undefined;

    if (field instanceof PDFDropdown || field instanceof PDFRadioGroup) {
      try {
        options = field.getOptions();
      } catch (e) {
        // ignore if no options
      }
    }

    return {
      name: field.getName(),
      type: getFieldType(field),
      rect: getFieldRect(field, pdfDoc),
      options
    };
  });
};

const fillTextField = (field: PDFTextField, value: string): boolean => {
  field.setText(value);
  return true;
};

const fillCheckBox = (field: PDFCheckBox, value: string): boolean => {
  const val = value.toLowerCase().trim();
  if (TRUTHY_VALUES.includes(val)) {
    field.check();
    return true;
  }

  if (FALSY_VALUES.includes(val)) {
    field.uncheck();
    return true;
  }

  return false;
};

const fillDropdownOrRadio = (field: PDFDropdown | PDFRadioGroup, value: string, fieldName: string): boolean => {
  const options = field.getOptions();
  const lowerValue = value.toLowerCase();

  if (options.includes(value)) {
    field.select(value);
    return true;
  }

  const match = options.find(o => o.toLowerCase() === lowerValue);
  if (match) {
    field.select(match);
    return true;
  }

  if (field instanceof PDFDropdown) {
    logger.warn('PDF_FILL', `Option "${value}" not found for dropdown "${fieldName}"`);
  }

  return false;
};

const processFieldMapping = (form: any, mapping: FieldMapping): boolean => {
  if (!mapping.userValue) return false;

  try {
    const field = form.getField(mapping.pdfFieldName);

    if (field instanceof PDFTextField) {
      return fillTextField(field, mapping.userValue);
    }

    if (field instanceof PDFCheckBox) {
      return fillCheckBox(field, mapping.userValue);
    }

    if (field instanceof PDFDropdown || field instanceof PDFRadioGroup) {
      return fillDropdownOrRadio(field, mapping.userValue, mapping.pdfFieldName);
    }
  } catch (e) {
    logger.warn('PDF_FILL', `Could not fill field ${mapping.pdfFieldName}`, e);
  }

  return false;
};

export const fillPdf = async (file: File, mappings: FieldMapping[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  logger.info('PDF_SERVICE', 'Loading PDF for filling...');

  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();

  let fillCount = 0;

  for (const map of mappings) {
    const success = processFieldMapping(form, map);
    if (success) fillCount++;
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
    if (!field.rect) return;

    const pageIndex = field.rect.pageIndex || 0;
    if (pageIndex >= pages.length) return;

    const page = pages[pageIndex];
    page.drawText(`[${index}]`, {
      x: field.rect.x,
      y: field.rect.y + field.rect.height / 2,
      size: 14,
      font: font,
      color: rgb(1, 0, 0),
    });
  });

  const pdfBytes = await pdfDoc.save();
  const bytes = new Uint8Array(pdfBytes);

  // Using Array.from for better memory/speed if appropriate, but String.fromCharCode is fine.
  // Actually, for large buffers, spreading into charCode can exceed call stack size.
  // We can use a reduce or loop.
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
};

export const generateMarkdownFromPdf = async (file: File, fields: PdfFieldInfo[]): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  logger.info('PDF_SERVICE', 'Generating Markdown from PDF...');

  // Dynamically import pdfjs-dist to prevent DOMMatrix errors during SSR
  const pdfjsLib = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  
  let markdown = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    interface SpatialItem {
      type: 'text' | 'field';
      text: string;
      x: number;
      y: number;
    }
    
    const items: SpatialItem[] = [];

    // 1. Add text items
    for (const item of textContent.items) {
      if ('str' in item) {
        items.push({
          type: 'text',
          text: item.str,
          x: item.transform[4],
          y: item.transform[5]
        });
      }
    }

    // 2. Add field markers for this page
    fields.forEach((field, index) => {
      if (field.rect && (field.rect.pageIndex || 0) === pageNum - 1) {
        items.push({
          type: 'field',
          text: `[${index}]`,
          x: field.rect.x,
          y: field.rect.y
        });
      }
    });

    // 3. Sort items: top-to-bottom (descending y), then left-to-right (ascending x)
    items.sort((a, b) => {
      if (Math.abs(a.y - b.y) > 5) {
        return b.y - a.y; // Descending y
      }
      return a.x - b.x; // Ascending x
    });

    // 4. Build text block
    let lastY: number | null = null;
    for (const item of items) {
      if (lastY !== null && Math.abs(item.y - lastY) > 5) {
        markdown += '\n'; // New line
      } else if (lastY !== null && item.type === 'field') {
        markdown += ' '; // Space before field marker
      }
      markdown += item.text;
      
      if (item.type === 'field') {
         markdown += ' '; // Space after field marker
      }
      
      lastY = item.y;
    }
    markdown += '\n\n---\n\n';
  }

  return markdown;
};

