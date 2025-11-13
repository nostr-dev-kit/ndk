#!/usr/bin/env bun
import { spawn } from "child_process";
import { join } from "path";
import type { Readable } from "stream";

const filterPatterns = [/\/examples\//, /\.example\.svelte/];
const ansiRegex = /\u001B\[[0-9;]*m/g;
const args = ["--tsconfig", "./tsconfig.json", ...process.argv.slice(2)];
const executable = join(
	process.cwd(),
	"node_modules",
	".bin",
	process.platform === "win32" ? "svelte-check.cmd" : "svelte-check",
);

const checker = spawn(executable, args, {
	stdio: ["inherit", "pipe", "pipe"],
	env: process.env,
});

checker.on("error", (error) => {
	console.error("Failed to run svelte-check:", error);
	process.exit(1);
});

if (!checker.stdout || !checker.stderr) {
	console.error("svelte-check did not provide readable streams.");
	process.exit(1);
}

forwardFilteredOutput(checker.stdout, (chunk) => process.stdout.write(chunk));
forwardFilteredOutput(checker.stderr, (chunk) => process.stderr.write(chunk));

function forwardFilteredOutput(stream: Readable, write: (chunk: string) => void) {
	let buffer = "";

	stream.on("data", (data: Buffer) => {
		buffer += data.toString();
		const lines = buffer.split(/\r?\n/);
		buffer = lines.pop() ?? "";

		for (const line of lines) {
			if (!shouldFilter(line)) {
				write(`${line}\n`);
			}
		}
	});

	stream.on("end", () => {
		if (buffer && !shouldFilter(buffer)) {
			write(`${buffer}\n`);
		}
	});
}

function shouldFilter(line: string): boolean {
	const normalized = line.replace(ansiRegex, "");
	return filterPatterns.some((regex) => regex.test(normalized));
}

const forwardSignal = (signal: NodeJS.Signals) => {
	checker.kill(signal);
};

process.on("SIGINT", forwardSignal);
process.on("SIGTERM", forwardSignal);

checker.on("close", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}

	process.exit(code ?? 1);
});
