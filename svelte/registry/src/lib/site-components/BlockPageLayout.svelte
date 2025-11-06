<script lang="ts">
  import type { Snippet } from 'svelte';
  import PageTitle from './PageTitle.svelte';
  import Breadcrumb from './Breadcrumb.svelte';
  import BlockInstallSection from './blocks/BlockInstallSection.svelte';

  interface Props {
    title: string;
    subtitle?: string;
    tags?: string[];
    blockName: string;
    installCommand: string;
    children?: Snippet;
  }

  let { title, subtitle, tags, blockName, installCommand, children }: Props = $props();

  const breadcrumbItems = [
    { label: 'Blocks', href: '/blocks' },
    { label: title }
  ];
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
  <BlockInstallSection command={installCommand} />
</div>
