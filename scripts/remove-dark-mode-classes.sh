#!/bin/bash
# Script to remove dark: classes from all files
# This removes patterns like "dark:bg-gray-800" or "dark:text-white" etc.

find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/ dark:[^"'"'"' ]*//g' \
  -e 's/ dark:[^"'"'"' ]*//g' \
  {} \;

echo "Dark mode classes removed from all files"
