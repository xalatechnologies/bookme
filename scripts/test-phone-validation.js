/**
 * Test script to verify phone number validation patterns
 */

// Test phone number patterns
const testPhoneNumbers = [
  '+47 12 34 56 78',  // Valid format 1
  '47 12 34 56 78',   // Valid format 2
  '12 34 56 78',      // Valid format 3
  '12345678',         // Valid format 4
  '',                 // Empty string
  null,               // NULL value
  'invalid',          // Invalid format
  '123',              // Too short
  '123456789012345',  // Too long
];

// Test regex patterns
const phonePattern1 = /^(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/;
const phonePattern2 = /^\d{8}$/;
const phonePattern3 = /^47\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/;

console.log('Testing phone number validation patterns:');
console.log('=====================================');

testPhoneNumbers.forEach((phone, index) => {
  // Handle null case
  if (phone === null) {
    console.log(`${index + 1}. NULL: 
       Pattern 1 (^(\+47\\s?)?\\d{2}\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}$): ${phonePattern1.test('')}
       Pattern 2 (^\\d{8}$): ${phonePattern2.test('')}
       Pattern 3 (^47\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}$): ${phonePattern3.test('')}
       Valid: ${phone === null || phone === '' || phonePattern1.test(phone) || phonePattern2.test(phone) || phonePattern3.test(phone)}`);
    return;
  }
  
  console.log(`${index + 1}. "${phone}":
       Pattern 1 (^(\+47\\s?)?\\d{2}\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}$): ${phonePattern1.test(phone)}
       Pattern 2 (^\\d{8}$): ${phonePattern2.test(phone)}
       Pattern 3 (^47\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}$): ${phonePattern3.test(phone)}
       Valid: ${phone === '' || phonePattern1.test(phone) || phonePattern2.test(phone) || phonePattern3.test(phone)}`);
});

console.log('\n✅ Test completed!');