#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Comprehensive Performance Report Generator
 * Generates bundle analysis, lighthouse reports, and performance metrics
 */

const REPORTS_DIR = path.join(process.cwd(), 'performance-reports');
const BUILD_DIR = path.join(process.cwd(), '.next');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundleSize() {
  console.log('📦 Analyzing bundle size...');
  
  try {
    // Build with analysis
    execSync('ANALYZE=true npm run build', { stdio: 'inherit' });
    
    // Get bundle stats
    const staticDir = path.join(BUILD_DIR, 'static');
    if (!fs.existsSync(staticDir)) {
      console.warn('Static directory not found, skipping bundle analysis');
      return null;
    }
    
    const bundleStats = {
      timestamp: new Date().toISOString(),
      chunks: [],
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
    };
    
    // Analyze chunks directory
    const chunksDir = path.join(staticDir, 'chunks');
    if (fs.existsSync(chunksDir)) {
      const files = fs.readdirSync(chunksDir, { recursive: true });
      
      files.forEach(file => {
        const filePath = path.join(chunksDir, file);
        if (fs.statSync(filePath).isFile()) {
          const stats = fs.statSync(filePath);
          const size = stats.size;
          
          bundleStats.chunks.push({
            name: file,
            size: size,
            sizeFormatted: formatBytes(size),
          });
          
          bundleStats.totalSize += size;
          
          if (file.endsWith('.js')) {
            bundleStats.jsSize += size;
          } else if (file.endsWith('.css')) {
            bundleStats.cssSize += size;
          }
        }
      });
    }
    
    // Sort chunks by size (largest first)
    bundleStats.chunks.sort((a, b) => b.size - a.size);
    
    // Format totals
    bundleStats.totalSizeFormatted = formatBytes(bundleStats.totalSize);
    bundleStats.jsSizeFormatted = formatBytes(bundleStats.jsSize);
    bundleStats.cssSizeFormatted = formatBytes(bundleStats.cssSize);
    
    // Save bundle report
    const reportPath = path.join(REPORTS_DIR, 'bundle-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(bundleStats, null, 2));
    
    console.log(`✅ Bundle analysis complete. Total size: ${bundleStats.totalSizeFormatted}`);
    console.log(`   - JS: ${bundleStats.jsSizeFormatted}`);
    console.log(`   - CSS: ${bundleStats.cssSizeFormatted}`);
    
    return bundleStats;
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    return null;
  }
}

function runLighthouseAudit() {
  console.log('🔍 Running Lighthouse audit...');
  
  try {
    // Check if server is running
    const serverCheck = execSync('curl -s http://localhost:3000 || echo "SERVER_DOWN"', { encoding: 'utf8' });
    
    if (serverCheck.includes('SERVER_DOWN')) {
      console.log('⚠️  Development server not running. Please start with "npm run dev" first.');
      return null;
    }
    
    // Run Lighthouse
    const lighthouseCmd = `npx lighthouse http://localhost:3000 \
      --output=json \
      --output-path=${path.join(REPORTS_DIR, 'lighthouse.json')} \
      --chrome-flags="--headless --no-sandbox" \
      --quiet`;
    
    execSync(lighthouseCmd, { stdio: 'inherit' });
    
    // Parse and summarize results
    const lighthouseReport = JSON.parse(
      fs.readFileSync(path.join(REPORTS_DIR, 'lighthouse.json'), 'utf8')
    );
    
    const summary = {
      timestamp: new Date().toISOString(),
      url: lighthouseReport.finalUrl,
      scores: {
        performance: Math.round(lighthouseReport.categories.performance.score * 100),
        accessibility: Math.round(lighthouseReport.categories.accessibility.score * 100),
        bestPractices: Math.round(lighthouseReport.categories['best-practices'].score * 100),
        seo: Math.round(lighthouseReport.categories.seo.score * 100),
      },
      metrics: {
        firstContentfulPaint: lighthouseReport.audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: lighthouseReport.audits['largest-contentful-paint'].numericValue,
        cumulativeLayoutShift: lighthouseReport.audits['cumulative-layout-shift'].numericValue,
        totalBlockingTime: lighthouseReport.audits['total-blocking-time'].numericValue,
        speedIndex: lighthouseReport.audits['speed-index'].numericValue,
      }
    };
    
    // Save summary
    fs.writeFileSync(
      path.join(REPORTS_DIR, 'lighthouse-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('✅ Lighthouse audit complete');
    console.log(`   Performance: ${summary.scores.performance}/100`);
    console.log(`   Accessibility: ${summary.scores.accessibility}/100`);
    console.log(`   Best Practices: ${summary.scores.bestPractices}/100`);
    console.log(`   SEO: ${summary.scores.seo}/100`);
    
    return summary;
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error.message);
    return null;
  }
}

function generateSummaryReport(bundleStats, lighthouseStats) {
  console.log('📊 Generating summary report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    bundle: bundleStats,
    lighthouse: lighthouseStats,
    recommendations: [],
  };
  
  // Generate recommendations based on results
  if (bundleStats) {
    if (bundleStats.totalSize > 1024 * 1024) { // > 1MB
      report.recommendations.push({
        type: 'bundle-size',
        severity: 'high',
        message: 'Bundle size is large (>1MB). Consider code splitting and tree shaking.',
      });
    }
    
    if (bundleStats.jsSize > 500 * 1024) { // > 500KB
      report.recommendations.push({
        type: 'js-size',
        severity: 'medium',
        message: 'JavaScript bundle is large (>500KB). Consider lazy loading and dynamic imports.',
      });
    }
  }
  
  if (lighthouseStats) {
    if (lighthouseStats.scores.performance < 90) {
      report.recommendations.push({
        type: 'performance',
        severity: 'high',
        message: `Performance score is ${lighthouseStats.scores.performance}/100. Focus on Core Web Vitals optimization.`,
      });
    }
    
    if (lighthouseStats.metrics.largestContentfulPaint > 2500) {
      report.recommendations.push({
        type: 'lcp',
        severity: 'high',
        message: 'Largest Contentful Paint is slow (>2.5s). Optimize images and critical resources.',
      });
    }
    
    if (lighthouseStats.metrics.cumulativeLayoutShift > 0.1) {
      report.recommendations.push({
        type: 'cls',
        severity: 'medium',
        message: 'Cumulative Layout Shift is high (>0.1). Ensure proper image dimensions and avoid layout shifts.',
      });
    }
  }
  
  // Save summary report
  const reportPath = path.join(REPORTS_DIR, 'performance-summary.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate markdown report
  const markdownReport = generateMarkdownReport(report);
  fs.writeFileSync(path.join(REPORTS_DIR, 'performance-report.md'), markdownReport);
  
  console.log('✅ Summary report generated');
  console.log(`📄 Reports saved to: ${REPORTS_DIR}`);
  
  return report;
}

function generateMarkdownReport(report) {
  let markdown = `# Performance Report\n\n`;
  markdown += `Generated: ${new Date(report.timestamp).toLocaleString()}\n\n`;
  
  if (report.bundle) {
    markdown += `## Bundle Analysis\n\n`;
    markdown += `- **Total Size**: ${report.bundle.totalSizeFormatted}\n`;
    markdown += `- **JavaScript**: ${report.bundle.jsSizeFormatted}\n`;
    markdown += `- **CSS**: ${report.bundle.cssSizeFormatted}\n\n`;
    
    markdown += `### Largest Chunks\n\n`;
    report.bundle.chunks.slice(0, 10).forEach((chunk, index) => {
      markdown += `${index + 1}. ${chunk.name} - ${chunk.sizeFormatted}\n`;
    });
    markdown += `\n`;
  }
  
  if (report.lighthouse) {
    markdown += `## Lighthouse Scores\n\n`;
    markdown += `- **Performance**: ${report.lighthouse.scores.performance}/100\n`;
    markdown += `- **Accessibility**: ${report.lighthouse.scores.accessibility}/100\n`;
    markdown += `- **Best Practices**: ${report.lighthouse.scores.bestPractices}/100\n`;
    markdown += `- **SEO**: ${report.lighthouse.scores.seo}/100\n\n`;
    
    markdown += `### Core Web Vitals\n\n`;
    markdown += `- **First Contentful Paint**: ${Math.round(report.lighthouse.metrics.firstContentfulPaint)}ms\n`;
    markdown += `- **Largest Contentful Paint**: ${Math.round(report.lighthouse.metrics.largestContentfulPaint)}ms\n`;
    markdown += `- **Cumulative Layout Shift**: ${report.lighthouse.metrics.cumulativeLayoutShift.toFixed(3)}\n`;
    markdown += `- **Total Blocking Time**: ${Math.round(report.lighthouse.metrics.totalBlockingTime)}ms\n`;
    markdown += `- **Speed Index**: ${Math.round(report.lighthouse.metrics.speedIndex)}ms\n\n`;
  }
  
  if (report.recommendations.length > 0) {
    markdown += `## Recommendations\n\n`;
    report.recommendations.forEach((rec, index) => {
      const emoji = rec.severity === 'high' ? '🔴' : rec.severity === 'medium' ? '🟡' : '🟢';
      markdown += `${index + 1}. ${emoji} **${rec.type.toUpperCase()}**: ${rec.message}\n`;
    });
    markdown += `\n`;
  }
  
  return markdown;
}

// Main execution
async function main() {
  console.log('🚀 Starting comprehensive performance analysis...\n');
  
  const bundleStats = analyzeBundleSize();
  console.log('');
  
  const lighthouseStats = runLighthouseAudit();
  console.log('');
  
  const summaryReport = generateSummaryReport(bundleStats, lighthouseStats);
  
  console.log('\n🎉 Performance analysis complete!');
  console.log(`📊 View reports in: ${REPORTS_DIR}`);
  
  // Display quick summary
  if (summaryReport.recommendations.length > 0) {
    console.log('\n⚠️  Recommendations:');
    summaryReport.recommendations.forEach((rec, index) => {
      const emoji = rec.severity === 'high' ? '🔴' : rec.severity === 'medium' ? '🟡' : '🟢';
      console.log(`   ${index + 1}. ${emoji} ${rec.message}`);
    });
  } else {
    console.log('\n✅ No critical performance issues found!');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeBundleSize,
  runLighthouseAudit,
  generateSummaryReport,
};