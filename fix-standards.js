#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all .tsx files
const files = glob.sync('src/**/*.tsx', { cwd: process.cwd() });

console.log(`Found ${files.length} .tsx files to fix`);

files.forEach(file => {
  console.log(`Fixing: ${file}`);
  
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // 1. Add "use client" if not present and file uses React hooks or browser APIs
  const needsUseClient = content.includes('useState') || 
                        content.includes('useEffect') || 
                        content.includes('useCallback') ||
                        content.includes('useNavigate') ||
                        content.includes('useParams') ||
                        content.includes('useSearchParams') ||
                        content.includes('useRef') ||
                        content.includes('localStorage') ||
                        content.includes('navigator.');

  if (needsUseClient && !content.includes('"use client"')) {
    content = '"use client";\n\n' + content;
    modified = true;
  }

  // 2. Fix import organization
  const lines = content.split('\n');
  const importLines = [];
  const otherLines = [];
  let inImports = false;
  let useClientLine = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === '"use client";') {
      useClientLine = line;
      continue;
    }
    
    if (line.startsWith('import ') || line.startsWith('} from ')) {
      importLines.push(line);
      inImports = true;
    } else if (inImports && line.trim() === '') {
      // Skip empty lines in imports
      continue;
    } else {
      if (inImports) {
        inImports = false;
      }
      otherLines.push(line);
    }
  }

  if (importLines.length > 0) {
    // Organize imports
    const externalImports = [];
    const internalImports = [];
    const siblingImports = [];

    importLines.forEach(line => {
      if (line.includes("from 'react'") || 
          line.includes("from 'react-router-dom'") ||
          line.includes("from 'lucide-react'")) {
        externalImports.push(line);
      } else if (line.includes("from '@/")) {
        if (line.includes("from '@/components/") || 
            line.includes("from './") || 
            line.includes("from '../")) {
          siblingImports.push(line);
        } else {
          internalImports.push(line);
        }
      } else {
        siblingImports.push(line);
      }
    });

    const organizedContent = [
      useClientLine,
      '',
      ...externalImports,
      externalImports.length > 0 ? '' : null,
      ...internalImports,
      internalImports.length > 0 ? '' : null,
      ...siblingImports,
      siblingImports.length > 0 ? '' : null,
      ...otherLines
    ].filter(line => line !== null).join('\n');

    if (organizedContent !== content) {
      content = organizedContent;
      modified = true;
    }
  }

  // 3. Fix interface properties to be readonly
  content = content.replace(/interface\s+(\w+)\s*{([^}]+)}/g, (match, interfaceName, body) => {
    const fixedBody = body.replace(/^\s*(\w+):/gm, '  readonly $1:');
    return `interface ${interfaceName} {${fixedBody}}`;
  });

  // 4. Fix function return types
  content = content.replace(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{/g, (match, funcName) => {
    if (match.includes(': JSX.Element =>') || match.includes(': void =>') || match.includes(': string =>')) {
      return match;
    }
    // Add JSX.Element for React components
    if (funcName.charAt(0) === funcName.charAt(0).toUpperCase()) {
      return match.replace(' => {', '): JSX.Element => {');
    }
    return match;
  });

  // 5. Fix export statements
  content = content.replace(/^const\s+(\w+)/gm, 'export const $1');
  content = content.replace(/^export default\s+(\w+);?$/gm, '');

  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed: ${file}`);
  } else {
    console.log(`✓ Already compliant: ${file}`);
  }
});

console.log('✅ All files processed!');
