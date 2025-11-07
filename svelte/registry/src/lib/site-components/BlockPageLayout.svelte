<script lang="ts">
  import type { Snippet } from 'svelte';
  import PageTitle from './PageTitle.svelte';
  import Breadcrumb from './Breadcrumb.svelte';

  interface BreadcrumbItem {
    label: string;
    href?: string;
  }

  interface Props {
    title: string;
    subtitle?: string;
    tags?: string[];
    breadcrumbs?: BreadcrumbItem[];
    topPreview: Snippet;
    children?: Snippet;
  }

  let { title, subtitle, tags, breadcrumbs, topPreview, children }: Props = $props();

  const breadcrumbItems = breadcrumbs || [
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
  {@render topPreview()}
</div>
