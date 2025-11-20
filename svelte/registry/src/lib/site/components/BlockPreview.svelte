<!--
BlockPreview component for displaying blocks with a file tree sidebar and code viewer.
Shows the preview, file structure, and allows browsing/viewing individual file contents.
Uses tabs to switch between preview and code views.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import CodeSnippet from './code-snippet.svelte';
	import PMCommand from '$lib/site/components/ui/pm-command/pm-command.svelte';
	import { cn } from '$lib/registry/utils/cn.js';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { FolderOpenIcon, FoldersIcon, File01Icon } from '@hugeicons/core-free-icons';
	import * as Tabs from '$lib/site/components/ui/tabs';

	interface FileNode {
		name: string;
		path: string;
		type: 'file' | 'directory';
		children?: FileNode[];
		content?: string;
	}

	interface Props {
		title: string;
		directory: string;
		installCommand: string;
		files: Record<string, string>; // Map of file paths to their content
		children: Snippet; // Preview snippet
		class?: string;
		previewAreaClass?: string;
	}

	let {
		title,
		directory,
		installCommand,
		files,
		children,
		class: className = '',
		previewAreaClass = ''
	}: Props = $props();

	// Parse install command to extract args
	const commandArgs = $derived(
		installCommand
			.split(' ')
			.filter(
				(arg) =>
					arg !== 'npx' &&
					arg !== 'pnpm' &&
					arg !== 'npm' &&
					arg !== 'yarn' &&
					arg !== 'bun' &&
					arg !== 'dlx' &&
					arg !== 'exec'
			)
	);

	// Build file tree from files object
	function buildFileTree(files: Record<string, string>): FileNode[] {
		const root: FileNode[] = [];
		const nodeMap = new SvelteMap<string, FileNode>();

		// Sort paths to ensure parents come before children
		const sortedPaths = Object.keys(files).sort();

		for (const filePath of sortedPaths) {
			const parts = filePath.split('/').filter(Boolean);
			let currentPath = '';
			let parentNodes = root;

			for (let i = 0; i < parts.length; i++) {
				const part = parts[i];
				currentPath = currentPath ? `${currentPath}/${part}` : part;
				const isFile = i === parts.length - 1;

				if (!nodeMap.has(currentPath)) {
					const node: FileNode = {
						name: part,
						path: currentPath,
						type: isFile ? 'file' : 'directory',
						...(isFile ? { content: files[filePath] } : { children: [] })
					};

					nodeMap.set(currentPath, node);
					parentNodes.push(node);

					if (!isFile) {
						parentNodes = node.children!;
					}
				} else if (!isFile) {
					parentNodes = nodeMap.get(currentPath)!.children!;
				}
			}
		}

		return root;
	}

	function findFirstFile(nodes: FileNode[]): FileNode | null {
		for (const node of nodes) {
			if (node.type === 'file') {
				return node;
			}
			if (node.children) {
				const found = findFirstFile(node.children);
				if (found) return found;
			}
		}
		return null;
	}

	const fileTree = $derived(buildFileTree(files));
	const expandedDirs = new SvelteMap<string, boolean>();
	let selectedFile = $state<FileNode | null>(null);

	// Initialize selected file to first file in tree
	$effect.pre(() => {
		if (!selectedFile && fileTree.length > 0) {
			selectedFile = findFirstFile(fileTree);
		}
	});

	function toggleDirectory(path: string) {
		if (expandedDirs.has(path)) {
			expandedDirs.delete(path);
		} else {
			expandedDirs.set(path, true);
		}
	}

	function selectFile(node: FileNode) {
		if (node.type === 'file') {
			selectedFile = node;
		}
	}

	function getFileExtension(filename: string): string {
		const ext = filename.split('.').pop()?.toLowerCase() || '';
		// Map to appropriate language for syntax highlighting
		const langMap: Record<string, string> = {
			svelte: 'svelte',
			ts: 'typescript',
			js: 'javascript',
			json: 'json',
			css: 'css',
			html: 'html',
			md: 'markdown',
			yml: 'yaml',
			yaml: 'yaml'
		};
		return langMap[ext] || 'plaintext';
	}
</script>

<section class="flex flex-col gap-4 {className}">
	<Tabs.Root value="preview">
		<!-- Header with Title and Tabs -->
		<div class="flex flex-col w-full border border-border rounded-lg">
			<div class="flex items-center justify-between px-4 py-2 border-b border-border">
				<h3 class="text-base font-bold text-foreground m-0">{title}</h3>
				<Tabs.List>
					<Tabs.Trigger value="preview">Preview</Tabs.Trigger>
					<Tabs.Trigger value="code">Code</Tabs.Trigger>
				</Tabs.List>
			</div>

			<!-- Preview Tab Content -->
			<Tabs.Content value="preview">
				<div class="max-h-[600px] overflow-y-auto {previewAreaClass}">
					<div class="p-8 flex justify-center items-center">
						{@render children()}
					</div>
				</div>
			</Tabs.Content>

			<!-- Code Tab Content -->
			<Tabs.Content value="code" class="m-0">
				<div class="flex w-full bg-muted/50" style="height: 600px;">
					<!-- File Tree Sidebar -->
					<div class="w-64 border-r border-border bg-card overflow-y-auto flex-shrink-0">
						<div class="p-4">
							<h4 class="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
								Files
							</h4>
							<div class="space-y-1">
								{#each fileTree as node (node.path)}
									{@render fileTreeNode(node, 0)}
								{/each}
							</div>
						</div>
					</div>

					<!-- Code Display Area -->
					<div class="flex-1 flex flex-col overflow-hidden">
						{#if selectedFile}
							<div class="px-4 py-3 border-b border-border bg-card flex-shrink-0">
								<div class="text-sm font-medium text-foreground">{selectedFile.name}</div>
								<div class="text-xs text-muted-foreground">{selectedFile.path}</div>
							</div>
							<div class="flex-1 overflow-auto">
								<CodeSnippet
									code={selectedFile.content || ''}
									lang={getFileExtension(selectedFile.name)}
									class="rounded-none border-none"
								/>
							</div>
						{:else}
							<div class="flex-1 flex items-center justify-center text-muted-foreground">
								Select a file to view its contents
							</div>
						{/if}
					</div>
				</div>
			</Tabs.Content>
		</div>
	</Tabs.Root>

	<!-- Installation Command -->
	<div class="w-full">
		<PMCommand command="execute" args={commandArgs} />
	</div>
</section>

{#snippet fileTreeNode(node: FileNode, depth: number)}
	{#if node.type === 'directory'}
		<div>
			<button
				class={cn(
					'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors text-left',
					expandedDirs.has(node.path) && 'text-foreground'
				)}
				style="padding-left: {depth * 12 + 8}px"
				onclick={() => toggleDirectory(node.path)}
			>
					{#if expandedDirs.has(node.path)}
						<HugeiconsIcon icon={FolderOpenIcon} size={12} color="red" />
					{:else}
						<HugeiconsIcon icon={FoldersIcon} size={12} />
					{/if}
				<span class="font-medium">{node.name}</span>
			</button>
			{#if expandedDirs.has(node.path) && node.children}
				{#each node.children as child (child.path)}
					{@render fileTreeNode(child, depth + 1)}
				{/each}
			{/if}
		</div>
	{:else}
		<button
			class={cn(
				'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-light hover:bg-accent transition-colors text-left',
				selectedFile?.path === node.path && 'bg-accent text-foreground font-medium'
			)}
			style="padding-left: {depth * 12 + 8}px"
			onclick={() => selectFile(node)}
		>
			<HugeiconsIcon icon={File01Icon} size={12} />
			<span>{node.name}</span>
		</button>
	{/if}
{/snippet}
