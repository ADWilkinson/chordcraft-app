#!/usr/bin/env node

/**
 * ChordCraft - Performance Optimizer
 * 
 * This script analyzes and optimizes app performance for production.
 * 
 * Usage:
 *   node optimize.js
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('=== ChordCraft Performance Optimizer ==='));

// Check if the dist directory exists
const distPath = path.resolve(process.cwd(), '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.log(chalk.yellow('⚠️ Dist directory not found. Run a production build first.'));
  console.log(chalk.yellow('Creating placeholder dist directory...'));
  fs.mkdirSync(distPath, { recursive: true });
  console.log(chalk.green('✅ Created placeholder dist directory'));
} else {
  console.log(chalk.green('✅ Dist directory found'));
}

// Performance checks
console.log(chalk.blue('\n=== Performance Checks ==='));

// Check for large bundle sizes
console.log(chalk.yellow('Checking bundle sizes...'));
let totalSize = 0;
let largeFiles = [];

try {
  const walkDir = (dir) => {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        const sizeInMB = stat.size / (1024 * 1024);
        totalSize += sizeInMB;
        
        if (sizeInMB > 0.5 && (file.endsWith('.js') || file.endsWith('.css'))) {
          largeFiles.push({
            path: path.relative(distPath, filePath),
            size: sizeInMB.toFixed(2)
          });
        }
      }
    }
  };
  
  if (fs.existsSync(distPath)) {
    walkDir(distPath);
    
    console.log(chalk.green(`Total bundle size: ${totalSize.toFixed(2)} MB`));
    
    if (largeFiles.length > 0) {
      console.log(chalk.yellow('Large files detected:'));
      
      for (const file of largeFiles) {
        console.log(chalk.yellow(`- ${file.path}: ${file.size} MB`));
      }
      
      console.log(chalk.yellow('\nConsider code splitting or lazy loading for these files.'));
    } else {
      console.log(chalk.green('✅ No large bundles detected'));
    }
  }
} catch (error) {
  console.log(chalk.yellow(`⚠️ Could not analyze bundle sizes: ${error.message}`));
}

// Check for Firebase performance monitoring
console.log(chalk.blue('\n=== Firebase Performance Monitoring ==='));

const mainJsPath = path.resolve(process.cwd(), '..', 'src', 'main.js');
if (fs.existsSync(mainJsPath)) {
  const mainJs = fs.readFileSync(mainJsPath, 'utf8');
  
  if (mainJs.includes('firebase/performance')) {
    console.log(chalk.green('✅ Firebase Performance Monitoring is integrated'));
  } else {
    console.log(chalk.yellow('⚠️ Firebase Performance Monitoring not found'));
    console.log(chalk.yellow('Consider adding Firebase Performance Monitoring for better insights.'));
  }
} else {
  console.log(chalk.yellow('⚠️ Could not find main.js to check for Performance Monitoring'));
}

// Check for image optimization
console.log(chalk.blue('\n=== Image Optimization ==='));

try {
  let imageCount = 0;
  let largeImages = [];
  
  const walkDir = (dir) => {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        const ext = path.extname(file).toLowerCase();
        
        if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) {
          imageCount++;
          
          const sizeInMB = stat.size / (1024 * 1024);
          
          if (sizeInMB > 0.2) {
            largeImages.push({
              path: path.relative(process.cwd(), filePath),
              size: sizeInMB.toFixed(2)
            });
          }
        }
      }
    }
  };
  
  const publicPath = path.resolve(process.cwd(), '..', 'public');
  const srcPath = path.resolve(process.cwd(), '..', 'src');
  
  if (fs.existsSync(publicPath)) {
    walkDir(publicPath);
  }
  
  if (fs.existsSync(srcPath)) {
    walkDir(srcPath);
  }
  
  console.log(chalk.green(`Found ${imageCount} images in the project`));
  
  if (largeImages.length > 0) {
    console.log(chalk.yellow('Large images detected:'));
    
    for (const image of largeImages) {
      console.log(chalk.yellow(`- ${image.path}: ${image.size} MB`));
    }
    
    console.log(chalk.yellow('\nConsider optimizing these images to improve load times.'));
  } else {
    console.log(chalk.green('✅ No large images detected'));
  }
} catch (error) {
  console.log(chalk.yellow(`⚠️ Could not analyze images: ${error.message}`));
}

// Check for lazy loading
console.log(chalk.blue('\n=== Lazy Loading ==='));

try {
  const srcPath = path.resolve(process.cwd(), '..', 'src');
  let lazyLoadingFound = false;
  
  const checkForLazyLoading = (dir) => {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        checkForLazyLoading(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('import(') || content.includes('React.lazy(') || content.includes('lazy(')) {
          lazyLoadingFound = true;
        }
      }
    }
  };
  
  if (fs.existsSync(srcPath)) {
    checkForLazyLoading(srcPath);
    
    if (lazyLoadingFound) {
      console.log(chalk.green('✅ Lazy loading is being used in the project'));
    } else {
      console.log(chalk.yellow('⚠️ No lazy loading detected'));
      console.log(chalk.yellow('Consider using lazy loading for components to improve initial load time.'));
    }
  }
} catch (error) {
  console.log(chalk.yellow(`⚠️ Could not check for lazy loading: ${error.message}`));
}

// Optimization recommendations
console.log(chalk.blue('\n=== Optimization Recommendations ==='));
console.log(`
1. Use code splitting and lazy loading for large components
2. Optimize images using WebP format and proper sizing
3. Implement caching strategies for API responses
4. Enable Firebase Performance Monitoring
5. Use service workers for offline support
6. Implement proper error boundaries
7. Optimize CSS delivery
8. Use tree shaking to eliminate unused code
`);

console.log(chalk.green('\n✅ Performance optimization check complete!'));
