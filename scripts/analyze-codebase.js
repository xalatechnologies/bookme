#!/usr/bin/env node

/**
 * Codebase Analysis Script
 * Scans all TypeScript/React files and generates:
 * 1. Component inventory with localization status
 * 2. Hardcoded string extraction
 * 3. TypeScript issue detection
 * 4. SOLID principle violation detection
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'analysis-output');
const SRC_DIR = path.join(__dirname, '..', 'src');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Recursively find all .ts and .tsx files
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (!file.includes('.test.') && !file.includes('.spec.')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(SRC_DIR, filePath);
  const lines = content.split('\n');
  
  const analysis = {
    path: relativePath,
    fullPath: filePath,
    lines: lines.length,
    type: getFileType(relativePath, content),
    localization: {
      hasUseTranslation: /useTranslation/.test(content),
      hasTranslationHook: /const\s+{\s*t\s*}\s*=\s*useTranslation/.test(content),
      hardcodedStrings: extractHardcodedStrings(content, lines),
      hasLocalizedSelect: /LocalizedSelect/.test(content),
    },
    typescript: {
      hasExplicitAny: (content.match(/:\s*any[\s,;)>]/g) || []).length,
      hasImplicitAny: /Parameter .* implicitly has an 'any' type/.test(content),
      unusedImports: extractUnusedImports(content),
      missingReturnTypes: countMissingReturnTypes(content),
    },
    solid: {
      componentSize: getComponentSize(content),
      dependencies: extractDependencies(content),
      props: extractProps(content),
      stateCount: (content.match(/useState/g) || []).length,
      effectCount: (content.match(/useEffect/g) || []).length,
    },
    imports: extractImports(content),
    exports: extractExports(content),
  };
  
  return analysis;
}

/**
 * Determine file type
 */
function getFileType(relativePath, content) {
  if (relativePath.startsWith('pages/')) return 'page';
  if (relativePath.startsWith('components/ui/')) return 'ui-primitive';
  if (relativePath.startsWith('components/common/')) return 'common-component';
  if (relativePath.startsWith('components/features/')) return 'feature-component';
  if (relativePath.startsWith('components/layouts/')) return 'layout';
  if (relativePath.startsWith('hooks/')) return 'hook';
  if (relativePath.startsWith('services/')) return 'service';
  if (relativePath.startsWith('stores/')) return 'store';
  if (relativePath.startsWith('contexts/')) return 'context';
  if (relativePath.startsWith('utils/')) return 'utility';
  if (relativePath.startsWith('types/')) return 'type-definition';
  if (relativePath.startsWith('lib/')) return 'library';
  if (relativePath.startsWith('config/')) return 'config';
  if (relativePath.startsWith('constants/')) return 'constant';
  if (relativePath.startsWith('data/')) return 'data';
  return 'other';
}

/**
 * Extract hardcoded strings (potential translation candidates)
 */
function extractHardcodedStrings(content, lines) {
  const strings = [];
  const stringRegex = /(['"`])((?:(?!\1).)*)\1/g;
  
  lines.forEach((line, index) => {
    // Skip import statements, comments, and certain technical strings
    if (line.trim().startsWith('import ')) return;
    if (line.trim().startsWith('//')) return;
    if (line.trim().startsWith('*')) return;
    
    let match;
    while ((match = stringRegex.exec(line)) !== null) {
      const str = match[2];
      
      // Filter out technical strings
      if (str.length === 0) continue;
      if (/^[a-z_-]+$/.test(str)) continue; // CSS classes, keys
      if (/^\d+$/.test(str)) continue; // Numbers
      if (/^[./]/.test(str)) continue; // Paths
      if (str.startsWith('http')) continue; // URLs
      if (str.length < 3) continue; // Very short strings
      
      // Check if it's user-facing text (contains spaces or Norwegian characters)
      if (/\s/.test(str) || /[æøåÆØÅ]/.test(str) || str.length > 15) {
        strings.push({
          line: index + 1,
          text: str,
          context: line.trim(),
        });
      }
    }
  });
  
  return strings;
}

/**
 * Extract unused imports
 */
function extractUnusedImports(content) {
  const imports = [];
  const importRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const namedImports = match[1];
    const defaultImport = match[2];
    
    if (namedImports) {
      namedImports.split(',').forEach(imp => {
        const name = imp.trim();
        // Check if used in code
        const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
        const matches = content.match(usageRegex);
        if (!matches || matches.length <= 1) { // Only in import
          imports.push(name);
        }
      });
    }
    
    if (defaultImport) {
      const usageRegex = new RegExp(`\\b${defaultImport}\\b`, 'g');
      const matches = content.match(usageRegex);
      if (!matches || matches.length <= 1) {
        imports.push(defaultImport);
      }
    }
  }
  
  return imports;
}

/**
 * Count functions missing return types
 */
function countMissingReturnTypes(content) {
  const functionRegex = /(function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g;
  const withTypeRegex = /:\s*\w+\s*=>/;
  
  let count = 0;
  let match;
  
  while ((match = functionRegex.exec(content)) !== null) {
    const line = content.substring(match.index, match.index + 100);
    if (!withTypeRegex.test(line) && !line.includes(': React.FC')) {
      count++;
    }
  }
  
  return count;
}

/**
 * Get component size (LOC)
 */
function getComponentSize(content) {
  const lines = content.split('\n');
  const codeLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('*');
  });
  return codeLines.length;
}

/**
 * Extract dependencies
 */
function extractDependencies(content) {
  const deps = [];
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    deps.push(match[1]);
  }
  
  return deps;
}

/**
 * Extract props interface
 */
function extractProps(content) {
  const propsMatch = content.match(/interface\s+(\w+Props)\s*{([^}]+)}/);
  if (propsMatch) {
    const props = propsMatch[2]
      .split(';')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    return props.length;
  }
  return 0;
}

/**
 * Extract imports
 */
function extractImports(content) {
  const imports = [];
  const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

/**
 * Extract exports
 */
function extractExports(content) {
  const exports = [];
  const exportRegex = /export\s+(?:default\s+)?(?:const|function|class|interface|type)\s+(\w+)/g;
  
  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  
  return exports;
}

/**
 * Main analysis
 */
console.log('🔍 Starting codebase analysis...\n');

const allFiles = findFiles(SRC_DIR);
console.log(`Found ${allFiles.length} TypeScript files\n`);

const analyses = allFiles.map(analyzeFile);

// Group by type
const byType = {};
analyses.forEach(a => {
  if (!byType[a.type]) byType[a.type] = [];
  byType[a.type].push(a);
});

// Generate reports
console.log('📊 Generating reports...\n');

// 1. Component Inventory
const inventory = {
  summary: {
    totalFiles: analyses.length,
    byType: Object.keys(byType).map(type => ({
      type,
      count: byType[type].length,
    })),
  },
  localization: {
    withTranslationHook: analyses.filter(a => a.localization.hasTranslationHook).length,
    withHardcodedStrings: analyses.filter(a => a.localization.hardcodedStrings.length > 0).length,
    totalHardcodedStrings: analyses.reduce((sum, a) => sum + a.localization.hardcodedStrings.length, 0),
  },
  typescript: {
    filesWithExplicitAny: analyses.filter(a => a.typescript.hasExplicitAny > 0).length,
    totalExplicitAny: analyses.reduce((sum, a) => sum + a.typescript.hasExplicitAny, 0),
    filesWithUnusedImports: analyses.filter(a => a.typescript.unusedImports.length > 0).length,
  },
  components: analyses.filter(a => 
    a.type === 'page' || 
    a.type === 'feature-component' || 
    a.type === 'common-component'
  ).map(a => ({
    path: a.path,
    type: a.type,
    lines: a.lines,
    localized: a.localization.hasTranslationHook,
    hardcodedStrings: a.localization.hardcodedStrings.length,
    dependencies: a.solid.dependencies.length,
    complexity: {
      props: a.solid.props,
      state: a.solid.stateCount,
      effects: a.solid.effectCount,
    }
  })),
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'component-inventory.json'),
  JSON.stringify(inventory, null, 2)
);

// 2. Hardcoded Strings (Translation candidates)
const translationCandidates = analyses
  .filter(a => a.localization.hardcodedStrings.length > 0)
  .map(a => ({
    file: a.path,
    strings: a.localization.hardcodedStrings,
  }));

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'translation-candidates.json'),
  JSON.stringify(translationCandidates, null, 2)
);

// 3. TypeScript Issues
const tsIssues = analyses
  .filter(a => 
    a.typescript.hasExplicitAny > 0 || 
    a.typescript.unusedImports.length > 0
  )
  .map(a => ({
    file: a.path,
    explicitAny: a.typescript.hasExplicitAny,
    unusedImports: a.typescript.unusedImports,
    missingReturnTypes: a.typescript.missingReturnTypes,
  }));

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'typescript-issues.json'),
  JSON.stringify(tsIssues, null, 2)
);

// 4. Component Complexity (SOLID violations)
const complexity = analyses
  .filter(a => a.type === 'page' || a.type === 'feature-component')
  .filter(a => a.solid.componentSize > 300 || a.solid.stateCount > 5)
  .map(a => ({
    file: a.path,
    size: a.solid.componentSize,
    state: a.solid.stateCount,
    effects: a.solid.effectCount,
    props: a.solid.props,
    dependencies: a.solid.dependencies.length,
  }))
  .sort((a, b) => b.size - a.size);

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'component-complexity.json'),
  JSON.stringify(complexity, null, 2)
);

// Print summary
console.log('✅ Analysis complete!\n');
console.log('Summary:');
console.log(`  Total files: ${analyses.length}`);
console.log(`  With translation hook: ${inventory.localization.withTranslationHook}`);
console.log(`  With hardcoded strings: ${inventory.localization.withHardcodedStrings}`);
console.log(`  Total hardcoded strings: ${inventory.localization.totalHardcodedStrings}`);
console.log(`  Files with explicit 'any': ${inventory.typescript.filesWithExplicitAny}`);
console.log(`  Total 'any' usages: ${inventory.typescript.totalExplicitAny}`);
console.log(`  Files with unused imports: ${inventory.typescript.filesWithUnusedImports}`);
console.log(`  Complex components (>300 LOC): ${complexity.length}\n`);
console.log(`📁 Reports saved to: ${OUTPUT_DIR}\n`);
