/**
 * Contact Utilities
 *
 * Utilities for parsing and formatting contact information from facility descriptions.
 */

interface ContactInfo {
  readonly email: string;
  readonly phone: string;
}

/**
 * Extract contact information from facility description or separate fields
 * 
 * @param description - The facility description that may contain contact info
 * @param contactEmail - The contact email from separate field (optional)
 * @param contactPhone - The contact phone from separate field (optional)
 * @returns ContactInfo object with email and phone
 */
export const extractContactInfo = (
  description: string | null | undefined, 
  contactEmail?: string | null, 
  contactPhone?: string | null
): ContactInfo => {
  // Default contact information
  const defaultContact: ContactInfo = {
    email: 'kontakt@bookme.no',
    phone: '+47 123 45 678'
  };

  // If we have separate contact fields, use them
  if (contactEmail || contactPhone) {
    return {
      email: contactEmail || defaultContact.email,
      phone: contactPhone || defaultContact.phone
    };
  }

  // Fallback to extracting from description
  if (!description) {
    return defaultContact;
  }

  // Look for email pattern (simple pattern matching)
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = description.match(emailPattern);
  const email = emailMatch ? emailMatch[0] : defaultContact.email;

  // Look for phone pattern (Norwegian phone numbers)
  const phonePattern = /(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/;
  const phoneMatch = description.match(phonePattern);
  const phone = phoneMatch ? phoneMatch[0] : defaultContact.phone;

  return {
    email,
    phone
  };
};

/**
 * Format contact information for display
 * 
 * @param contactInfo - The contact information to format
 * @returns Formatted contact information
 */
export const formatContactInfo = (contactInfo: ContactInfo): ContactInfo => {
  // If phone is empty, return as is
  if (!contactInfo.phone) {
    return contactInfo;
  }

  // Ensure phone number is formatted consistently
  let formattedPhone = contactInfo.phone;
  
  // Remove any existing spaces and format as +47 XX XX XX XX
  const digitsOnly = contactInfo.phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 8) {
    // Assume Norwegian number without country code
    formattedPhone = `+47 ${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2, 4)} ${digitsOnly.substring(4, 6)} ${digitsOnly.substring(6, 8)}`;
  } else if (digitsOnly.length === 10 && digitsOnly.startsWith('47')) {
    // Norwegian number with country code without +
    formattedPhone = `+${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2, 4)} ${digitsOnly.substring(4, 6)} ${digitsOnly.substring(6, 8)} ${digitsOnly.substring(8, 10)}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('47')) {
    // Norwegian number with + and country code
    formattedPhone = `+${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2, 4)} ${digitsOnly.substring(4, 6)} ${digitsOnly.substring(6, 8)} ${digitsOnly.substring(8, 10)}`;
  }

  return {
    email: contactInfo.email,
    phone: formattedPhone
  };
};

/**
 * Clean facility description by removing contact information
 * 
 * @param description - The original facility description
 * @returns Cleaned description without contact information
 */
export const cleanDescription = (description: string): string => {
  // Remove any existing contact information from the description
  let cleanDescription = description || '';
  
  // Remove email patterns
  cleanDescription = cleanDescription.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/g, '');
  
  // Remove phone patterns
  cleanDescription = cleanDescription.replace(/(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/g, '');
  
  // Remove any "Contact:" text that might be left
  cleanDescription = cleanDescription.replace(/Contact:\s*[,]*\s*/g, '');
  
  // Clean up extra whitespace
  cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();
  
  // Remove trailing periods and commas
  cleanDescription = cleanDescription.replace(/[.,\s]+$/, '');
  
  return cleanDescription;
};

/**
 * Update facility description with contact information (deprecated)
 * 
 * @deprecated Use cleanDescription instead to keep contact info separate
 * @param description - The original facility description
 * @param email - The contact email
 * @param phone - The contact phone
 * @returns Updated description with contact information
 */
export const updateDescriptionWithContact = (description: string, email: string, phone: string): string => {
  // Remove any existing contact information from the description
  let cleanDescription = description || '';
  
  // Remove email patterns
  cleanDescription = cleanDescription.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/g, '');
  
  // Remove phone patterns
  cleanDescription = cleanDescription.replace(/(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/g, '');
  
  // Remove any "Contact:" text that might be left
  cleanDescription = cleanDescription.replace(/Contact:\s*[,]*\s*/g, '');
  
  // Clean up extra whitespace
  cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();
  
  // Remove trailing periods and commas
  cleanDescription = cleanDescription.replace(/[.,\s]+$/, '');
  
  // Add contact information at the end
  if (email || phone) {
    if (cleanDescription) {
      cleanDescription += '. ';
    }
    cleanDescription += `Contact: ${email || 'N/A'}, ${phone || 'N/A'}`;
  }
  
  return cleanDescription;
};
