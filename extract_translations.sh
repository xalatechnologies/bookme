#!/bin/bash

# Extract all translation keys from source files
echo "Extracting translation keys from source files..."

# Find all t('namespace:key') patterns
grep -roh "t(['\"][a-zA-Z_][^'\"]*:[^'\"]*['\"])" src/ --include="*.tsx" --include="*.ts" | \
  sed "s/t(['\"]//g" | \
  sed "s/['\"])//g" | \
  sort -u > /tmp/translation_keys_with_namespace.txt

# Find all t('key') patterns without namespace (using default namespace)
grep -roh "t(['\"][a-zA-Z_][^':\"]*['\"])" src/ --include="*.tsx" --include="*.ts" | \
  grep -v ":" | \
  sed "s/t(['\"]//g" | \
  sed "s/['\"])//g" | \
  grep -v "^\s*$" | \
  grep -v "^[^a-zA-Z]" | \
  sort -u > /tmp/translation_keys_no_namespace.txt

echo "Keys with namespace:"
wc -l /tmp/translation_keys_with_namespace.txt

echo ""
echo "Keys without namespace:"
wc -l /tmp/translation_keys_no_namespace.txt

echo ""
echo "Sample keys with namespace:"
head -20 /tmp/translation_keys_with_namespace.txt

echo ""
echo "Sample keys without namespace:"
head -20 /tmp/translation_keys_no_namespace.txt
