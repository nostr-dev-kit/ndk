<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
</script>

<section class="border-b border-border">
  <div class="w-full px-4">
    <div class="flex flex-col items-center gap-6 py-16 text-center md:py-24 lg:py-32 lg:gap-8">
      <h1 class="max-w-[42rem] text-[2.5rem] font-semibold leading-tight tracking-tight text-foreground m-0 xl:text-[3.5rem] xl:tracking-tighter" style="text-wrap: balance;">
        NDK Svelte Components
      </h1>

      <p class="max-w-[48rem] text-base leading-relaxed text-muted-foreground m-0 sm:text-lg" style="text-wrap: balance;">
        A collection of production-ready Nostr components built with Svelte 5 and NDK.
        Copy and paste into your apps. Open Source. Free forever.
      </p>

      <div class="flex gap-2 flex-wrap justify-center">
        <span class="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm font-medium border border-border">Svelte 5 Runes</span>
        <span class="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm font-medium border border-border">TypeScript</span>
        <span class="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm font-medium border border-border">Shadcn-style Registry</span>
      </div>

      <div class="flex w-full items-center justify-center gap-3 pt-2 flex-wrap">
        <a href="/docs" class="inline-flex flex-shrink-0 items-center justify-center whitespace-nowrap no-underline text-sm font-medium outline-none transition-all duration-150 ease-in-out rounded-md h-10 gap-1.5 px-6 cursor-pointer bg-primary text-primary-foreground shadow-sm hover:bg-[color-mix(in_srgb,var(--primary)_90%,transparent)]">
          Get Started
        </a>
        <a href="/blocks" class="inline-flex flex-shrink-0 items-center justify-center whitespace-nowrap no-underline text-sm font-medium outline-none transition-all duration-150 ease-in-out rounded-md h-10 gap-1.5 px-6 cursor-pointer bg-transparent border border-border text-foreground hover:bg-accent">
          Browse Blocks
        </a>
      </div>
    </div>
  </div>
</section>

<section class="py-12 md:py-16">
  <div class="w-full px-4">
    <div class="text-center">
      <h2 class="text-[2rem] font-bold m-0 mb-4 text-foreground tracking-tight">Built for Nostr Developers</h2>
      <p class="text-base leading-relaxed text-muted-foreground max-w-[48rem] mx-auto m-0">
        All components are built with Svelte 5's new runes API and work seamlessly with NDK.
        Browse the components in the sidebar to see live examples and usage documentation.
      </p>
    </div>
  </div>
</section>

<section class="py-12 md:py-16 bg-muted">
  <div class="w-full px-4">
    <div>
      <h3 class="m-0 mb-6 text-xl font-semibold text-foreground text-center">Connection Status</h3>
      <div class="flex flex-col gap-2">
        {#if ndk.pool}
          {#each ndk.pool.relays.values() as relay (relay)}
            <div class="flex justify-between items-center px-4 py-3 bg-background rounded-md border border-border">
              <span class="font-mono text-sm text-foreground">{relay.url}</span>
              <span class="text-sm font-medium flex items-center gap-2" class:text-success={relay.status === 1} class:text-muted-foreground={relay.status !== 1}>
                {relay.status === 1 ? '🟢 Connected' : '🔴 Disconnected'}
              </span>
            </div>
          {/each}
        {:else}
          <p>Connecting to relays...</p>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .text-success {
    color: var(--success);
  }
</style>
