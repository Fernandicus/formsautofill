import { describe, it, expect } from 'vitest';

// Simple form fill helper for the demonstration
class FormAutofiller {
  autofill(form: HTMLElement, data: Record<string, string>) {
    let filledCount = 0;
    for (const [key, value] of Object.entries(data)) {
      const input = form.querySelector(`#${key}`) as HTMLInputElement;
      if (input) {
        input.value = value;
        filledCount++;
      }
    }
    return { filledCount };
  }
}

// Helper to create dummy form elements in Vitest (simulated DOM environment)
function createMockFormHTML(): HTMLElement {
  const form = document.createElement('form');
  const firstInput = document.createElement('input');
  firstInput.id = 'firstName';
  const lastInput = document.createElement('input');
  lastInput.id = 'lastName';
  form.appendChild(firstInput);
  form.appendChild(lastInput);
  return form;
}

describe('FormAutofiller', () => {
  it('should auto-populate matching input fields with extracted values', () => {
    // 1. Arrange
    const autofiller = new FormAutofiller();
    const extractedData = { firstName: 'Alice', lastName: 'Smith' };
    const mockForm = createMockFormHTML();

    // 2. Act
    const result = autofiller.autofill(mockForm, extractedData);

    // 3. Assert
    expect(result.filledCount).toBe(2);
    expect((mockForm.querySelector('#firstName') as HTMLInputElement).value).toBe('Alice');
    expect((mockForm.querySelector('#lastName') as HTMLInputElement).value).toBe('Smith');
  });
});
