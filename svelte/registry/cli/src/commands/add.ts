import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

interface AddOptions {
  all?: boolean;
  overwrite?: boolean;
  yes?: boolean;
  path?: string;
  registry?: string;
}

interface VersionManifest {
  registry: {
    name: string;
    version: string;
  };
  components: Record<string, {
    version: string;
    lastModified: string;
    title: string;
    description?: string;
  }>;
}

/**
 * Fetch component list from registry
 */
async function fetchComponentList(registryUrl: string): Promise<VersionManifest | null> {
  const url = `${registryUrl}/versions.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`❌ Failed to fetch component list: ${error}`);
    return null;
  }
}

/**
 * Check if running in a Svelte project
 */
function checkSvelteProject(): boolean {
  if (!existsSync('package.json')) {
    console.error('❌ No package.json found. Are you in a project directory?');
    return false;
  }

  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const hasSvelte = pkg.dependencies?.svelte || pkg.devDependencies?.svelte;

    if (!hasSvelte) {
      console.warn('⚠️  Warning: This doesn\'t appear to be a Svelte project.');
      console.warn('   Make sure Svelte is installed before adding components.\n');
    }

    return true;
  } catch (error) {
    console.error('❌ Could not read package.json');
    return false;
  }
}

/**
 * Install a component using shadcn-svelte
 */
function installComponent(
  componentName: string,
  options: AddOptions
): boolean {
  console.log(`\n📦 Installing ${componentName}...`);

  try {
    let cmd = 'npx shadcn-svelte@latest add';

    // Add component name
    cmd += ` ${componentName}`;

    // Add options
    if (options.overwrite) cmd += ' --overwrite';
    if (options.yes) cmd += ' --yes';
    if (options.path) cmd += ` --path ${options.path}`;

    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ ${componentName} installed successfully!\n`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to install ${componentName}\n`);
    return false;
  }
}

/**
 * Add command handler
 */
export async function add(
  components: string[],
  options: AddOptions
) {
  console.log('\n🚀 NDK Svelte Component Installer\n');
  console.log('━'.repeat(50));

  // Check if we're in a project
  if (!checkSvelteProject()) {
    return;
  }

  const registryUrl = options.registry || 'https://ndk.fyi';

  // If no components specified and not --all, show help
  if (components.length === 0 && !options.all) {
    console.log('\n❌ No components specified.\n');
    console.log('Usage:');
    console.log('  npx ndk-svelte add event-card user-profile');
    console.log('  npx ndk-svelte add --all\n');

    console.log('📡 Fetching available components...\n');
    const manifest = await fetchComponentList(registryUrl);

    if (manifest) {
      console.log('Available components:\n');
      const componentList = Object.entries(manifest.components)
        .sort(([a], [b]) => a.localeCompare(b));

      for (const [name, info] of componentList) {
        console.log(`  📦 ${name.padEnd(30)} ${info.title}`);
        if (info.description) {
          console.log(`     ${info.description}`);
        }
      }
      console.log();
    }

    return;
  }

  // Fetch manifest for validation
  console.log(`📡 Checking registry at ${registryUrl}...\n`);
  const manifest = await fetchComponentList(registryUrl);

  if (!manifest) {
    console.log('⚠️  Could not fetch component list, proceeding anyway...\n');
  }

  // If --all, get all components from manifest
  let componentsToInstall = components;

  if (options.all) {
    if (!manifest) {
      console.error('❌ Cannot use --all without access to registry');
      return;
    }

    componentsToInstall = Object.keys(manifest.components);
    console.log(`📦 Installing all ${componentsToInstall.length} components...\n`);

    if (!options.yes) {
      console.log('⚠️  This will install many components. Use --yes to skip this prompt.\n');
      return;
    }
  }

  // Validate components exist in registry
  if (manifest) {
    const invalidComponents = componentsToInstall.filter(
      name => !manifest.components[name]
    );

    if (invalidComponents.length > 0) {
      console.error('❌ Unknown components:', invalidComponents.join(', '));
      console.log('\nRun `npx ndk-svelte add` to see available components.\n');
      return;
    }
  }

  // Install components
  console.log(`Installing ${componentsToInstall.length} component(s):\n`);

  for (const component of componentsToInstall) {
    if (manifest) {
      const info = manifest.components[component];
      console.log(`  📦 ${component} - ${info.title} (v${info.version})`);
    } else {
      console.log(`  📦 ${component}`);
    }
  }
  console.log();

  let installed = 0;
  let failed = 0;

  for (const component of componentsToInstall) {
    if (installComponent(component, options)) {
      installed++;
    } else {
      failed++;
    }
  }

  // Summary
  console.log('━'.repeat(50));
  console.log(`\n✅ Installed ${installed}/${componentsToInstall.length} component(s)`);

  if (failed > 0) {
    console.log(`❌ Failed to install ${failed} component(s)`);
  }

  console.log('\n💡 Tip: Run `npx ndk-svelte upgrade` to check for updates\n');
}
