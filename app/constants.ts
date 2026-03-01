import { DataGroup } from "../types";

export const INITIAL_DATA_GROUPS: DataGroup[] = [
  {
    id: 'default',
    name: 'Your Data Profile',
    isExpanded: true,
    fields: [
      { id: '1', key: 'Full Name', value: 'Jane Doe' },
      { id: '2', key: 'Email', value: 'jane.doe@example.com' },
      { id: '3', key: 'Phone', value: '+1 (555) 123-4567' },
      { id: '4', key: 'Address', value: '123 Tech Avenue, Silicon Valley, CA' },
    ]
  }
];

export const PLACEHOLDER_KEYS = [
  "Job Title",
  "Date of Birth",
  "Nationality",
  "Emergency Contact",
];