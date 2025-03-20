#!/usr/bin/env node

/**
 * ChordCraft - Performance Optimization Script
 * 
 * This script analyzes and optimizes the ChordCraft app's performance by:
 * 1. Analyzing bundle size
 * 2. Identifying performance bottlenecks
 * 3. Suggesting optimizations
 * 
 * Usage:
 *   node optimize-performance.js
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

console.log(chalk.blue('=== ChordCraft Performance Optimizer ==='));

// Check if the app has been built
const buildPath = path.resolve(process.cwd(), '..', 'build');
if (!fs.existsSync(buildPath)) {
  console.log(chalk.yellow('⚠️ Build directory not found. Building the app first...'));
  
  try {
    execSync('npm run build', { 
      cwd: path.resolve(process.cwd(), '..'),
      stdio: 'inherit'
    });
    console.log(chalk.green('✅ App built successfully'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to build the app:'), error.message);
    process.exit(1);
  }
}

// Analyze bundle size
console.log(chalk.blue('\n=== Analyzing Bundle Size ==='));

try {
  // Check if source-map-explorer is installed
  try {
    execSync('npx source-map-explorer --version', { 
      cwd: path.resolve(process.cwd(), '..'),
      stdio: 'ignore'
    });
  } catch (error) {
    console.log(chalk.yellow('⚠️ source-map-explorer not found. Installing...'));
    execSync('npm install --save-dev source-map-explorer', { 
      cwd: path.resolve(process.cwd(), '..'),
      stdio: 'inherit'
    });
  }
  
  // Run source-map-explorer
  console.log(chalk.yellow('Running bundle analysis...'));
  
  // Create output directory if it doesn't exist
  const analysisDir = path.resolve(process.cwd(), '..', 'analysis');
  if (!fs.existsSync(analysisDir)) {
    fs.mkdirSync(analysisDir);
  }
  
  // Analyze main JS bundle
  const outputPath = path.resolve(analysisDir, 'bundle-analysis.html');
  execSync(`npx source-map-explorer "${buildPath}/static/js/main.*.js" --html "${outputPath}"`, { 
    cwd: path.resolve(process.cwd(), '..'),
    stdio: 'inherit'
  });
  
  console.log(chalk.green(`✅ Bundle analysis complete. Results saved to ${outputPath}`));
} catch (error) {
  console.error(chalk.red('❌ Failed to analyze bundle size:'), error.message);
}

// Check for performance issues in the code
console.log(chalk.blue('\n=== Checking for Performance Issues ==='));

const performanceIssues = [];

// Function to recursively search for files
function findFiles(dir, pattern) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'build' && file !== '.git') {
      results = results.concat(findFiles(filePath, pattern));
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Find all JS/TS/TSX files
const srcPath = path.resolve(process.cwd(), '..', 'src');
const jsFiles = findFiles(srcPath, /\.(js|jsx|ts|tsx)$/);

console.log(chalk.yellow(`Scanning ${jsFiles.length} files for performance issues...`));

// Patterns to check for
const patterns = [
  {
    pattern: /console\.log/g,
    message: 'Console logging in production code',
    severity: 'warning',
    suggestion: 'Remove console.log statements from production code'
  },
  {
    pattern: /useEffect\(\s*\(\s*\)\s*=>\s*{[^}]*}\s*\)/g,
    message: 'Empty dependency array in useEffect',
    severity: 'warning',
    suggestion: 'Add proper dependencies to useEffect or use useLayoutEffect if it should run only once'
  },
  {
    pattern: /new Array\(/g,
    message: 'Using new Array() constructor',
    severity: 'info',
    suggestion: 'Consider using array literals [] instead'
  },
  {
    pattern: /\.map\([^)]*=>[^)]*\.map\(/g,
    message: 'Nested array mapping',
    severity: 'warning',
    suggestion: 'Nested array mapping can cause performance issues. Consider flattening the arrays first'
  },
  {
    pattern: /useState\([^)]*\)/g,
    message: 'State usage detected',
    severity: 'info',
    suggestion: 'Ensure state is used efficiently and not causing unnecessary re-renders'
  },
  {
    pattern: /import\s+{[^}]*}\s+from\s+['"]@material-ui\/core['"]/g,
    message: 'Material-UI import',
    severity: 'info',
    suggestion: 'Consider using more specific imports from Material-UI to reduce bundle size'
  },
  {
    pattern: /import\s+.*\s+from\s+['"]lodash['"]/g,
    message: 'Lodash import',
    severity: 'warning',
    suggestion: 'Import specific functions from lodash to reduce bundle size (e.g., import debounce from "lodash/debounce")'
  },
  {
    pattern: /document\.querySelector/g,
    message: 'Direct DOM manipulation',
    severity: 'warning',
    suggestion: 'Use React refs instead of direct DOM manipulation'
  },
  {
    pattern: /\.indexOf\([^)]*\)\s*!==/g,
    message: 'Using indexOf for existence check',
    severity: 'info',
    suggestion: 'Consider using includes() instead of indexOf() for better readability'
  },
  {
    pattern: /Object\.keys\([^)]*\)\.forEach/g,
    message: 'Iterating over object keys',
    severity: 'info',
    suggestion: 'Consider using for...in loop or Object.entries() for better performance'
  }
];

// Check each file for patterns
for (const file of jsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(path.resolve(process.cwd(), '..'), file);
  
  for (const { pattern, message, severity, suggestion } of patterns) {
    const matches = content.match(pattern);
    
    if (matches && matches.length > 0) {
      performanceIssues.push({
        file: relativePath,
        message,
        occurrences: matches.length,
        severity,
        suggestion
      });
    }
  }
}

// Group issues by file
const issuesByFile = {};
for (const issue of performanceIssues) {
  if (!issuesByFile[issue.file]) {
    issuesByFile[issue.file] = [];
  }
  issuesByFile[issue.file].push(issue);
}

// Display issues
if (Object.keys(issuesByFile).length === 0) {
  console.log(chalk.green('✅ No performance issues found'));
} else {
  console.log(chalk.yellow(`Found performance issues in ${Object.keys(issuesByFile).length} files:`));
  
  for (const [file, issues] of Object.entries(issuesByFile)) {
    console.log(chalk.blue(`\nFile: ${file}`));
    
    for (const issue of issues) {
      if (issue.severity === 'warning') {
        console.log(chalk.yellow(`⚠️ ${issue.message} (${issue.occurrences} occurrences)`));
      } else {
        console.log(chalk.gray(`ℹ️ ${issue.message} (${issue.occurrences} occurrences)`));
      }
      console.log(chalk.gray(`   Suggestion: ${issue.suggestion}`));
    }
  }
}

// Check for large components
console.log(chalk.blue('\n=== Checking for Large Components ==='));

const largeComponents = [];
for (const file of jsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(path.resolve(process.cwd(), '..'), file);
  
  // Check file size
  const stats = fs.statSync(file);
  const fileSizeKB = stats.size / 1024;
  
  if (fileSizeKB > 10) {
    largeComponents.push({
      file: relativePath,
      sizeKB: fileSizeKB.toFixed(2)
    });
  }
}

// Sort by size
largeComponents.sort((a, b) => b.sizeKB - a.sizeKB);

// Display large components
if (largeComponents.length === 0) {
  console.log(chalk.green('✅ No unusually large components found'));
} else {
  console.log(chalk.yellow(`Found ${largeComponents.length} large components:`));
  
  for (const component of largeComponents.slice(0, 10)) {
    console.log(chalk.yellow(`⚠️ ${component.file} (${component.sizeKB} KB)`));
  }
  
  if (largeComponents.length > 10) {
    console.log(chalk.gray(`... and ${largeComponents.length - 10} more`));
  }
  
  console.log(chalk.gray('\nSuggestion: Consider breaking down large components into smaller, reusable components'));
}

// Generate performance optimization recommendations
console.log(chalk.blue('\n=== Performance Optimization Recommendations ==='));

console.log(`
1. Code Splitting
   - Use React.lazy() and Suspense for component lazy loading
   - Split your bundle into smaller chunks

2. Memoization
   - Use React.memo() for functional components that render often with the same props
   - Use useMemo() for expensive calculations
   - Use useCallback() for functions passed to child components

3. Virtual List
   - If displaying long lists, consider using a virtualized list library like react-window

4. Image Optimization
   - Compress images and use modern formats (WebP)
   - Implement lazy loading for images
   - Use responsive images with srcset

5. Reduce Bundle Size
   - Remove unused dependencies
   - Use tree-shaking friendly imports
   - Consider using smaller alternatives for large libraries

6. Caching
   - Implement proper caching strategies for API calls
   - Use localStorage or IndexedDB for client-side caching

7. Rendering Optimization
   - Avoid unnecessary re-renders
   - Use shouldComponentUpdate or React.memo
   - Keep component state as local as possible

8. Network Optimization
   - Implement request batching
   - Use HTTP/2
   - Consider implementing a service worker for offline support
`);

// Create a performance optimization script for package.json
console.log(chalk.blue('\n=== Adding Performance Scripts to package.json ==='));

try {
  const packageJsonPath = path.resolve(process.cwd(), '..', 'package.json');
  const packageJson = require(packageJsonPath);
  
  // Add performance-related scripts
  const newScripts = {
    'analyze': 'source-map-explorer "build/static/js/*.js"',
    'analyze:bundle': 'node scripts/optimize-performance.js',
    'lighthouse': 'lighthouse http://localhost:3000 --view',
    'serve:build': 'serve -s build',
    'test:performance': 'npm run build && npm run serve:build & npm run lighthouse'
  };
  
  let scriptsUpdated = false;
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  for (const [key, value] of Object.entries(newScripts)) {
    if (!packageJson.scripts[key]) {
      packageJson.scripts[key] = value;
      scriptsUpdated = true;
    }
  }
  
  if (scriptsUpdated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(chalk.green('✅ Added performance scripts to package.json'));
  } else {
    console.log(chalk.green('✅ Performance scripts already exist in package.json'));
  }
  
  // Check for performance-related dependencies
  const performanceDeps = [
    'source-map-explorer',
    'lighthouse',
    'serve'
  ];
  
  const missingDeps = [];
  
  for (const dep of performanceDeps) {
    if (!(packageJson.devDependencies && packageJson.devDependencies[dep]) && 
        !(packageJson.dependencies && packageJson.dependencies[dep])) {
      missingDeps.push(dep);
    }
  }
  
  if (missingDeps.length > 0) {
    console.log(chalk.yellow(`⚠️ Missing performance-related dependencies: ${missingDeps.join(', ')}`));
    console.log(chalk.yellow(`Run: npm install --save-dev ${missingDeps.join(' ')}`));
  } else {
    console.log(chalk.green('✅ All performance-related dependencies are installed'));
  }
} catch (error) {
  console.error(chalk.red('❌ Failed to update package.json:'), error.message);
}

console.log(chalk.green('\n✅ Performance optimization check complete!'));
console.log(chalk.blue('\nTo run performance tests:'));
console.log(`
1. Build the app: npm run build
2. Serve the build: npm run serve:build
3. Run Lighthouse: npm run lighthouse
`);

console.log(chalk.blue('\nTo analyze bundle size:'));
console.log(`
npm run analyze
`);
