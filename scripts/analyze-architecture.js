#!/usr/bin/env node

/**
 * Architecture Analysis Script
 * Analyzes:
 * 1. RBAC & Auth patterns
 * 2. Design tokens & styling consistency
 * 3. Separation of concerns (UI vs Logic)
 * 4. Hooks/State/Components connectivity
 * 5. Animations & transitions
 * 6. Performance patterns (loading, caching, memoization)
 */

const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "..", "analysis-output");
const SRC_DIR = path.join(__dirname, "..", "src");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Recursively find all .ts and .tsx files
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.includes("node_modules") && !file.includes(".git")) {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      if (!file.includes(".test.") && !file.includes(".spec.")) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Analyze RBAC & Auth patterns
 */
function analyzeAuth(content, filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);

  return {
    path: relativePath,
    hasAuthGuard: /ProtectedRoute|RequireRole|PermissionGuard|RoleGuard/.test(
      content
    ),
    usesAuthContext: /useAuth\(|AuthContext/.test(content),
    usesRoleHook: /useRole\(/.test(content),
    usesPermissions: /usePermissions\(|hasPermission/.test(content),
    checksFunctions: extractAuthChecks(content),
    roles: extractRoleReferences(content),
    permissions: extractPermissionReferences(content),
    hasInlineAuthLogic: hasInlineAuthLogic(content),
  };
}

function extractAuthChecks(content) {
  const checks = [];
  const patterns = [
    /if\s*\(.*user\.role/,
    /if\s*\(.*isAdmin/,
    /if\s*\(.*isOwner/,
    /if\s*\(.*hasPermission/,
    /user\.role\s*===\s*['"](\w+)['"]/g,
  ];

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      checks.push(...matches);
    }
  });

  return checks;
}

function extractRoleReferences(content) {
  const roles = new Set();
  const rolePattern = /['"](?:admin|owner|staff|customer|superadmin)['"]/gi;
  const matches = content.match(rolePattern);

  if (matches) {
    matches.forEach((m) => roles.add(m.replace(/['"]/g, "")));
  }

  return Array.from(roles);
}

function extractPermissionReferences(content) {
  const permissions = new Set();
  const permPattern =
    /['"](?:bookings|facilities|users|reports)\.(?:read|write|delete|approve)['"]/gi;
  const matches = content.match(permPattern);

  if (matches) {
    matches.forEach((m) => permissions.add(m.replace(/['"]/g, "")));
  }

  return Array.from(permissions);
}

function hasInlineAuthLogic(content) {
  // Check for auth logic mixed in render/UI code
  const inlinePatterns = [
    /return.*user\.role.*\?.*:/,
    /{.*user\.role.*&&/,
    /isAdmin.*&&.*</,
  ];

  return inlinePatterns.some((p) => p.test(content));
}

/**
 * Analyze styling patterns
 */
function analyzeStyling(content, filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);

  return {
    path: relativePath,
    styling: {
      usesTailwind: /className=["'][^"']*\b(?:bg-|text-|p-|m-|flex|grid)/.test(
        content
      ),
      usesInlineStyles: /style={{/.test(content),
      usesStyledComponents: /@emotion|styled-components/.test(content),
      usesCSSModules: /\.module\.css/.test(content),
      usesDesignTokens: /colors\.|spacing\.|typography\./.test(content),
    },
    tailwindClasses: extractTailwindClasses(content),
    hardcodedColors: extractHardcodedColors(content),
    hardcodedSpacing: extractHardcodedSpacing(content),
    customColors: extractCustomColors(content),
    inconsistencies: detectStylingInconsistencies(content),
  };
}

function extractTailwindClasses(content) {
  const classMatches = content.match(/className=["']([^"']+)["']/g) || [];
  const allClasses = new Set();

  classMatches.forEach((match) => {
    const classes = match.match(/["']([^"']+)["']/)[1].split(/\s+/);
    classes.forEach((c) => {
      if (c.match(/^(bg-|text-|border-|p-|m-|w-|h-)/)) {
        allClasses.add(c);
      }
    });
  });

  return Array.from(allClasses);
}

function extractHardcodedColors(content) {
  const hardcoded = [];
  const colorPatterns = [
    /#[0-9a-fA-F]{3,6}/g,
    /rgb\([^)]+\)/g,
    /rgba\([^)]+\)/g,
  ];

  colorPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      hardcoded.push(...matches);
    }
  });

  return [...new Set(hardcoded)];
}

function extractHardcodedSpacing(content) {
  const spacing = [];
  const spacingPattern =
    /(?:padding|margin|gap|space):\s*["']?\d+(?:px|rem|em)["']?/g;
  const matches = content.match(spacingPattern);

  if (matches) {
    spacing.push(...matches);
  }

  return spacing;
}

function extractCustomColors(content) {
  const colors = new Set();
  // Look for custom color usage
  const customPattern =
    /(?:bg-|text-|border-)(?!white|black|gray|red|blue|green|yellow|purple|pink|indigo)\w+/g;
  const matches = content.match(customPattern);

  if (matches) {
    matches.forEach((m) => colors.add(m));
  }

  return Array.from(colors);
}

function detectStylingInconsistencies(content) {
  const issues = [];

  // Mix of Tailwind and inline styles
  if (/className=/.test(content) && /style={{/.test(content)) {
    issues.push("Mixed Tailwind and inline styles");
  }

  // Hardcoded colors instead of design tokens
  if (extractHardcodedColors(content).length > 0) {
    issues.push("Hardcoded colors found");
  }

  // Multiple spacing systems
  if (extractHardcodedSpacing(content).length > 0) {
    issues.push("Hardcoded spacing values");
  }

  return issues;
}

/**
 * Analyze separation of concerns
 */
function analyzeSeparationOfConcerns(content, filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);
  const isComponent =
    relativePath.includes("components/") || relativePath.includes("pages/");

  if (!isComponent) return null;

  return {
    path: relativePath,
    businessLogic: {
      hasDataFetching: /fetch\(|axios\.|supabase\./.test(content),
      hasAPIcalls: /\.post\(|\.get\(|\.put\(|\.delete\(/.test(content),
      hasComplexCalculations:
        /\.reduce\(|\.filter\(.*\.map\(|for\s*\(.*for\s*\(/.test(content),
      hasValidation: /validate|schema|yup|zod/.test(content),
      hasStateManagement: /useState|useReducer/.test(content),
    },
    uiLogic: {
      hasConditionalRendering: /\?\s*<|&&\s*</.test(content),
      hasEventHandlers: /onClick|onChange|onSubmit/.test(content),
      hasFormHandling: /<form|useForm/.test(content),
    },
    hookUsage: extractHookUsage(content),
    serviceUsage: extractServiceUsage(content),
    violations: detectSoCViolations(content),
  };
}

function extractHookUsage(content) {
  const hooks = [];
  const hookPattern = /use[A-Z]\w+/g;
  const matches = content.match(hookPattern);

  if (matches) {
    return [...new Set(matches)];
  }

  return hooks;
}

function extractServiceUsage(content) {
  const services = [];
  const servicePattern =
    /import\s+{[^}]*}\s+from\s+['"]@\/services\/([^'"]+)['"]/g;
  let match;

  while ((match = servicePattern.exec(content)) !== null) {
    services.push(match[1]);
  }

  return services;
}

function detectSoCViolations(content) {
  const violations = [];

  // Direct API calls in component
  if (/fetch\(|axios\.|supabase\.(?!from)/.test(content)) {
    violations.push("Direct API calls in component");
  }

  // Complex business logic in render
  if (/return\s*\([\s\S]*?\.reduce\([\s\S]*?\)/.test(content)) {
    violations.push("Complex calculations in render");
  }

  // Multiple responsibilities
  const responsibilities = [];
  if (/useState/.test(content)) responsibilities.push("state");
  if (/useEffect/.test(content)) responsibilities.push("effects");
  if (/fetch\(/.test(content)) responsibilities.push("data-fetching");
  if (/validate/.test(content)) responsibilities.push("validation");

  if (responsibilities.length > 3) {
    violations.push(
      `Too many responsibilities: ${responsibilities.join(", ")}`
    );
  }

  return violations;
}

/**
 * Analyze component connectivity
 */
function analyzeConnectivity(content, filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);

  return {
    path: relativePath,
    imports: {
      hooks: extractImportsByPattern(content, /use[A-Z]\w+/),
      stores: extractImportsByPattern(content, /Store/),
      contexts: extractImportsByPattern(content, /Context/),
      services: extractImportsByPattern(content, /\.service/),
    },
    dataFlow: {
      propsReceived: countProps(content),
      propsDestructured: extractDestructuredProps(content),
      stateVariables: (content.match(/useState/g) || []).length,
      contextUsage: (content.match(/useContext/g) || []).length,
      storeUsage: extractStoreUsage(content),
    },
    dependencies: extractAllImports(content),
  };
}

function extractImportsByPattern(content, pattern) {
  const imports = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    if (line.includes("import") && pattern.test(line)) {
      const match = line.match(/import\s+{([^}]+)}/);
      if (match) {
        const items = match[1].split(",").map((i) => i.trim());
        imports.push(...items.filter((i) => pattern.test(i)));
      }
    }
  });

  return imports;
}

function countProps(content) {
  const propsMatch = content.match(/interface\s+\w+Props\s*{([^}]+)}/);
  if (propsMatch) {
    return propsMatch[1].split(";").filter((p) => p.trim()).length;
  }
  return 0;
}

function extractDestructuredProps(content) {
  const props = [];
  const destructureMatch = content.match(/=\s*\({([^}]+)}\s*:/);
  if (destructureMatch) {
    return destructureMatch[1].split(",").map((p) => p.trim());
  }
  return props;
}

function extractStoreUsage(content) {
  const stores = [];
  const storePattern = /use\w+Store\(\)/g;
  const matches = content.match(storePattern);

  if (matches) {
    return [...new Set(matches)];
  }

  return stores;
}

function extractAllImports(content) {
  const imports = [];
  const importPattern = /import\s+.*from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importPattern.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Analyze animations & transitions
 */
function analyzeAnimations(content, filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);

  return {
    path: relativePath,
    animations: {
      usesCSSTransitions: /transition-|duration-|ease-/.test(content),
      usesFramerMotion: /framer-motion|motion\./.test(content),
      usesReactSpring: /react-spring|useSpring/.test(content),
      hasCustomAnimations: /@keyframes|animation:/.test(content),
    },
    transitions: extractTransitions(content),
    animationClasses: extractAnimationClasses(content),
    performance: {
      usesWillChange: /will-change/.test(content),
      usesTransform: /transform|translate|scale|rotate/.test(content),
      usesGPUAcceleration: /transform: translate3d/.test(content),
    },
  };
}

function extractTransitions(content) {
  const transitions = [];
  const transitionPattern =
    /transition-(?:all|colors|opacity|transform|[\w-]+)/g;
  const matches = content.match(transitionPattern);

  if (matches) {
    return [...new Set(matches)];
  }

  return transitions;
}

function extractAnimationClasses(content) {
  const classes = [];
  const animPattern = /animate-(?:spin|ping|pulse|bounce|[\w-]+)/g;
  const matches = content.match(animPattern);

  if (matches) {
    return [...new Set(matches)];
  }

  return classes;
}

/**
 * Analyze performance patterns
 */
function analyzePerformance(content, filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);

  return {
    path: relativePath,
    memoization: {
      usesMemo: (content.match(/useMemo/g) || []).length,
      usesCallback: (content.match(/useCallback/g) || []).length,
      usesMemoComponent: /React\.memo|memo\(/.test(content),
    },
    loading: {
      hasLoadingStates: /isLoading|loading|isPending/.test(content),
      hasSkeletons: /Skeleton|skeleton/.test(content),
      hasSpinners: /Spinner|spinner|Loading/.test(content),
      hasSuspense: /<Suspense/.test(content),
    },
    dataFetching: {
      usesReactQuery: /useQuery|useMutation/.test(content),
      usesSWR: /useSWR/.test(content),
      hasCache: /cache|staleTime|cacheTime/.test(content),
    },
    optimization: {
      lazyLoading: /lazy\(|React\.lazy/.test(content),
      virtualScrolling: /react-window|react-virtualized/.test(content),
      debouncing: /debounce|useDebounce/.test(content),
      throttling: /throttle|useThrottle/.test(content),
    },
    issues: detectPerformanceIssues(content),
  };
}

function detectPerformanceIssues(content) {
  const issues = [];

  // Inline function definitions in render
  if (/onClick={\(\)\s*=>/.test(content) && !/useCallback/.test(content)) {
    issues.push("Inline arrow functions without useCallback");
  }

  // Missing key prop in lists
  if (/\.map\(/.test(content) && !/<\w+[^>]*key=/.test(content)) {
    issues.push("Potential missing key props in lists");
  }

  // Large useEffect without dependencies
  const effectMatches = content.match(/useEffect\([^,]+,\s*\[\s*\]\)/g);
  if (effectMatches && effectMatches.length > 3) {
    issues.push("Multiple useEffect with empty dependencies");
  }

  return issues;
}

/**
 * Main analysis
 */
console.log("🏗️  Starting architecture analysis...\n");

const allFiles = findFiles(SRC_DIR);
const componentFiles = allFiles.filter(
  (f) => f.includes("/components/") || f.includes("/pages/")
);

console.log(`Found ${allFiles.length} total files`);
console.log(`Analyzing ${componentFiles.length} component/page files\n`);

// Run analyses
const authAnalysis = [];
const stylingAnalysis = [];
const socAnalysis = [];
const connectivityAnalysis = [];
const animationAnalysis = [];
const performanceAnalysis = [];

allFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const relativePath = path.relative(SRC_DIR, filePath);

  // Auth analysis for all files
  const auth = analyzeAuth(content, filePath);
  if (auth.hasAuthGuard || auth.usesAuthContext || auth.roles.length > 0) {
    authAnalysis.push(auth);
  }

  // Styling analysis for components/pages
  if (relativePath.includes("components/") || relativePath.includes("pages/")) {
    const styling = analyzeStyling(content, filePath);
    if (
      styling.tailwindClasses.length > 0 ||
      styling.inconsistencies.length > 0
    ) {
      stylingAnalysis.push(styling);
    }

    const soc = analyzeSeparationOfConcerns(content, filePath);
    if (soc && soc.violations.length > 0) {
      socAnalysis.push(soc);
    }

    const connectivity = analyzeConnectivity(content, filePath);
    connectivityAnalysis.push(connectivity);

    const animation = analyzeAnimations(content, filePath);
    if (
      animation.transitions.length > 0 ||
      animation.animationClasses.length > 0
    ) {
      animationAnalysis.push(animation);
    }

    const performance = analyzePerformance(content, filePath);
    if (performance.issues.length > 0 || performance.memoization.usesMemo > 0) {
      performanceAnalysis.push(performance);
    }
  }
});

// Generate reports
console.log("📊 Generating reports...\n");

// 1. Auth & RBAC Report
fs.writeFileSync(
  path.join(OUTPUT_DIR, "auth-rbac-analysis.json"),
  JSON.stringify(
    {
      summary: {
        totalFilesWithAuth: authAnalysis.length,
        filesWithInlineLogic: authAnalysis.filter((a) => a.hasInlineAuthLogic)
          .length,
        uniqueRoles: [...new Set(authAnalysis.flatMap((a) => a.roles))],
        uniquePermissions: [
          ...new Set(authAnalysis.flatMap((a) => a.permissions)),
        ],
      },
      files: authAnalysis,
    },
    null,
    2
  )
);

// 2. Styling Consistency Report
fs.writeFileSync(
  path.join(OUTPUT_DIR, "styling-analysis.json"),
  JSON.stringify(
    {
      summary: {
        totalFiles: stylingAnalysis.length,
        filesWithHardcodedColors: stylingAnalysis.filter(
          (s) => s.hardcodedColors.length > 0
        ).length,
        filesWithInlineStyles: stylingAnalysis.filter(
          (s) => s.styling.usesInlineStyles
        ).length,
        filesWithInconsistencies: stylingAnalysis.filter(
          (s) => s.inconsistencies.length > 0
        ).length,
        commonColors: findCommonColors(stylingAnalysis),
        commonSpacing: findCommonSpacing(stylingAnalysis),
      },
      files: stylingAnalysis,
    },
    null,
    2
  )
);

// 3. Separation of Concerns Report
fs.writeFileSync(
  path.join(OUTPUT_DIR, "separation-of-concerns.json"),
  JSON.stringify(
    {
      summary: {
        totalViolations: socAnalysis.reduce(
          (sum, s) => sum + s.violations.length,
          0
        ),
        filesWithViolations: socAnalysis.length,
        commonViolations: findCommonViolations(socAnalysis),
      },
      files: socAnalysis,
    },
    null,
    2
  )
);

// 4. Component Connectivity Report
fs.writeFileSync(
  path.join(OUTPUT_DIR, "component-connectivity.json"),
  JSON.stringify(
    {
      summary: {
        totalComponents: connectivityAnalysis.length,
        avgPropsPerComponent: Math.round(
          connectivityAnalysis.reduce(
            (sum, c) => sum + c.dataFlow.propsReceived,
            0
          ) / connectivityAnalysis.length
        ),
        mostConnectedComponents: connectivityAnalysis
          .sort((a, b) => b.dependencies.length - a.dependencies.length)
          .slice(0, 10)
          .map((c) => ({ path: c.path, dependencies: c.dependencies.length })),
      },
      files: connectivityAnalysis,
    },
    null,
    2
  )
);

// 5. Animation & Transitions Report
fs.writeFileSync(
  path.join(OUTPUT_DIR, "animations-analysis.json"),
  JSON.stringify(
    {
      summary: {
        filesWithAnimations: animationAnalysis.length,
        filesWithTransitions: animationAnalysis.filter(
          (a) => a.animations.usesCSSTransitions
        ).length,
        filesWithFramerMotion: animationAnalysis.filter(
          (a) => a.animations.usesFramerMotion
        ).length,
        commonTransitions: findCommonTransitions(animationAnalysis),
      },
      files: animationAnalysis,
    },
    null,
    2
  )
);

// 6. Performance Report
fs.writeFileSync(
  path.join(OUTPUT_DIR, "performance-analysis.json"),
  JSON.stringify(
    {
      summary: {
        filesWithIssues: performanceAnalysis.filter((p) => p.issues.length > 0)
          .length,
        filesWithMemoization: performanceAnalysis.filter(
          (p) => p.memoization.usesMemo > 0
        ).length,
        filesWithLoading: performanceAnalysis.filter(
          (p) => p.loading.hasLoadingStates
        ).length,
        filesWithLazyLoading: performanceAnalysis.filter(
          (p) => p.optimization.lazyLoading
        ).length,
        commonIssues: findCommonIssues(performanceAnalysis),
      },
      files: performanceAnalysis,
    },
    null,
    2
  )
);

// Helper functions
function findCommonColors(analyses) {
  const colorCount = {};
  analyses.forEach((a) => {
    a.hardcodedColors.forEach((color) => {
      colorCount[color] = (colorCount[color] || 0) + 1;
    });
  });
  return Object.entries(colorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([color, count]) => ({ color, count }));
}

function findCommonSpacing(analyses) {
  const spacingCount = {};
  analyses.forEach((a) => {
    a.hardcodedSpacing.forEach((spacing) => {
      spacingCount[spacing] = (spacingCount[spacing] || 0) + 1;
    });
  });
  return Object.entries(spacingCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([spacing, count]) => ({ spacing, count }));
}

function findCommonViolations(analyses) {
  const violationCount = {};
  analyses.forEach((a) => {
    a.violations.forEach((v) => {
      violationCount[v] = (violationCount[v] || 0) + 1;
    });
  });
  return Object.entries(violationCount)
    .sort((a, b) => b[1] - a[1])
    .map(([violation, count]) => ({ violation, count }));
}

function findCommonTransitions(analyses) {
  const transitionCount = {};
  analyses.forEach((a) => {
    a.transitions.forEach((t) => {
      transitionCount[t] = (transitionCount[t] || 0) + 1;
    });
  });
  return Object.entries(transitionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([transition, count]) => ({ transition, count }));
}

function findCommonIssues(analyses) {
  const issueCount = {};
  analyses.forEach((a) => {
    a.issues.forEach((issue) => {
      issueCount[issue] = (issueCount[issue] || 0) + 1;
    });
  });
  return Object.entries(issueCount)
    .sort((a, b) => b[1] - a[1])
    .map(([issue, count]) => ({ issue, count }));
}

console.log("✅ Architecture analysis complete!\n");
console.log("Summary:");
console.log(`  Files with auth/RBAC: ${authAnalysis.length}`);
console.log(
  `  Files with styling issues: ${
    stylingAnalysis.filter((s) => s.inconsistencies.length > 0).length
  }`
);
console.log(`  Files with SoC violations: ${socAnalysis.length}`);
console.log(`  Components analyzed: ${connectivityAnalysis.length}`);
console.log(`  Files with animations: ${animationAnalysis.length}`);
console.log(
  `  Files with performance issues: ${
    performanceAnalysis.filter((p) => p.issues.length > 0).length
  }\n`
);
console.log(`📁 Reports saved to: ${OUTPUT_DIR}\n`);
