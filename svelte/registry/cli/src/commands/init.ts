import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';

interface InitOptions {
  yes?: boolean;
}

/**
 * Initialize a project for NDK components
 */
export async function init(options: InitOptions) {
  console.log('\n🚀 NDK Svelte Project Setup\n');
  console.log('━'.repeat(50));

  // Check if already initialized
  if (existsSync('components.json')) {
    console.log('✓ Project already initialized (components.json exists)\n');
    return;
  }

  // Check if package.json exists
  if (!existsSync('package.json')) {
    console.error('❌ No package.json found. Please run this in a project directory.\n');
    return;
  }

  console.log('📦 Initializing shadcn-svelte configuration...\n');

  try {
    // Run shadcn-svelte init
    const cmd = options.yes
      ? 'npx shadcn-svelte@latest init --yes'
      : 'npx shadcn-svelte@latest init';

    execSync(cmd, { stdio: 'inherit' });

    // Check if components.json was created
    if (!existsSync('components.json')) {
      console.error('\n❌ Failed to create components.json\n');
      return;
    }

    // Update components.json to use NDK registry
    console.log('\n📝 Configuring NDK registry...');

    const config = JSON.parse(readFileSync('components.json', 'utf-8'));

    // Update registry URL
    config.registry = 'https://shadcn.ndk.fyi';

    // Write updated config
    writeFileSync('components.json', JSON.stringify(config, null, 2));

    console.log('✅ Updated registry URL to https://shadcn.ndk.fyi\n');
    console.log('━'.repeat(50));
    console.log('\n✅ Project initialized successfully!\n');
    console.log('Next steps:');
    console.log('  1. Install components:');
    console.log('     npx ndk-svelte add event-card user-profile\n');
    console.log('  2. Check for updates:');
    console.log('     npx ndk-svelte upgrade\n');

  } catch (error) {
    console.error('\n❌ Failed to initialize project');
    console.error('   Make sure you are in a Svelte/SvelteKit project directory\n');
  }
}
