import { DlpServiceClient } from '@google-cloud/dlp';

const getDlpClient = () => {
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  const projectId = process.env.GOOGLE_PROJECT_ID;
  if (credentialsJson) {
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch {
      credentials = JSON.parse(Buffer.from(credentialsJson, 'base64').toString('utf-8'));
    }
    return new DlpServiceClient({ credentials, projectId });
  }
  return new DlpServiceClient();
};

export interface TokenizedResult {
  text: string;
  tokenMap: Record<string, string>;
}

// Comprehensive set of global & European InfoTypes
const INFO_TYPES = [
  // General PII
  { name: 'PERSON_NAME' },
  { name: 'EMAIL_ADDRESS' },
  { name: 'PHONE_NUMBER' },
  { name: 'STREET_ADDRESS' },
  { name: 'DATE_OF_BIRTH' },
  { name: 'AGE' },
  { name: 'GENDER' },
  { name: 'IP_ADDRESS' },
  
  // Financial PII
  { name: 'CREDIT_CARD_NUMBER' },
  { name: 'IBAN_CODE' },
  { name: 'SWIFT_CODE' },
  { name: 'BANK_ACCOUNT_NUMBER' },
  
  // Global/European Identity Documents
  { name: 'PASSPORT' },
  
  // Spain
  { name: 'SPAIN_DNI' },
  { name: 'SPAIN_NIE' },
  { name: 'SPAIN_NIF' },
  { name: 'SPAIN_SSN' },
  { name: 'SPAIN_PASSPORT' },
  
  // France
  { name: 'FRANCE_CNI' },
  { name: 'FRANCE_NIR' },
  { name: 'FRANCE_PASSPORT' },
  { name: 'FRANCE_TAX_IDENTIFICATION_NUMBER' },
  
  // Germany
  { name: 'GERMANY_IDENTITY_CARD_NUMBER' },
  { name: 'GERMANY_PASSPORT_NUMBER' },
  { name: 'GERMANY_TAX_IDENTIFICATION_NUMBER' },
  
  // Italy
  { name: 'ITALY_FISCAL_CODE' },
  
  // Netherlands
  { name: 'NETHERLANDS_BSN' },
  
  // United Kingdom
  { name: 'UK_NATIONAL_INSURANCE_NUMBER' },
  { name: 'UK_PASSPORT' },
  { name: 'UK_TAXPAYER_REFERENCE' },
  
  // Other European Countries
  { name: 'IRELAND_PPSN' },
  { name: 'PORTUGAL_NIF' },
  { name: 'BELGIUM_NATIONAL_NUMBER' },
  { name: 'SWEDEN_NATIONAL_ID_NUMBER' },
  { name: 'FINLAND_NATIONAL_ID_NUMBER' },
  { name: 'DENMARK_CPR_NUMBER' },
  { name: 'NORWAY_NATIONAL_IDENTIFICATION_NUMBER' },
  { name: 'POLAND_PESEL' },
  
  // North America
  { name: 'US_SOCIAL_SECURITY_NUMBER' },
  { name: 'US_PASSPORT' },
  { name: 'CANADA_SIN' }
];

export const deidentifyText = async (text: string): Promise<TokenizedResult> => {
  if (!text || text.trim() === '') {
    return { text: '', tokenMap: {} };
  }

  try {
    const dlp = getDlpClient();
    const projectId = process.env.GOOGLE_PROJECT_ID || await dlp.getProjectId();

    if (!projectId) {
      console.warn('GOOGLE_PROJECT_ID env var is not set. DLP might not initialize correctly.');
      return { text, tokenMap: {} };
    }

    const [response] = await dlp.inspectContent({
      parent: `projects/${projectId}/locations/global`,
      inspectConfig: {
        infoTypes: INFO_TYPES,
        includeQuote: true,
      },
      item: { value: text },
    });

    const findings = response.result?.findings || [];
    
    // Sort findings by start offset descending to replace from end to start without affecting offsets
    const sortedFindings = [...findings].sort((a, b) => {
      const aStart = Number(a.location?.codepointRange?.start || 0);
      const bStart = Number(b.location?.codepointRange?.start || 0);
      return bStart - aStart;
    });

    const tokenMap: Record<string, string> = {};
    const counters: Record<string, number> = {};
    let deidentifiedText = text;

    for (const finding of sortedFindings) {
      const quote = finding.quote;
      const infoTypeName = finding.infoType?.name;
      if (!quote || !infoTypeName) continue;

      const start = Number(finding.location?.codepointRange?.start || 0);
      const end = Number(finding.location?.codepointRange?.end || 0);

      // Create or reuse a unique token, e.g. [PERSON_NAME_1]
      let token = Object.keys(tokenMap).find(t => tokenMap[t] === quote);
      if (!token) {
        if (!counters[infoTypeName]) {
          counters[infoTypeName] = 1;
        }
        token = `[${infoTypeName}_${counters[infoTypeName]++}]`;
        tokenMap[token] = quote;
      }

      // Replace in text using codepoint offsets (safe for Unicode/surrogate pairs)
      const chars = Array.from(deidentifiedText);
      deidentifiedText = chars.slice(0, start).join('') + token + chars.slice(end).join('');
    }

    return { text: deidentifiedText, tokenMap };
  } catch (err) {
    console.error('DLP inspection failed, falling back to original text:', err);
    return { text, tokenMap: {} };
  }
};

export const reidentifyText = (text: string, tokenMap: Record<string, string>): string => {
  if (!text) return '';
  let result = text;
  
  // Sort tokens by length descending to avoid partial matches
  const sortedTokens = Object.keys(tokenMap).sort((a, b) => b.length - a.length);
  for (const token of sortedTokens) {
    const originalValue = tokenMap[token];
    result = result.replaceAll(token, originalValue);
  }
  return result;
};
