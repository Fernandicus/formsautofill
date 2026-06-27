// ============================================================================
// Bug Fix Example: GREEN (Passing Implementation)
// ============================================================================

interface FormData {
  email?: string;
  // other fields...
}

function submitForm(data: FormData) {
  // Simplest code added to satisfy the failing test
  if (!data.email?.trim()) {
    return { error: 'Email required' };
  }
  
  // Existing logic...
  return { success: true };
}
