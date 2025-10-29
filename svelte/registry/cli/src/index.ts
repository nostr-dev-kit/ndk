#!/usr/bin/env node

import { Command } from 'commander';
import { upgrade } from './commands/upgrade.js';

const program = new Command();

program
  .name('ndk-svelte')
  .description('CLI for managing NDK Svelte components')
  .version('0.1.0');

program
  .command('upgrade')
  .description('Check for component updates and upgrade')
  .option('-y, --yes', 'Auto-upgrade all components without prompting')
  .option('--registry <url>', 'Custom registry URL', 'https://ndk.fyi')
  .action(upgrade);

program.parse();
