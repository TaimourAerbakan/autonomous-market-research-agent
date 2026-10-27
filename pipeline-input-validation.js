const MIN_SUBJECT_LENGTH = 2;
const MAX_SUBJECT_LENGTH = 160;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

/**
 * Validate untrusted subject input for the research pipeline.
 * Returns { valid: true, subject } or { valid: false, error }.
 */
export function validatePipelineSubject(value) {
  if (typeof value !== "string") {
    return { valid: false, error: "Subject must be a string." };
  }

  const subject = value.trim();

  if (subject.length < MIN_SUBJECT_LENGTH) {
    return { valid: false, error: "Subject must contain at least 2 characters." };
  }

  if (subject.length > MAX_SUBJECT_LENGTH) {
    return { valid: false, error: `Subject must be no more than ${MAX_SUBJECT_LENGTH} characters.` };
  }

  if (CONTROL_CHARACTERS.test(subject)) {
    return { valid: false, error: "Subject must not contain control characters." };
  }

  return { valid: true, subject };
}
