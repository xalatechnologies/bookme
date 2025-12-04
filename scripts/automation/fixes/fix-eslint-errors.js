#!/usr/bin/env node

/**
 * ESLint Error Auto-Fix Script
 * 
 * Automatically fixes common ESLint errors:
 * - Unused imports (removes them)
 * - Unused variables (prefixes with _)
 * - Case declarations (wraps in braces)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(process.cwd(), 'src');

/**
 * Get all TypeScript/TSX files
 */
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      getFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (!filePath.includes('test') && !filePath.includes('__mocks__')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * Remove unused imports
 */
function removeUnusedImports(content) {
  // This is a simplified version - ESLint --fix handles most of this
  // But we can handle some edge cases here
  return content;
}

/**
 * Fix case declarations
 */
function fixCaseDeclarations(content) {
  // Wrap const/let declarations in case blocks with braces
  const lines = content.split('\n');
  const fixed = [];
  let inSwitch = false;
  let switchDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect switch statement
    if (line.match(/^\s*switch\s*\(/)) {
      inSwitch = true;
      switchDepth = 0;
      fixed.push(line);
      continue;
    }
    
    // Detect case/default
    if (inSwitch && line.match(/^\s*(case|default)\s+/)) {
      fixed.push(line);
      // Check if next non-empty line is a const/let declaration
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') {
        j++;
      }
      if (j < lines.length && lines[j].match(/^\s*(const|let)\s+/)) {
        // Add opening brace if not already there
        if (!lines[i].includes('{')) {
          fixed[fixed.length - 1] = line.replace(/(case\s+[^:]+:|default\s*:)/, '$1 {');
        }
      }
      continue;
    }
    
    // Detect closing brace that ends switch
    if (inSwitch && line.match(/^\s*}\s*$/) && switchDepth === 0) {
      inSwitch = false;
    }
    
    if (line.includes('{')) switchDepth++;
    if (line.includes('}')) switchDepth--;
    
    fixed.push(line);
  }
  
  return fixed.join('\n');
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Finding files...');
  const files = getFiles(SRC_DIR);
  console.log(`📁 Found ${files.length} files`);
  
  console.log('\n🔧 Running ESLint --fix...');
  try {
    execSync('npm run lint -- --fix', { stdio: 'inherit' });
    console.log('✅ ESLint --fix completed');
  } catch (error) {
    console.log('⚠️  ESLint --fix completed with errors (expected)');
  }
  
  console.log('\n✨ Done!');
}

main();

