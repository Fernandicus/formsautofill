/**
 * A simple utility for consistent application logging
 */
const IS_DEV = import.meta.env.DEV;

export const logger = {
  info: (step: string, message: string, data?: any) => {
    if (!IS_DEV) return;
    const timestamp = new Date().toLocaleTimeString();
    console.log(
      `%c[FormsAutofill] %c${timestamp} %c[${step}] %c${message}`,
      'color: #3b82f6; font-weight: bold;',
      'color: #6b7280;',
      'color: #10b981; font-weight: bold;',
      'color: inherit;',
      data ? data : ''
    );
  },

  warn: (step: string, message: string, data?: any) => {
    if (!IS_DEV) return;
    const timestamp = new Date().toLocaleTimeString();
    console.warn(
      `%c[FormsAutofill] %c${timestamp} %c[${step}] %c${message}`,
      'color: #3b82f6; font-weight: bold;',
      'color: #6b7280;',
      'color: #f59e0b; font-weight: bold;',
      'color: inherit;',
      data ? data : ''
    );
  },

  error: (step: string, message: string, data?: any) => {
    // We keep error logs in production to help debug critical issues
    const timestamp = new Date().toLocaleTimeString();
    console.error(
      `%c[FormsAutofill] %c${timestamp} %c[${step}] %c${message}`,
      'color: #3b82f6; font-weight: bold;',
      'color: #6b7280;',
      'color: #ef4444; font-weight: bold;',
      'color: inherit;',
      data ? data : ''
    );
  }
};
