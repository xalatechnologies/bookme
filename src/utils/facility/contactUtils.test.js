// Simple test script for contact utilities
const fs = require('fs');
const path = require('path');

// Mock implementation of the contact utilities functions
function extractContactInfo(description) {
  // Default contact information
  const defaultContact = {
    email: 'kontakt@booknor.no',
    phone: '+47 123 45 678'
  };

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
}

function formatContactInfo(contactInfo) {
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
}

function updateDescriptionWithContact(description, email, phone) {
  // Remove any existing contact information from the description
  let cleanDescription = description || '';
  
  // Remove email patterns
  cleanDescription = cleanDescription.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
  
  // Remove phone patterns
  cleanDescription = cleanDescription.replace(/(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/g, '');
  
  // Clean up extra whitespace
  cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();
  
  // Add contact information at the end
  if (email || phone) {
    if (cleanDescription) {
      cleanDescription += '. ';
    }
    cleanDescription += `Contact: ${email}, ${phone}`;
  }
  
  return cleanDescription;
}

// Test cases
console.log('Testing contact utilities...');

// Test extractContactInfo
console.log('\n1. Testing extractContactInfo:');
const testDescription = 'This is a test facility. Contact: test@example.com, +47 123 45 678';
const contactInfo = extractContactInfo(testDescription);
console.log('Input:', testDescription);
console.log('Extracted contact info:', contactInfo);

// Test formatContactInfo
console.log('\n2. Testing formatContactInfo:');
const formattedContact = formatContactInfo(contactInfo);
console.log('Input:', contactInfo);
console.log('Formatted contact info:', formattedContact);

// Test updateDescriptionWithContact
console.log('\n3. Testing updateDescriptionWithContact:');
const updatedDescription = updateDescriptionWithContact('Original description', 'new@example.com', '+47 987 65 432');
console.log('Input: "Original description", "new@example.com", "+47 987 65 432"');
console.log('Updated description:', updatedDescription);

// Test with empty description
console.log('\n4. Testing with empty description:');
const emptyContact = extractContactInfo('');
console.log('Input: ""');
console.log('Result:', emptyContact);

console.log('\nAll tests completed!');