#!/bin/bash

# Fix translation namespace issues
# bookings -> booking
# facilities -> facility

echo "Fixing translation namespaces..."

# Fix bookings -> booking
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s/useTranslation(['\"]bookings['\"])/useTranslation('booking')/g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/useTranslation("bookings")/useTranslation("booking")/g' {} +

# Fix facilities -> facility  
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s/useTranslation(['\"]facilities['\"])/useTranslation('facility')/g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/useTranslation("facilities")/useTranslation("facility")/g' {} +

echo "Done! Fixed translation namespaces."
echo "Running type check..."
npx tsc --noEmit 2>&1 | grep "error TS2820" | wc -l
