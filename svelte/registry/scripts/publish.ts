#!/usr/bin/env bun
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { execSync } from 'child_process';

type VersionBump = 'major' | 'minor' | 'patch';

const CONFIG_PATH = resolve(process.cwd(), 'jsrepo.config.ts');

function bumpVersion(version: string, type: VersionBump): string {
	const [major, minor, patch] = version.split('.').map(Number);

	switch (type) {
		case 'major':
			return `${major + 1}.0.0`;
		case 'minor':
			return `${major}.${minor + 1}.0`;
		case 'patch':
			return `${major}.${minor}.${patch + 1}`;
	}
}

async function updateVersion(type: VersionBump) {
	const content = await readFile(CONFIG_PATH, 'utf-8');

	// Extract current version from REGISTRY_VERSION constant
	const versionMatch = content.match(/const REGISTRY_VERSION\s*=\s*["'](\d+\.\d+\.\d+)["']/);
	if (!versionMatch) {
		throw new Error('Could not find REGISTRY_VERSION in jsrepo.config.ts');
	}

	const oldVersion = versionMatch[1];
	const newVersion = bumpVersion(oldVersion, type);

	// Replace the version in the config file
	const newContent = content.replace(
		/const REGISTRY_VERSION\s*=\s*["']\d+\.\d+\.\d+["']/,
		`const REGISTRY_VERSION = "${newVersion}"`
	);

	await writeFile(CONFIG_PATH, newContent);

	console.log(`Version bumped: ${oldVersion} → ${newVersion}`);
	return newVersion;
}

async function buildRegistry() {
	console.log('Building registry...');
	try {
		execSync('jsrepo build', { stdio: 'inherit' });
		console.log('✅ Registry built successfully!');
	} catch (error) {
		console.error('❌ Registry build failed:', error);
		process.exit(1);
	}
}

async function publish() {
	console.log('Publishing to jsrepo...');
	try {
		execSync('jsrepo publish', { stdio: 'inherit' });
		console.log('✅ Published successfully!');
	} catch (error) {
		console.error('❌ Publishing failed:', error);
		process.exit(1);
	}
}

async function main() {
	const args = process.argv.slice(2);
	const bumpType = (args[0] || 'patch') as VersionBump;

	if (!['major', 'minor', 'patch'].includes(bumpType)) {
		console.error('Usage: bun run publish.ts [major|minor|patch]');
		console.error('Default: patch');
		process.exit(1);
	}

	const newVersion = await updateVersion(bumpType);
	await buildRegistry();
	await publish();

	console.log(`\n🎉 Successfully published version ${newVersion}`);
}

main();
