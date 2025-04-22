// scripts/publish.ts
// Usage: bun run scripts/publish.ts
// This script finds all package.json files in subdirectories, compares local and published versions, and runs bun publish if needed.

import { readdir, readFile } from "fs/promises";
import { join, relative, dirname } from "path";
import { spawn } from "child_process";
import prompts from "prompts";
import chalk from "chalk";

type PackageInfo = {
    name: string;
    version: string;
    dir: string;
    packageJsonPath: string;
    publishedVersion?: string | null;
};

const EXCLUDE_DIRS = new Set([
    "node_modules",
    "scripts",
    "docs",
    ".git",
    ".turbo",
    ".next",
    "test",
    "tests",
    "dist",
    "build",
]);

async function findPackageJsons(dir: string): Promise<PackageInfo[]> {
    const results: PackageInfo[] = [];
    async function walk(current: string) {
        const entries = await readdir(current, { withFileTypes: true });
        for (const entry of entries) {
            if (EXCLUDE_DIRS.has(entry.name)) continue;
            const fullPath = join(current, entry.name);
            if (entry.isDirectory()) {
                await walk(fullPath);
            } else if (entry.isFile() && entry.name === "package.json") {
                // Read and parse package.json
                try {
                    const pkgRaw = await readFile(fullPath, "utf8");
                    const pkg = JSON.parse(pkgRaw);
                    // Skip packages with private: true
                    if (pkg.name && pkg.version && !pkg.private) {
                        results.push({
                            name: pkg.name,
                            version: pkg.version,
                            dir: dirname(fullPath),
                            packageJsonPath: fullPath,
                        });
                    }
                } catch (e) {
                    console.error(`Failed to parse ${fullPath}:`, e);
                }
            }
        }
    }
    await walk(dir);
    return results;
}

function compareVersions(a: string, b: string): number {
    // Returns 1 if a > b, -1 if a < b, 0 if equal
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] ?? 0;
        const nb = pb[i] ?? 0;
        if (na > nb) return 1;
        if (na < nb) return -1;
    }
    return 0;
}

async function getPublishedVersion(pkgName: string): Promise<string | null> {
    return new Promise((resolve) => {
        const proc = spawn("npm", ["info", pkgName, "version"]);
        let data = "";
        proc.stdout.on("data", (chunk) => { data += chunk; });
        proc.on("close", (code) => {
            if (code === 0) {
                resolve(data.trim() || null);
            } else {
                resolve(null);
            }
        });
        proc.on("error", () => resolve(null));
    });
}

async function publishPackage(pkg: PackageInfo): Promise<boolean> {
    return new Promise((resolve) => {
        const proc = spawn("bun", ["publish"], { cwd: pkg.dir, stdio: "inherit" });
        proc.on("close", (code) => resolve(code === 0));
        proc.on("error", () => resolve(false));
    });
}

async function main() {
    const root = process.cwd();
    console.log("Scanning for packages...");
    const packages = await findPackageJsons(root);

    if (packages.length === 0) {
        console.log("No packages found.");
        return;
    }

    console.log("Checking package versions in parallel...");
    
    // Create an array of promises to check all packages in parallel
    const checkPromises = packages.map(async (pkg) => {
        const published = await getPublishedVersion(pkg.name);
        pkg.publishedVersion = published;
        return { pkg, published };
    });
    
    // Wait for all checks to complete in parallel
    const results = await Promise.all(checkPromises);
    
    // Process results
    const toPublish: PackageInfo[] = [];
    for (const { pkg, published } of results) {
        process.stdout.write(`Package ${pkg.name}: `);
        if (!published) {
            console.log("Not published yet. Will publish.");
            toPublish.push(pkg);
            continue;
        }
        const cmp = compareVersions(pkg.version, published);
        if (cmp > 0) {
            console.log(`Local version (${pkg.version}) > published (${published}). Will publish.`);
            toPublish.push(pkg);
        } else {
            console.log(`Up to date (local: ${pkg.version}, published: ${published}).`);
        }
    }

    if (toPublish.length === 0) {
        console.log("All packages are up to date. Nothing to publish.");
        return;
    }

    // Interactive selection
    console.log(`\nSelect packages to publish:`);
    const choices = toPublish.map((pkg) => {
        const name = chalk.cyan(pkg.name);
        const fromVer = pkg.publishedVersion
            ? chalk.yellow(pkg.publishedVersion)
            : chalk.gray("unpublished");
        const toVer = chalk.green(pkg.version);
        return {
            title: `${name} (${fromVer} → ${toVer})`,
            value: pkg,
            selected: true, // Default all checkboxes to true
        };
    });

    const response = await prompts({
        type: "multiselect",
        name: "selected",
        message: "Choose which packages to publish:",
        choices,
        min: 1,
        instructions: false,
        hint: "- Space to select. Enter to confirm.",
    });

    const selected: PackageInfo[] = response.selected || [];
    if (selected.length === 0) {
        console.log("No packages selected. Exiting.");
        return;
    }

    console.log(`\nPublishing ${selected.length} package(s):`);
    for (const pkg of selected) {
        console.log(
            `\nPublishing ${chalk.cyan(pkg.name)} (${chalk.yellow(
                pkg.publishedVersion || "unpublished"
            )} → ${chalk.green(pkg.version)}) in ${chalk.gray(relative(root, pkg.dir))}...`
        );
        const success = await publishPackage(pkg);
        if (success) {
            console.log(
                `Published ${chalk.cyan(pkg.name)}@${chalk.green(pkg.version)} successfully.`
            );
        } else {
            console.error(
                `Failed to publish ${chalk.cyan(pkg.name)}@${chalk.green(pkg.version)}.`
            );
        }
    }
}

main().catch((err) => {
    console.error("Error in publish script:", err);
    process.exit(1);
});