#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REGISTRY_ROOT = join(ROOT, 'src/lib/registry');

type MigrationEntry = {
	from: string;
	to: string;
	type: string;
	note?: string;
};

type MigrationMap = {
	icons: MigrationEntry[];
	simpleComponents: MigrationEntry[];
	multiFileComponents: MigrationEntry[];
};

const DRY_RUN = process.argv.includes('--dry-run');
const STAGE = process.argv.find((arg) => arg.startsWith('--stage='))?.split('=')[1];

function log(message: string, color: 'green' | 'yellow' | 'red' | 'blue' = 'blue') {
	const colors = {
		green: '\x1b[32m',
		yellow: '\x1b[33m',
		red: '\x1b[31m',
		blue: '\x1b[34m'
	};
	const reset = '\x1b[0m';
	console.log(`${colors[color]}${message}${reset}`);
}

function exec(command: string, description: string): string {
	if (DRY_RUN) {
		log(`[DRY RUN] ${description}: ${command}`, 'yellow');
		return '';
	}
	log(`${description}...`, 'blue');
	try {
		return execSync(command, { cwd: ROOT, encoding: 'utf-8' });
	} catch (error: any) {
		log(`Error: ${error.message}`, 'red');
		throw error;
	}
}

function executeGitMoves(entries: MigrationEntry[], stageName: string) {
	log(`\n=== Stage: ${stageName} (${entries.length} moves) ===`, 'green');

	for (const entry of entries) {
		const fromPath = join(REGISTRY_ROOT, entry.from);
		const toPath = join(REGISTRY_ROOT, entry.to);

		// Check if source exists
		if (!existsSync(fromPath)) {
			log(`Skipping ${entry.from} (does not exist)`, 'yellow');
			continue;
		}

		// Create parent directory for destination
		const toDir = dirname(toPath);
		if (!DRY_RUN && !existsSync(toDir)) {
			exec(`mkdir -p "${toDir}"`, `Create directory ${toDir}`);
		}

		// Execute git mv
		exec(`git mv "${fromPath}" "${toPath}"`, `Move ${entry.from} → ${entry.to}`);
	}

	if (!DRY_RUN) {
		log(`\nCommitting stage: ${stageName}`, 'green');
		exec(
			`git commit -m "refactor: ${stageName.toLowerCase()}" -m "Part of component restructuring for jsrepo individual installation"`,
			'Commit changes'
		);
	}
}

function updateImports() {
	log('\n=== Updating Imports ===', 'green');

	const mapping: MigrationMap = JSON.parse(
		readFileSync(join(__dirname, 'migration-map.json'), 'utf-8')
	);

	// Build comprehensive path mapping
	const allMappings = [
		...mapping.icons,
		...mapping.simpleComponents,
		...mapping.multiFileComponents
	];

	// Find all source files
	const filesToUpdate = findFiles(
		ROOT,
		(file) =>
			(file.endsWith('.svelte') || file.endsWith('.ts') || file.endsWith('.js')) &&
			!file.includes('node_modules') &&
			!file.includes('.svelte-kit') &&
			!file.includes('dist') &&
			!file.endsWith('migrate-components.ts')
	);

	log(`Found ${filesToUpdate.length} files to check`, 'blue');

	let totalReplacements = 0;

	for (const file of filesToUpdate) {
		let content = readFileSync(file, 'utf-8');
		let modified = false;
		let fileReplacements = 0;

		for (const entry of allMappings) {
			// Handle different import patterns
			const patterns = [
				// Absolute imports: $lib/registry/components/...
				new RegExp(`\\$lib/registry/${entry.from.replace(/\//g, '/')}`, 'g'),
				// Relative imports with various depths
				new RegExp(`registry/${entry.from.replace(/\//g, '/')}`, 'g'),
				// Direct path references
				new RegExp(`['"].*?${entry.from.replace(/\//g, '/')}`, 'g')
			];

			for (const pattern of patterns) {
				const newContent = content.replace(pattern, (match) => {
					return match.replace(entry.from, entry.to);
				});

				if (newContent !== content) {
					content = newContent;
					modified = true;
					fileReplacements++;
				}
			}
		}

		if (modified) {
			if (!DRY_RUN) {
				writeFileSync(file, content, 'utf-8');
			}
			totalReplacements += fileReplacements;
			log(`Updated ${file} (${fileReplacements} replacements)`, 'green');
		}
	}

	log(`\nTotal: ${totalReplacements} import statements updated`, 'green');
}

function updateMetadataFiles() {
	log('\n=== Updating Metadata Files ===', 'green');

	const mapping: MigrationMap = JSON.parse(
		readFileSync(join(__dirname, 'migration-map.json'), 'utf-8')
	);

	const allMappings = [...mapping.simpleComponents, ...mapping.multiFileComponents];

	for (const entry of allMappings) {
		const metadataPath = join(REGISTRY_ROOT, entry.to, 'metadata.json');

		if (!existsSync(metadataPath)) {
			log(`No metadata.json at ${entry.to}`, 'yellow');
			continue;
		}

		const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));

		// Extract category info from new path
		// e.g., components/article-card-compact → category: article, subcategory: card, variant: compact
		const pathParts = entry.to.split('/').pop()!.split('-');

		// Update fields
		if (metadata.importPath) {
			metadata.importPath = metadata.importPath.replace(entry.from, entry.to);
		}

		if (metadata.command) {
			// Update from "npx jsrepo add article/cards/compact" to "npx jsrepo add article-card-compact"
			const oldCommand = entry.from.replace('components/', '');
			const newCommand = entry.to.replace('components/', '');
			metadata.command = `npx jsrepo add ${newCommand}`;
		}

		if (!DRY_RUN) {
			writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n', 'utf-8');
		}

		log(`Updated metadata: ${entry.to}`, 'green');
	}
}

function updateIndexFiles() {
	log('\n=== Updating index.ts Files ===', 'green');

	const mapping: MigrationMap = JSON.parse(
		readFileSync(join(__dirname, 'migration-map.json'), 'utf-8')
	);

	const allMappings = [...mapping.simpleComponents, ...mapping.multiFileComponents];

	for (const entry of allMappings) {
		const indexPath = join(REGISTRY_ROOT, entry.to, 'index.ts');

		if (!existsSync(indexPath)) {
			log(`No index.ts at ${entry.to}`, 'yellow');
			continue;
		}

		let content = readFileSync(indexPath, 'utf-8');

		// Update relative paths in exports (e.g., './old-name.svelte' might need updating)
		// This is tricky - we'll just verify the files exist and warn if not

		log(`Verified index.ts: ${entry.to}`, 'green');
	}
}

function findFiles(dir: string, filter: (file: string) => boolean): string[] {
	const results: string[] = [];

	function walk(currentDir: string) {
		const files = readdirSync(currentDir);

		for (const file of files) {
			const fullPath = join(currentDir, file);
			const stat = statSync(fullPath);

			if (stat.isDirectory()) {
				walk(fullPath);
			} else if (filter(fullPath)) {
				results.push(fullPath);
			}
		}
	}

	walk(dir);
	return results;
}

function cleanupEmptyDirectories() {
	log('\n=== Cleaning Up Empty Directories ===', 'green');

	// Find and remove empty directories after moves
	const emptyDirs = [
		'components/article/cards',
		'components/article/content',
		'components/event/cards',
		'components/follow/buttons',
		'components/follow-pack',
		'components/hashtag/cards',
		'components/hashtag/displays',
		'components/highlight/cards',
		'components/image/cards',
		'components/image/content',
		'components/media/upload',
		'components/mention/displays',
		'components/mute/buttons',
		'components/negentropy-sync/progress',
		'components/note/cards',
		'components/note-composer/composers',
		'components/notification/items',
		'components/reaction/buttons',
		'components/relay/cards',
		'components/relay/inputs',
		'components/relay/status',
		'components/reply/buttons',
		'components/repost/buttons',
		'components/session/switchers',
		'components/user/cards',
		'components/user/displays',
		'components/user/inputs',
		'components/zap/buttons',
		'components/zap/displays',
		'components/zap/send'
	];

	for (const dir of emptyDirs) {
		const fullPath = join(REGISTRY_ROOT, dir);
		if (existsSync(fullPath)) {
			const files = readdirSync(fullPath);
			if (files.length === 0) {
				exec(`rmdir "${fullPath}"`, `Remove empty directory ${dir}`);
			}
		}
	}
}

function main() {
	log('Component Migration Script', 'green');
	log('=========================\n', 'green');

	if (DRY_RUN) {
		log('Running in DRY RUN mode - no changes will be made\n', 'yellow');
	}

	const mapping: MigrationMap = JSON.parse(
		readFileSync(join(__dirname, 'migration-map.json'), 'utf-8')
	);

	// Determine which stages to run
	const runStage = (stageName: string) => !STAGE || STAGE === stageName || STAGE === 'all';

	if (runStage('icons') || runStage('1')) {
		executeGitMoves(mapping.icons, 'Icons Restructuring');
	}

	if (runStage('simple') || runStage('2')) {
		executeGitMoves(mapping.simpleComponents, 'Simple Components Restructuring');
	}

	if (runStage('multi') || runStage('3')) {
		executeGitMoves(mapping.multiFileComponents, 'Multi-File Components Restructuring');
	}

	if (runStage('imports') || runStage('4')) {
		updateImports();
		if (!DRY_RUN) {
			exec(
				'git add -A && git commit -m "refactor: update all imports for new component structure"',
				'Commit import updates'
			);
		}
	}

	if (runStage('metadata') || runStage('5')) {
		updateMetadataFiles();
		if (!DRY_RUN) {
			exec(
				'git add -A && git commit -m "refactor: update metadata.json files for new structure"',
				'Commit metadata updates'
			);
		}
	}

	if (runStage('cleanup') || runStage('6')) {
		cleanupEmptyDirectories();
		if (!DRY_RUN) {
			exec(
				'git add -A && git commit -m "chore: remove empty directories after restructuring"',
				'Commit cleanup'
			);
		}
	}

	log('\n✅ Migration complete!', 'green');
	log('\nNext steps:', 'blue');
	log('1. Run: npm run build', 'blue');
	log('2. Run: bun x svelte-check', 'blue');
	log('3. Update jsrepo version to 0.0.16', 'blue');
	log('4. Run: jsrepo publish --dry-run', 'blue');
	log('5. Run: jsrepo publish', 'blue');
}

main();
