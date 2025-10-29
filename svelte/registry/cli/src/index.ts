#!/usr/bin/env node

import { Command } from 'commander';
import { init } from './commands/init.js';
import { add } from './commands/add.js';
import { upgrade } from './commands/upgrade.js';

const program = new Command();

program
  .name('ndk-svelte')
  .description('CLI for managing NDK Svelte components')
  .version('0.1.1');

program
  .command('init')
  .description('Initialize project for NDK components')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(init);

program
  .command('add')
  .description('Add NDK components to your project')
  .argument('[components...]', 'Component names to add')
  .option('-a, --all', 'Install all available components')
  .option('-o, --overwrite', 'Overwrite existing files')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('-p, --path <path>', 'Custom installation path')
  .option('--registry <url>', 'Custom registry URL', 'https://ndk.fyi')
  .action(add);

program
  .command('upgrade')
  .description('Check for component updates and upgrade')
  .option('-y, --yes', 'Auto-upgrade all components without prompting')
  .option('--registry <url>', 'Custom registry URL', 'https://ndk.fyi')
  .action(upgrade);

program.parse();
