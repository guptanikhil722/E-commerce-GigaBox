/**
 * Pure Form and Checkout Validation Utilities
 */

export interface AddressValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates shipping address fields
 */
export const validateAddress = (
  address: Partial<{
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber?: string;
  }>,
): AddressValidationResult => {
  const errors: Record<string, string> = {};

  if (!address.fullName || address.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  if (!address.street || address.street.trim().length < 5) {
    errors.street = 'Street address must be at least 5 characters';
  }

  if (!address.city || address.city.trim().length < 2) {
    errors.city = 'City must be at least 2 characters';
  }

  if (!address.state || address.state.trim().length < 2) {
    errors.state = 'State is required';
  }

  if (!address.zipCode || !isValidZipCode(address.zipCode)) {
    errors.zipCode = 'Please enter a valid 5-digit ZIP code';
  }

  if (address.phoneNumber && !isValidPhone(address.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid 10-digit phone number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates 5-digit US zip code
 */
export const isValidZipCode = (zip: string): boolean => {
  return /^\d{5}(-\d{4})?$/.test(zip.trim());
};

/**
 * Validates 10-digit phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
};
