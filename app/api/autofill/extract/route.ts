import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { UserField } from "@/app/shared/types";
import { logger } from "@/app/shared/utils/logger";
import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { deidentifyText, reidentifyText } from '@/app/shared/utils/dlp';

const GEMINI_MODEL = 'gemini-3-flash-preview';

const getStorageClient = () => {
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  const projectId = process.env.GOOGLE_PROJECT_ID;
  if (credentialsJson) {
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch {
      credentials = JSON.parse(Buffer.from(credentialsJson, 'base64').toString('utf-8'));
    }
    return new Storage({ credentials, projectId });
  }
  return new Storage();
};

const getVisionClient = () => {
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  const projectId = process.env.GOOGLE_PROJECT_ID;
  if (credentialsJson) {
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch {
      credentials = JSON.parse(Buffer.from(credentialsJson, 'base64').toString('utf-8'));
    }
    return new ImageAnnotatorClient({ credentials, projectId });
  }
  return new ImageAnnotatorClient();
};

const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

const parseGcsUri = (gcsUri: string): { bucket: string, key: string } => {
  const match = gcsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid GCS URI: ${gcsUri}`);
  }
  return {
    bucket: match[1],
    key: match[2]
  };
};

const deleteFileFromGcs = async (gcsUri: string): Promise<void> => {
  const storage = getStorageClient();
  const { bucket, key } = parseGcsUri(gcsUri);
  await storage.bucket(bucket).file(key).delete();
};

const extractTextFromImageGcs = async (gcsUri: string): Promise<string> => {
  const vision = getVisionClient();
  const [result] = await vision.textDetection(gcsUri);
  const text = result.fullTextAnnotation?.text || '';
  return text;
};

const extractTextFromPdfGcs = async (gcsUri: string): Promise<string> => {
  const vision = getVisionClient();
  const request = {
    requests: [
      {
        inputConfig: {
          gcsSource: { uri: gcsUri },
          mimeType: 'application/pdf',
        },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        pages: [1, 2, 3, 4, 5], // Annotate up to 5 pages
      },
    ],
  };

  const [response] = await vision.batchAnnotateFiles(request as any);
  const responses = response.responses || [];
  let fullText = '';
  
  for (const resp of responses) {
    const pages = resp.responses || [];
    for (const pageResp of pages) {
      if (pageResp.fullTextAnnotation?.text) {
        fullText += pageResp.fullTextAnnotation.text + '\n';
      }
    }
  }

  return fullText;
};

const extractTextFromPdfBuffer = async (buffer: ArrayBuffer): Promise<string> => {
  const pdfjsLib = await import('pdfjs-dist');
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  let text = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    text += pageText + '\n';
  }

  return text;
};

const buildExtractionPrompt = (): string => {
  return `
    Analyze this document text and extract all relevant data fields that would be useful for filling forms.
    Focus on extracting specific values like:
    - Personal Information (Name, Address, DOB, Phone, Email, etc.)
    - Identification Numbers (Passport, Driver's License, SSN, DNI, NIE, tax IDs, etc.)
    - Financial or Employment Data if present.
    - Vehicle information if present.
    
    Do not extract long paragraphs. Extract concise Key-Value pairs.
    Return the output as a JSON List of objects with 'key' and 'value' properties.
  `;
};

const parseExtractionResponse = (rawText: string): UserField[] => {
  const data = JSON.parse(rawText) as { key: string, value: string }[];
  logger.info('DOCUMENT_SCRAPING', `Extracted ${data.length} fields from document.`);

  return data.map(item => ({
    id: crypto.randomUUID(),
    key: item.key,
    value: item.value
  }));
};

export async function POST(request: Request) {
  let requestGcsUri: string | null = null;
  try {
    const body = await request.json();
    const { gcsUri, mimeType } = body;

    if (!gcsUri || !mimeType) {
      return NextResponse.json(
        { error: 'Missing gcsUri or mimeType' },
        { status: 400 }
      );
    }

    requestGcsUri = gcsUri;
    logger.info('DOCUMENT_SCRAPING', `Starting server-side extraction for ${gcsUri} (${mimeType})`);

    let rawText = '';
    const startTime = performance.now();

    // 1. Extract text depending on file type
    if (mimeType.startsWith('image/')) {
      logger.info('DOCUMENT_SCRAPING', `Running Vision OCR on image: ${gcsUri}`);
      rawText = await extractTextFromImageGcs(gcsUri);
    } else if (mimeType === 'application/pdf') {
      // Try digital PDF extraction first using pdfjs-dist
      try {
        logger.info('DOCUMENT_SCRAPING', `Downloading PDF from GCS for digital text extraction...`);
        const { bucket, key } = parseGcsUri(gcsUri);
        const storage = getStorageClient();
        const [buffer] = await storage.bucket(bucket).file(key).download();
        
        logger.info('DOCUMENT_SCRAPING', `Running pdfjs-dist on downloaded buffer...`);
        rawText = await extractTextFromPdfBuffer(buffer);
      } catch (err) {
        logger.error('DOCUMENT_SCRAPING', 'pdfjs-dist digital text extraction failed, will fallback to Vision OCR', err);
      }

      // If no text was found (scanned PDF), use Vision API
      if (!rawText || rawText.trim().length < 50) {
        logger.info('DOCUMENT_SCRAPING', `PDF has no selectable text. Running Vision OCR on scanned PDF: ${gcsUri}`);
        rawText = await extractTextFromPdfGcs(gcsUri);
      }
    } else {
      return NextResponse.json(
        { error: `Unsupported MIME type: ${mimeType}` },
        { status: 400 }
      );
    }

    if (!rawText || rawText.trim() === '') {
      throw new Error('No text could be extracted from the document.');
    }

    logger.info('DOCUMENT_SCRAPING', `Extracted raw text length: ${rawText.length} characters`);

    // 2. DLP Tokenization (De-identification)
    logger.info('DLP', 'De-identifying extracted text...');
    const { text: deidentifiedText, tokenMap } = await deidentifyText(rawText);
    logger.info('DLP', `Text de-identified. Found ${Object.keys(tokenMap).length} PII tokens.`);

    // 3. Gemini LLM extraction on de-identified text
    const ai = getGeminiClient();
    const prompt = buildExtractionPrompt();

    logger.info('GEMINI_API', 'Sending de-identified data to Gemini for extraction...');
    const geminiStartTime = performance.now();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: `Document content:\n${deidentifiedText}\n\n${prompt}` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING },
              value: { type: Type.STRING }
            }
          }
        }
      }
    });

    const geminiEndTime = performance.now();
    logger.info('GEMINI_API', `Received response from Gemini in ${(geminiEndTime - geminiStartTime).toFixed(2)}ms`);

    const rawGeminiText = response.text || "[]";
    const parsedFields = parseExtractionResponse(rawGeminiText);

    // 4. DLP Re-identification (detokenization)
    logger.info('DLP', 'Re-identifying (detokenizing) Gemini extracted values...');
    const restoredFields = parsedFields.map(field => ({
      ...field,
      value: reidentifyText(field.value, tokenMap)
    }));

    const totalTime = performance.now() - startTime;
    logger.info('DOCUMENT_SCRAPING', `Finished entire server-side extraction pipeline in ${totalTime.toFixed(2)}ms`);

    return NextResponse.json({ fields: restoredFields });
  } catch (error) {
    logger.error('DOCUMENT_SCRAPING', 'Error in extraction route handler', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    // 5. Always delete the temporary upload file from GCS
    if (requestGcsUri) {
      try {
        logger.info('DOCUMENT_SCRAPING', `Cleaning up uploaded file from GCS: ${requestGcsUri}`);
        await deleteFileFromGcs(requestGcsUri);
      } catch (err) {
        logger.error('DOCUMENT_SCRAPING', `Failed to delete GCS temp file ${requestGcsUri}`, err);
      }
    }
  }
}
