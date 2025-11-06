<script lang="ts">
  import type { Snippet } from 'svelte';
  import PageTitle from './PageTitle.svelte';
  import Breadcrumb from './Breadcrumb.svelte';
  import Preview from './preview.svelte';
  import PMCommand from '$lib/components/ui/pm-command/pm-command.svelte';

  interface BreadcrumbItem {
    label: string;
    href?: string;
  }

  interface Props {
    title: string;
    subtitle?: string;
    tags?: string[];
    blockName: string;
    installCommand: string;
    code: string;
    breadcrumbs?: BreadcrumbItem[];
    topPreview: Snippet;
    children?: Snippet;
  }

  let { title, subtitle, tags, blockName, installCommand, code, breadcrumbs, topPreview, children }: Props = $props();

  const breadcrumbItems = breadcrumbs || [
    { label: 'Blocks', href: '/blocks' },
    { label: title }
  ];

  // Parse install command to extract args
  // installCommand format: "npx ndk-svelte add login-compact"
  const commandArgs = $derived(
    installCommand.split(' ').filter(arg => arg !== 'npx' && arg !== 'pnpm' && arg !== 'npm' && arg !== 'yarn' && arg !== 'bun' && arg !== 'dlx' && arg !== 'exec')
  );
</script>

<div class="p-8">
  <Breadcrumb items={breadcrumbItems} />

  <PageTitle {title} {subtitle} {tags}>
    {#if children}
      {@render children()}
    {/if}
  </PageTitle>
</div>

<div class="max-w-7xl mx-auto px-8 pb-8">
  <div class="mb-8">
    <Preview title={title} {code} previewAreaClass="max-h-none">
      {@render topPreview()}
    </Preview>
  </div>

  <PMCommand command="execute" args={commandArgs} />
</div>
