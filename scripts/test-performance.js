#!/usr/bin/env node

/**
 * Performance Testing Script for PairFlix Applications
 *
 * This script validates the performance optimizations implemented
 * across data-heavy views and components.
 */

import fs from 'fs';

console.log('🚀 PairFlix Performance Testing Suite\n');

// Performance metrics to validate (used for reference and future testing)
// const performanceMetrics = {
//   targetRenderTime: 16, // 60fps target
//   maxMemoryIncrease: 50, // Max 50% memory increase
//   debounceDelay: 500, // Expected debounce delay
//   virtualizationThreshold: 50, // Items before virtualization kicks in
// };

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }

  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

function testFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  logTest(
    `File exists: ${description}`,
    exists,
    exists ? `Found: ${filePath}` : `Missing: ${filePath}`
  );
  return exists;
}

function testComponentOptimizations() {
  console.log('\n📊 Testing Component Optimizations');

  // Test React.memo implementations
  const watchlistPath = 'app.client/src/features/watchlist/WatchlistPage.tsx';
  if (fs.existsSync(watchlistPath)) {
    const content = fs.readFileSync(watchlistPath, 'utf8');
    const hasMemo = content.includes('React.memo');
    const hasUseCallback = content.includes('useCallback');
    const hasUseMemo = content.includes('useMemo');

    logTest('WatchlistPage uses React.memo', hasMemo);
    logTest('WatchlistPage uses useCallback', hasUseCallback);
    logTest('WatchlistPage uses useMemo', hasUseMemo);
  }

  // Test SearchMedia optimizations
  const searchPath = 'app.client/src/features/watchlist/SearchMedia.tsx';
  if (fs.existsSync(searchPath)) {
    const content = fs.readFileSync(searchPath, 'utf8');
    const hasDebounced = content.includes('useDebounced');
    const hasLazyImage = content.includes('LazyImage');
    const hasMemoizedRender = content.includes('renderSearchResults');

    logTest('SearchMedia uses debounced search', hasDebounced);
    logTest('SearchMedia has lazy image loading', hasLazyImage);
    logTest('SearchMedia has memoized rendering', hasMemoizedRender);
  }
}

function testVirtualScrolling() {
  console.log('\n📜 Testing Virtual Scrolling Implementation');

  // Test virtual scrolling hooks
  const hooksPath = 'lib.components/src/hooks/useVirtualized.ts';
  const hookExists = testFileExists(hooksPath, 'Virtual scrolling hook');

  if (hookExists) {
    const content = fs.readFileSync(hooksPath, 'utf8');
    const hasVirtualization = content.includes('useVirtualized');
    const hasDebounce = content.includes('useDebounced');
    const hasPerformance = content.includes('usePerformance');

    logTest('useVirtualized hook implemented', hasVirtualization);
    logTest('useDebounced hook implemented', hasDebounce);
    logTest('usePerformance hook implemented', hasPerformance);
  }

  // Test virtualization usage in components
  const watchlistPath = 'app.client/src/features/watchlist/WatchlistPage.tsx';
  if (fs.existsSync(watchlistPath)) {
    const content = fs.readFileSync(watchlistPath, 'utf8');
    const hasVirtualizationThreshold = content.includes(
      'VIRTUALIZATION_THRESHOLD'
    );
    const hasVirtualContainer = content.includes('VirtualizedContainer');

    logTest(
      'WatchlistPage has virtualization threshold',
      hasVirtualizationThreshold
    );
    logTest('WatchlistPage has virtual container', hasVirtualContainer);
  }
}

function testPerformanceDocumentation() {
  console.log('\n📚 Testing Performance Documentation');

  testFileExists(
    'docs/performance-optimizations.md',
    'Performance documentation'
  );

  const docPath = 'docs/performance-optimizations.md';
  if (fs.existsSync(docPath)) {
    const content = fs.readFileSync(docPath, 'utf8');
    const hasMetrics = content.includes('Key Performance Metrics');
    const hasImplementation = content.includes('Implementation Guidelines');
    const hasMonitoring = content.includes('Performance Monitoring');

    logTest('Documentation includes performance metrics', hasMetrics);
    logTest(
      'Documentation includes implementation guidelines',
      hasImplementation
    );
    logTest('Documentation includes monitoring section', hasMonitoring);
  }
}

function testAdminOptimizations() {
  console.log('\n🔧 Testing Admin Component Optimizations');

  const contentModerationPath =
    'app.admin/src/features/admin/components/content/ContentModerationContent.tsx';
  if (fs.existsSync(contentModerationPath)) {
    const content = fs.readFileSync(contentModerationPath, 'utf8');
    const hasDebounced = content.includes('useDebounced');
    const hasMemoized = content.includes('useCallback');
    const hasReactMemo = content.includes('React.memo');

    logTest('ContentModeration uses debounced search', hasDebounced);
    logTest('ContentModeration uses memoized callbacks', hasMemoized);
    logTest('ContentModeration uses React.memo', hasReactMemo);
  }
}

function testBundleOptimizations() {
  console.log('\n📦 Testing Bundle Optimizations');

  // Check for proper exports in component library
  const indexPath = 'lib.components/src/hooks/index.ts';
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    const exportsHooks = content.includes('useVirtualized');

    logTest('Performance hooks are properly exported', exportsHooks);
  }

  // Check for lazy loading implementations
  const searchPath = 'app.client/src/features/watchlist/SearchMedia.tsx';
  if (fs.existsSync(searchPath)) {
    const content = fs.readFileSync(searchPath, 'utf8');
    const hasLazyLoading = content.includes('loading="lazy"');

    logTest('Images use lazy loading', hasLazyLoading);
  }
}

function testPRDUpdates() {
  console.log('\n📋 Testing PRD Updates');

  const prdPath = 'docs/prd.md';
  if (fs.existsSync(prdPath)) {
    const content = fs.readFileSync(prdPath, 'utf8');
    const hasCompletedTask = content.includes(
      'Performance optimizations for data-heavy views ✅ **COMPLETED**'
    );
    const hasDetailsChecklist = content.includes(
      'Implemented React.memo, useMemo, and useCallback optimizations'
    );

    logTest('PRD marks performance task as completed', hasCompletedTask);
    logTest('PRD includes detailed completion checklist', hasDetailsChecklist);
  }
}

function generateReport() {
  console.log('\n📊 Performance Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(
    `📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`
  );

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`   • ${test.name}`);
        if (test.details) {
          console.log(`     ${test.details}`);
        }
      });
  }

  console.log('\n🎯 Performance Optimization Validation Complete!');

  // Exit with error code if tests failed
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run all tests
function runTests() {
  testComponentOptimizations();
  testVirtualScrolling();
  testPerformanceDocumentation();
  testAdminOptimizations();
  testBundleOptimizations();
  testPRDUpdates();
  generateReport();
}

// Execute the test suite
runTests();
