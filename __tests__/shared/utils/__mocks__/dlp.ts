import { vi } from 'vitest';

export const mockInspectContent = vi.fn();
export const mockGetProjectId = vi.fn();

export class DlpServiceClient {
  inspectContent = mockInspectContent;
  getProjectId = mockGetProjectId;
}
