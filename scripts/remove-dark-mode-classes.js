#!/usr/bin/env node
/**
 * Script to remove all dark: classes from TypeScript/TSX files
 * This removes dark mode styling since dark mode has been disabled
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all .tsx and .ts files in src directory
const findFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
};

// Remove dark: classes from a file
const removeDarkClasses = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Remove dark: classes from className strings
  // Pattern: matches " dark:..." within className strings
  content = content.replace(/className="([^"]*)"/g, (match, className) => {
    // Remove all dark: prefixed classes
    const cleaned = className.replace(/\s*dark:[^\s]*/g, '').trim();
    return `className="${cleaned}"`;
  });
  
  // Remove dark: classes from template literals
  content = content.replace(/className=\{`([^`]*)`\}/g, (match, className) => {
    const cleaned = className.replace(/\s*dark:[^\s]*/g, '').trim();
    return `className={\`${cleaned}\`}`;
  });
  
  // Remove dark: classes from single quotes
  content = content.replace(/className='([^']*)'/g, (match, className) => {
    const cleaned = className.replace(/\s*dark:[^\s]*/g, '').trim();
    return `className='${cleaned}'`;
  });
  
  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
};

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
const files = findFiles(srcDir);

console.log(`Found ${files.length} files to process...`);

let modifiedCount = 0;
files.forEach(file => {
  if (removeDarkClasses(file)) {
    modifiedCount++;
    console.log(`Modified: ${file}`);
  }
});

console.log(`\nDone! Modified ${modifiedCount} files.`);

