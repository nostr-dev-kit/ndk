<script lang="ts">
  import type { Snippet } from 'svelte';
  import PageTitle from './PageTitle.svelte';
  import Breadcrumb from './Breadcrumb.svelte';

  interface Props {
    title: string;
    subtitle?: string;
    blockName: string;
    children?: Snippet;
  }

  let { title, subtitle, blockName, children }: Props = $props();

  const breadcrumbItems = [
    { label: 'Blocks', href: '/blocks' },
    { label: title }
  ];
</script>

<div class="p-8">
  <Breadcrumb items={breadcrumbItems} />

  <PageTitle {title} {subtitle}>
    {#if children}
      {@render children()}
    {/if}
  </PageTitle>
</div>
