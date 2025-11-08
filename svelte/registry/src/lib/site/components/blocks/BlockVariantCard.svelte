<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    description: string;
    children?: {
      preview?: Snippet;
      code?: Snippet;
      props?: Snippet;
    };
  }

  let { title, description, children }: Props = $props();

  let activeTab = $state<'preview' | 'code' | 'props'>('preview');
</script>

<div class="bg-muted border border-border rounded-2xl overflow-hidden mb-8">
  <div class="p-6 border-b border-border">
    <h3 class="text-xl font-semibold mb-2">{title}</h3>
    <p class="text-muted-foreground text-[0.95rem]">{description}</p>
  </div>

  <div class="py-12 px-8 bg-background border-b border-border min-h-[400px] flex items-center justify-center">
    {@render children?.preview?.()}
  </div>

  <div class="flex gap-0 bg-muted border-b border-border">
    <button
      class="py-3.5 px-6 bg-transparent border-none text-muted-foreground text-sm font-medium cursor-pointer border-b-2 border-transparent transition-all hover:text-foreground hover:bg-accent {activeTab === 'preview' ? 'text-primary border-b-primary' : ''}"
      onclick={() => (activeTab = 'preview')}
    >
      Preview
    </button>
    {#if children?.code}
      <button
        class="py-3.5 px-6 bg-transparent border-none text-muted-foreground text-sm font-medium cursor-pointer border-b-2 border-transparent transition-all hover:text-foreground hover:bg-accent {activeTab === 'code' ? 'text-primary border-b-primary' : ''}"
        onclick={() => (activeTab = 'code')}
      >
        Code
      </button>
    {/if}
    {#if children?.props}
      <button
        class="py-3.5 px-6 bg-transparent border-none text-muted-foreground text-sm font-medium cursor-pointer border-b-2 border-transparent transition-all hover:text-foreground hover:bg-accent {activeTab === 'props' ? 'text-primary border-b-primary' : ''}"
        onclick={() => (activeTab = 'props')}
      >
        Props
      </button>
    {/if}
  </div>

  {#if activeTab === 'code' && children?.code}
    <div class="p-6 bg-background overflow-x-auto [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:text-foreground [&_pre]:m-0 [&_code]:font-[inherit]">
      {@render children.code()}
    </div>
  {:else if activeTab === 'props' && children?.props}
    <div class="p-6 bg-background overflow-x-auto [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:text-foreground [&_pre]:m-0 [&_code]:font-[inherit]">
      {@render children.props()}
    </div>
  {/if}
</div>
