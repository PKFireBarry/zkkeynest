import { ApiKey, CreateApiKeyForm, MasterPasswordForm, UnlockVaultForm } from '@/types';

// Validation error types
export enum ValidationError {
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_API_KEY = 'INVALID_API_KEY',
  PASSWORD_TOO_SHORT = 'PASSWORD_TOO_SHORT',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  LABEL_TOO_LONG = 'LABEL_TOO_LONG',
  NOTES_TOO_LONG = 'NOTES_TOO_LONG',
  SERVICE_TOO_LONG = 'SERVICE_TOO_LONG',
  EMAIL_TOO_LONG = 'EMAIL_TOO_LONG',
  API_KEY_TOO_LONG = 'API_KEY_TOO_LONG'
}

// Validation exception class
export class ValidationException extends Error {
  constructor(
    public type: ValidationError,
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationException';
  }
}

// Validation rule types
type ValidationRule = {
  maxLength?: number;
  minLength?: number;
  required: boolean;
};

// Validation rules
const VALIDATION_RULES: Record<string, ValidationRule> = {
  label: {
    maxLength: 100,
    required: true
  },
  service: {
    maxLength: 50,
    required: true
  },
  email: {
    maxLength: 255,
    required: false
  },
  apiKey: {
    maxLength: 1000,
    required: true
  },
  notes: {
    maxLength: 500,
    required: false
  },
  password: {
    minLength: 8,
    required: true
  }
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// API key validation patterns
const API_KEY_PATTERNS = {
  openai: /^sk-[a-zA-Z0-9]{32,}$/,
  github: /^ghp_[a-zA-Z0-9]{36}$/,
  stripe: /^sk_(live|test)_[a-zA-Z0-9]{24}$/,
  aws: /^AKIA[a-zA-Z0-9]{16}$/,
  google: /^[a-zA-Z0-9-_]{24,}$/,
  azure: /^[a-zA-Z0-9]{32,}$/,
  heroku: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
  digitalocean: /^dop_v1_[a-zA-Z0-9]{64}$/,
  vercel: /^[a-zA-Z0-9]{24,}$/,
  netlify: /^[a-zA-Z0-9]{24,}$/,
  other: /^.+$/ // Accept any non-empty string for custom services
};

// Validate email format
export function validateEmail(email: string): boolean {
  if (!email) return true; // Email is optional
  return EMAIL_REGEX.test(email);
}

// Validate API key format based on service
export function validateApiKeyFormat(apiKey: string, service: string): boolean {
  const pattern = API_KEY_PATTERNS[service as keyof typeof API_KEY_PATTERNS] || API_KEY_PATTERNS.other;
  return pattern.test(apiKey);
}

// Validate field length
export function validateFieldLength(value: string, field: keyof typeof VALIDATION_RULES): boolean {
  const rule = VALIDATION_RULES[field];
  return !rule.maxLength || value.length <= rule.maxLength;
}

// Validate required fields
export function validateRequired(value: string, field: keyof typeof VALIDATION_RULES): boolean {
  const rule = VALIDATION_RULES[field];
  return !rule.required || Boolean(value && value.trim().length > 0);
}

// Validate password strength
export function validatePassword(password: string): boolean {
  return password.length >= (VALIDATION_RULES.password.minLength || 8);
}

// Validate CreateApiKeyForm
export function validateCreateApiKeyForm(data: CreateApiKeyForm): void {
  const errors: ValidationException[] = [];

  // Validate required fields
  if (!validateRequired(data.label, 'label')) {
    errors.push(new ValidationException(
      ValidationError.REQUIRED_FIELD,
      'Label is required',
      'label'
    ));
  }

  if (!validateRequired(data.service, 'service')) {
    errors.push(new ValidationException(
      ValidationError.REQUIRED_FIELD,
      'Service is required',
      'service'
    ));
  }

  if (!validateRequired(data.apiKey, 'apiKey')) {
    errors.push(new ValidationException(
      ValidationError.REQUIRED_FIELD,
      'API Key is required',
      'apiKey'
    ));
  }

  // Validate field lengths
  if (!validateFieldLength(data.label, 'label')) {
    errors.push(new ValidationException(
      ValidationError.LABEL_TOO_LONG,
      `Label must be ${VALIDATION_RULES.label.maxLength} characters or less`,
      'label'
    ));
  }

  if (!validateFieldLength(data.service, 'service')) {
    errors.push(new ValidationException(
      ValidationError.SERVICE_TOO_LONG,
      `Service must be ${VALIDATION_RULES.service.maxLength} characters or less`,
      'service'
    ));
  }

  if (data.email && !validateFieldLength(data.email, 'email')) {
    errors.push(new ValidationException(
      ValidationError.EMAIL_TOO_LONG,
      `Email must be ${VALIDATION_RULES.email.maxLength} characters or less`,
      'email'
    ));
  }

  if (!validateFieldLength(data.apiKey, 'apiKey')) {
    errors.push(new ValidationException(
      ValidationError.API_KEY_TOO_LONG,
      `API Key must be ${VALIDATION_RULES.apiKey.maxLength} characters or less`,
      'apiKey'
    ));
  }

  if (data.notes && !validateFieldLength(data.notes, 'notes')) {
    errors.push(new ValidationException(
      ValidationError.NOTES_TOO_LONG,
      `Notes must be ${VALIDATION_RULES.notes.maxLength} characters or less`,
      'notes'
    ));
  }

  // Validate email format
  if (data.email && !validateEmail(data.email)) {
    errors.push(new ValidationException(
      ValidationError.INVALID_EMAIL,
      'Please enter a valid email address',
      'email'
    ));
  }

  // Validate API key format (optional, but helpful)
  if (data.apiKey && data.service && !validateApiKeyFormat(data.apiKey, data.service)) {
    errors.push(new ValidationException(
      ValidationError.INVALID_API_KEY,
      `API key format doesn't match expected pattern for ${data.service}`,
      'apiKey'
    ));
  }

  if (errors.length > 0) {
    throw errors[0]; // Throw the first error
  }
}

// Validate MasterPasswordForm
export function validateMasterPasswordForm(data: MasterPasswordForm): void {
  const errors: ValidationException[] = [];

  if (!validateRequired(data.password, 'password')) {
    errors.push(new ValidationException(
      ValidationError.REQUIRED_FIELD,
      'Password is required',
      'password'
    ));
  }

  if (!validateRequired(data.confirmPassword, 'password')) {
    errors.push(new ValidationException(
      ValidationError.REQUIRED_FIELD,
      'Please confirm your password',
      'confirmPassword'
    ));
  }

  if (!validatePassword(data.password)) {
    errors.push(new ValidationException(
      ValidationError.PASSWORD_TOO_SHORT,
      `Password must be at least ${VALIDATION_RULES.password.minLength} characters`,
      'password'
    ));
  }

  if (data.password !== data.confirmPassword) {
    errors.push(new ValidationException(
      ValidationError.PASSWORD_MISMATCH,
      'Passwords do not match',
      'confirmPassword'
    ));
  }

  if (errors.length > 0) {
    throw errors[0];
  }
}

// Validate UnlockVaultForm
export function validateUnlockVaultForm(data: UnlockVaultForm): void {
  if (!validateRequired(data.password, 'password')) {
    throw new ValidationException(
      ValidationError.REQUIRED_FIELD,
      'Password is required',
      'password'
    );
  }
}

// Sanitize input data
export function sanitizeApiKeyData(data: CreateApiKeyForm): CreateApiKeyForm {
  return {
    label: data.label.trim(),
    service: data.service.trim(),
    email: data.email?.trim() || '',
    apiKey: data.apiKey.trim(),
    notes: data.notes?.trim() || ''
  };
}

// Validate existing ApiKey object
export function validateApiKey(apiKey: ApiKey): void {
  const formData: CreateApiKeyForm = {
    label: apiKey.label,
    service: apiKey.service,
    email: apiKey.email,
    apiKey: 'placeholder', // We don't have the actual key here
    notes: apiKey.notes
  };

  validateCreateApiKeyForm(formData);
}

export interface FeedbackForm {
  type: 'bug' | 'suggestion' | 'other';
  message: string;
  email?: string;
}

export function validateFeedbackForm(data: any): void {
  if (!data.type || !['bug', 'suggestion', 'other'].includes(data.type)) {
    throw new ValidationException(ValidationError.REQUIRED_FIELD, 'Feedback type is required', 'type');
  }
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    throw new ValidationException(ValidationError.REQUIRED_FIELD, 'Message must be at least 10 characters', 'message');
  }
  if (data.email && !validateEmail(data.email)) {
    throw new ValidationException(ValidationError.INVALID_EMAIL, 'Invalid email address', 'email');
  }
  if (data.message.length > 1000) {
    throw new ValidationException(ValidationError.NOTES_TOO_LONG, 'Message is too long', 'message');
  }
} 