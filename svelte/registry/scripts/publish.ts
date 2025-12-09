#!/usr/bin/env bun
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { execSync } from 'child_process';

type VersionBump = 'major' | 'minor' | 'patch';

const CONFIG_PATH = resolve(process.cwd(), 'jsrepo-build-config.json');

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
	const config = JSON.parse(content);

	const oldVersion = config.version;
	const newVersion = bumpVersion(oldVersion, type);

	config.version = newVersion;

	await writeFile(CONFIG_PATH, JSON.stringify(config, null, '\t') + '\n');

	console.log(`Version bumped: ${oldVersion} → ${newVersion}`);
	return newVersion;
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
	await publish();

	console.log(`\n🎉 Successfully published version ${newVersion}`);
}

main();
