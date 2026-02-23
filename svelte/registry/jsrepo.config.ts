import { defineConfig } from "jsrepo";
import { repository } from "jsrepo/outputs";
import { readdirSync, statSync, existsSync } from "fs";
import { join, basename } from "path";
import { globSync } from "glob";

// Registry version - update this when publishing
const REGISTRY_VERSION = "0.0.59";

// File patterns to exclude from the registry
const EXCLUDE_PATTERNS = [
	"**/*.test.ts",
	"**/*.test.js",
	"**/*.spec.ts",
	"**/*.spec.js",
	"**/__screenshots__/**",
	"**/__tests__/**",
	"**/test-results/**",
	"**/playwright-report/**",
];

/**
 * Check if a file should be excluded based on patterns
 */
function shouldExclude(filePath: string): boolean {
	return EXCLUDE_PATTERNS.some((pattern) => {
		// Simple glob pattern matching
		if (pattern.includes("**")) {
			const regex = new RegExp(pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"));
			return regex.test(filePath);
		}
		return filePath.includes(pattern.replace(/\*/g, ""));
	});
}

/**
 * Get all files in a directory, excluding test files and other non-registry files
 */
function getRegistryFiles(dirPath: string, relativeTo: string): Array<{ path: string; role?: string }> {
	const files: Array<{ path: string; role?: string }> = [];

	function walkDir(currentPath: string) {
		const entries = readdirSync(currentPath);
		for (const entry of entries) {
			const fullPath = join(currentPath, entry);
			const relativePath = fullPath.replace(relativeTo + "/", "");
			const stat = statSync(fullPath);

			if (stat.isDirectory()) {
				walkDir(fullPath);
			} else {
				// Exclude test files and other non-registry files
				if (shouldExclude(relativePath)) continue;

				// Determine the role based on file type
				let role: string | undefined;
				if (entry.endsWith(".md")) {
					role = "doc";
				}

				files.push({ path: relativePath, ...(role && { role }) });
			}
		}
	}

	walkDir(dirPath);
	return files;
}

/**
 * Automatically discover registry items from the registry directory structure
 * Names are prefixed with category to ensure global uniqueness (e.g., "builders/avatar-group" vs "components/avatar-group")
 */
function discoverRegistryItems(cwd: string) {
	const registryDir = join(cwd, "src/lib/registry");
	const items: Array<{
		name: string;
		type: string;
		files: Array<{ path: string; role?: string }>;
		add?: "when-added" | "when-needed" | "on-init" | "optionally-on-init";
	}> = [];

	// Category directories to scan
	const categories = ["blocks", "builders", "components", "icons", "ui", "utils"];

	// First pass: collect all item names to detect duplicates
	const allNames = new Map<string, string[]>(); // name -> [category, ...]
	for (const category of categories) {
		const categoryPath = join(registryDir, category);
		if (!existsSync(categoryPath)) continue;

		const entries = readdirSync(categoryPath);
		for (const entry of entries) {
			const entryPath = join(categoryPath, entry);
			const stat = statSync(entryPath);

			let name: string;
			if (stat.isDirectory()) {
				name = entry;
			} else if (entry.endsWith(".svelte") || entry.endsWith(".ts")) {
				name = basename(entry, entry.endsWith(".svelte") ? ".svelte" : ".ts");
				if (name === "index") continue;
				// Skip test files
				if (name.endsWith(".test") || name.endsWith(".spec")) continue;
			} else {
				continue;
			}

			if (!allNames.has(name)) {
				allNames.set(name, []);
			}
			allNames.get(name)!.push(category);
		}
	}

	// Second pass: create items with unique names
	for (const category of categories) {
		const categoryPath = join(registryDir, category);
		if (!existsSync(categoryPath)) continue;

		const entries = readdirSync(categoryPath);

		for (const entry of entries) {
			const entryPath = join(categoryPath, entry);
			const stat = statSync(entryPath);

			let baseName: string;

			if (stat.isDirectory()) {
				baseName = entry;
				// For directories, get all files with explicit exclusions
				const files = getRegistryFiles(entryPath, cwd);

				// Skip if no files remain after exclusions
				if (files.length === 0) continue;

				// Use prefixed name if there are duplicates across categories
				const nameCategories = allNames.get(baseName) || [];
				const itemName = nameCategories.length > 1 ? `${category}/${baseName}` : baseName;

				items.push({
					name: itemName,
					type: category,
					files,
				});
			} else if (entry.endsWith(".svelte") || entry.endsWith(".ts")) {
				baseName = basename(entry, entry.endsWith(".svelte") ? ".svelte" : ".ts");
				if (baseName === "index") continue;
				// Skip test files
				if (baseName.endsWith(".test") || baseName.endsWith(".spec")) continue;

				const relativePath = `src/lib/registry/${category}/${entry}`;

				// Use prefixed name if there are duplicates across categories
				const nameCategories = allNames.get(baseName) || [];
				const itemName = nameCategories.length > 1 ? `${category}/${baseName}` : baseName;

				items.push({
					name: itemName,
					type: category,
					files: [{ path: relativePath }],
				});
			}
		}
	}

	return items;
}

export default defineConfig({
	// Consumer-side configuration (for adding items FROM other registries)
	registries: ["@ieedan/shadcn-svelte-extras"],
	paths: {
		"*": "./src/lib/site/",
		ui: "$lib/components/ui",
		hooks: "$lib/hooks",
		utils: "$lib/utils",
	},

	// Registry configuration (for building THIS registry)
	registry: ({ cwd }) => ({
		name: "@nostr/svelte",
		version: REGISTRY_VERSION,
		excludeDeps: ["svelte"],
		defaultPaths: {
			blocks: "src/lib/components/blocks",
			builders: "src/lib/components/builders",
			components: "src/lib/components",
			icons: "src/lib/components/icons",
			ui: "src/lib/components/ui",
			utils: "src/lib/utils",
		},
		outputs: [repository()],
		items: discoverRegistryItems(cwd),
	}),

	// Handle warnings for framework-specific imports and non-code files
	onwarn: (warning, handler) => {
		// Suppress warnings for SvelteKit internal imports
		if ("specifier" in warning) {
			const specifier = (warning as { specifier: string }).specifier;
			if (
				specifier.startsWith("$app/") ||
				specifier.startsWith("$lib/") ||
				specifier.startsWith("$env/")
			) {
				return; // Don't log this warning
			}
		}
		// Suppress warnings for non-code files (markdown, json, etc.)
		if ("path" in warning) {
			const path = (warning as { path: string }).path;
			if (
				path.endsWith(".md") ||
				path.endsWith(".json") ||
				path.endsWith(".png") ||
				path.endsWith(".svg") ||
				path.endsWith(".jpg") ||
				path.endsWith(".jpeg") ||
				path.endsWith(".gif")
			) {
				return; // Don't log this warning
			}
		}
		// Log all other warnings using the default handler
		handler(warning);
	},
});
