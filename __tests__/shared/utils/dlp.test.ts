import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockInspectContent, mockGetProjectId } from './__mocks__/dlp';

vi.mock('@google-cloud/dlp', async () => {
  const actualMock = await import('./__mocks__/dlp');
  return {
    DlpServiceClient: actualMock.DlpServiceClient,
  };
});

import { deidentifyText, reidentifyText } from '@/app/shared/utils/dlp';

describe(String('DLP Utilities'), () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    process.env.GOOGLE_PROJECT_ID = 'test-project';
    process.env.GOOGLE_CREDENTIALS_JSON = JSON.stringify({ type: 'service_account' });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('deidentifyText', () => {
    it('should return empty text and empty token map when input is empty', async () => {
      // Arrange
      const text = '';

      // Act
      const result = await deidentifyText(text);

      // Assert
      expect(result.text).toBe('');
      expect(result.tokenMap).toEqual({});
      expect(mockInspectContent).not.toHaveBeenCalled();
    });

    it('should return empty text and empty token map when input is whitespace', async () => {
      // Arrange
      const text = '   ';

      // Act
      const result = await deidentifyText(text);

      // Assert
      expect(result.text).toBe('');
      expect(result.tokenMap).toEqual({});
      expect(mockInspectContent).not.toHaveBeenCalled();
    });

    it('should fall back to returning original text if GOOGLE_PROJECT_ID is not set and getProjectId fails', async () => {
      // Arrange
      delete process.env.GOOGLE_PROJECT_ID;
      delete process.env.GOOGLE_CREDENTIALS_JSON;
      mockGetProjectId.mockRejectedValue(new Error('Failed to resolve project ID'));

      const text = 'Hello John Doe';

      // Act
      const result = await deidentifyText(text);

      // Assert
      expect(result.text).toBe(text);
      expect(result.tokenMap).toEqual({});
    });

    it('should replace findings with sequential tokens and map them in tokenMap', async () => {
      // Arrange
      const text = 'My name is John Doe, email is john@example.com.';

      // Mock finding offsets using codepoints:
      // "My name is " -> 11 characters. "John Doe" is at [11, 19]
      // ", email is " -> 11 characters. "john@example.com" is at [30, 46]
      mockInspectContent.mockResolvedValue([{
        result: {
          findings: [
            {
              quote: 'John Doe',
              infoType: { name: 'PERSON_NAME' },
              location: { codepointRange: { start: 11, end: 19 } },
            },
            {
              quote: 'john@example.com',
              infoType: { name: 'EMAIL_ADDRESS' },
              location: { codepointRange: { start: 30, end: 46 } },
            },
          ],
        },
      }]);

      // Act
      const result = await deidentifyText(text);

      // Assert
      expect(result.text).toBe('My name is [PERSON_NAME_1], email is [EMAIL_ADDRESS_1].');
      expect(result.tokenMap).toEqual({
        '[PERSON_NAME_1]': 'John Doe',
        '[EMAIL_ADDRESS_1]': 'john@example.com',
      });
      expect(mockInspectContent).toHaveBeenCalledTimes(1);
    });

    it('should reuse tokens if the same PII quote is found multiple times', async () => {
      // Arrange
      const text = 'John said hello to John.';

      // "John" at [0, 4] and [19, 23]
      mockInspectContent.mockResolvedValue([{
        result: {
          findings: [
            {
              quote: 'John',
              infoType: { name: 'PERSON_NAME' },
              location: { codepointRange: { start: 0, end: 4 } },
            },
            {
              quote: 'John',
              infoType: { name: 'PERSON_NAME' },
              location: { codepointRange: { start: 19, end: 23 } },
            },
          ],
        },
      }]);

      // Act
      const result = await deidentifyText(text);

      // Assert
      expect(result.text).toBe('[PERSON_NAME_1] said hello to [PERSON_NAME_1].');
      expect(result.tokenMap).toEqual({
        '[PERSON_NAME_1]': 'John',
      });
    });

    it('should handle Unicode characters and emojis safely without shifting offsets', async () => {
      // Arrange
      const text = '👋 John is here';

      // "👋" is a surrogate pair (2 code units, but 1 codepoint).
      // "👋 " is 2 codepoints. "John" is at codepoint [2, 6].
      mockInspectContent.mockResolvedValue([{
        result: {
          findings: [
            {
              quote: 'John',
              infoType: { name: 'PERSON_NAME' },
              location: { codepointRange: { start: 2, end: 6 } },
            },
          ],
        },
      }]);

      // Act
      const result = await deidentifyText(text);

      // Assert
      expect(result.text).toBe('👋 [PERSON_NAME_1] is here');
      expect(result.tokenMap).toEqual({
        '[PERSON_NAME_1]': 'John',
      });
    });
  });

  describe('reidentifyText', () => {
    it('should return empty string when input text is empty', () => {
      // Arrange
      const text = '';
      const tokenMap = { '[PERSON_NAME_1]': 'Alice' };

      // Act
      const result = reidentifyText(text, tokenMap);

      // Assert
      expect(result).toBe('');
    });

    it('should replace tokens with their original values from tokenMap', () => {
      // Arrange
      const text = 'Hello [PERSON_NAME_1]!';
      const tokenMap = { '[PERSON_NAME_1]': 'Alice' };

      // Act
      const result = reidentifyText(text, tokenMap);

      // Assert
      expect(result).toBe('Hello Alice!');
    });

    it('should sort tokens by length descending to prevent partial matches', () => {
      // Arrange
      // If we don't sort descending, [PERSON_NAME_1] could partially match [PERSON_NAME_10]
      const text = 'Hello [PERSON_NAME_10] and [PERSON_NAME_1]';
      const tokenMap = {
        '[PERSON_NAME_1]': 'Alice',
        '[PERSON_NAME_10]': 'Bob',
      };

      // Act
      const result = reidentifyText(text, tokenMap);

      // Assert
      expect(result).toBe('Hello Bob and Alice');
    });
  });
});
