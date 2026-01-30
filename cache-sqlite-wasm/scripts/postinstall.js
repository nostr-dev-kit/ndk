#!/usr/bin/env node

/**
 * Postinstall script for @nostr-dev-kit/cache-sqlite-wasm
 *
 * Detects the project type and provides guidance on setting up
 * the required worker and WASM files.
 */

const fs = require('fs');
const path = require('path');

// Check if we should skip the postinstall message
if (process.env.SKIP_NDK_CACHE_SETUP === '1' || process.env.CI === 'true') {
  process.exit(0);
}

// Check if this is being installed as a dependency (not in the package itself)
const isInstalledAsDependency = !__dirname.includes(path.join('cache-sqlite-wasm', 'scripts'));
if (!isInstalledAsDependency) {
  // Skip if we're in the package's own directory (development)
  process.exit(0);
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
};

function detectFramework() {
  const cwd = process.cwd();
  const packageJsonPath = findPackageJson(cwd);

  if (!packageJsonPath) {
    return null;
  }

  const projectRoot = path.dirname(packageJsonPath);

  // Check for Vite
  if (
    fs.existsSync(path.join(projectRoot, 'vite.config.js')) ||
    fs.existsSync(path.join(projectRoot, 'vite.config.ts')) ||
    fs.existsSync(path.join(projectRoot, 'vite.config.mjs'))
  ) {
    return { name: 'Vite', publicDir: 'public' };
  }

  // Check for Next.js
  if (
    fs.existsSync(path.join(projectRoot, 'next.config.js')) ||
    fs.existsSync(path.join(projectRoot, 'next.config.mjs')) ||
    fs.existsSync(path.join(projectRoot, 'next.config.ts'))
  ) {
    return { name: 'Next.js', publicDir: 'public' };
  }

  // Check for SvelteKit
  if (fs.existsSync(path.join(projectRoot, 'svelte.config.js'))) {
    return { name: 'SvelteKit', publicDir: 'static' };
  }

  // Check for Nuxt
  if (
    fs.existsSync(path.join(projectRoot, 'nuxt.config.js')) ||
    fs.existsSync(path.join(projectRoot, 'nuxt.config.ts'))
  ) {
    return { name: 'Nuxt', publicDir: 'public' };
  }

  // Check for Astro
  if (fs.existsSync(path.join(projectRoot, 'astro.config.mjs'))) {
    return { name: 'Astro', publicDir: 'public' };
  }

  // Generic web project detection
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps['vite']) {
      return { name: 'Vite', publicDir: 'public' };
    }
    if (deps['next']) {
      return { name: 'Next.js', publicDir: 'public' };
    }
    if (deps['@sveltejs/kit']) {
      return { name: 'SvelteKit', publicDir: 'static' };
    }
    if (deps['nuxt']) {
      return { name: 'Nuxt', publicDir: 'public' };
    }
    if (deps['astro']) {
      return { name: 'Astro', publicDir: 'public' };
    }
  } catch (e) {
    // Ignore package.json read errors
  }

  return null;
}

function findPackageJson(startDir) {
  let currentDir = startDir;
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      // Make sure this isn't the cache-sqlite-wasm package itself
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (pkg.name !== '@nostr-dev-kit/cache-sqlite-wasm') {
          return packageJsonPath;
        }
      } catch (e) {
        // Continue searching
      }
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

function getNodeModulesPath() {
  // Try to find the actual node_modules path where this package is installed
  const possiblePaths = [
    path.join(process.cwd(), 'node_modules', '@nostr-dev-kit', 'cache-sqlite-wasm', 'dist'),
    path.join(__dirname, '..', 'dist'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return 'node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist';
}

function printSetupInstructions() {
  const framework = detectFramework();
  const distPath = getNodeModulesPath();

  console.log('');
  console.log(`${colors.bright}${colors.cyan}┌─────────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}│${colors.reset} ${colors.bright}@nostr-dev-kit/cache-sqlite-wasm${colors.reset} ${colors.cyan}Setup Required${colors.reset}       ${colors.cyan}│${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}└─────────────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');

  if (framework) {
    console.log(`${colors.bright}${colors.green}✓${colors.reset} Detected: ${colors.bright}${framework.name}${colors.reset}`);
    console.log('');
    console.log(`${colors.dim}This package requires these files to be copied to your ${colors.bright}${framework.publicDir}/${colors.reset}${colors.dim} directory:${colors.reset}`);
    console.log(`${colors.dim}  • worker.js       - Web Worker for background SQLite operations${colors.reset}`);
    console.log(`${colors.dim}  • wa-sqlite.wasm  - SQLite WASM binary${colors.reset}`);
    console.log('');
    console.log(`${colors.bright}Run these commands:${colors.reset}`);
    console.log('');
    console.log(`  ${colors.cyan}cp ${distPath}/worker.js ${framework.publicDir}/${colors.reset}`);
    console.log(`  ${colors.cyan}cp ${distPath}/wa-sqlite.wasm ${framework.publicDir}/${colors.reset}`);
    console.log('');
    console.log(`${colors.bright}${colors.yellow}IMPORTANT: COOP/COEP Headers Required${colors.reset}`);
    console.log(`${colors.dim}Add these HTTP headers to your server for OPFS persistence:${colors.reset}`);
    console.log(`  ${colors.dim}Cross-Origin-Opener-Policy: same-origin${colors.reset}`);
    console.log(`  ${colors.dim}Cross-Origin-Embedder-Policy: require-corp${colors.reset}`);
    console.log('');
    console.log(`${colors.dim}Then configure the adapter:${colors.reset}`);
    console.log('');
    console.log(`  ${colors.dim}const cache = new NDKCacheAdapterSqliteWasm({${colors.reset}`);
    console.log(`  ${colors.dim}  workerUrl: '/worker.js'${colors.reset}`);
    console.log(`  ${colors.dim}});${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠${colors.reset}  Could not detect your framework automatically.`);
    console.log('');
    console.log(`${colors.dim}This package requires these files to be accessible via HTTP:${colors.reset}`);
    console.log(`${colors.dim}  • worker.js       - Web Worker for background SQLite operations${colors.reset}`);
    console.log(`${colors.dim}  • wa-sqlite.wasm  - SQLite WASM binary${colors.reset}`);
    console.log('');
    console.log(`${colors.bright}Copy these files to your public/static directory:${colors.reset}`);
    console.log('');
    console.log(`  ${colors.cyan}cp ${distPath}/worker.js <your-public-dir>/${colors.reset}`);
    console.log(`  ${colors.cyan}cp ${distPath}/wa-sqlite.wasm <your-public-dir>/${colors.reset}`);
    console.log('');
    console.log(`${colors.bright}${colors.yellow}IMPORTANT: COOP/COEP Headers Required${colors.reset}`);
    console.log(`${colors.dim}Add these HTTP headers to your server for OPFS persistence:${colors.reset}`);
    console.log(`  ${colors.dim}Cross-Origin-Opener-Policy: same-origin${colors.reset}`);
    console.log(`  ${colors.dim}Cross-Origin-Embedder-Policy: require-corp${colors.reset}`);
    console.log('');
    console.log(`${colors.dim}Then configure the adapter with the correct URLs.${colors.reset}`);
  }

  console.log('');
  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.dim}📖 Documentation: https://github.com/nostr-dev-kit/ndk${colors.reset}`);
  console.log(`${colors.dim}💡 To skip this message: export SKIP_NDK_CACHE_SETUP=1${colors.reset}`);
  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('');
}

// Run the setup instructions
printSetupInstructions();
