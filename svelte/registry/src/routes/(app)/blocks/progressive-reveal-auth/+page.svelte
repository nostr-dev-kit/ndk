<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import BlockPageLayout from '$site-components/BlockPageLayout.svelte';
  import BlockPreview from '$site-components/BlockPreview.svelte';
  import ProgressiveRevealAuth from '$lib/registry/blocks/progressive-reveal-auth/progressive-reveal-auth.svelte';
  import { Dialog } from 'bits-ui';

  const ndk = getContext<NDKSvelte>('ndk');

  let dialogOpen = $state(false);

  // Import all files from the progressive-reveal-auth directory
  const fileModules = import.meta.glob(
    '$lib/registry/blocks/progressive-reveal-auth/**/*.{svelte,ts,js,json,md}',
    {
      query: '?raw',
      import: 'default',
      eager: true
    }
  );

  // Convert to the format expected by BlockPreview
  const files: Record<string, string> = {};
  for (const [path, content] of Object.entries(fileModules)) {
    // Extract relative path from the full module path
    const relativePath = path.replace(/^.*blocks\/progressive-reveal-auth\//, '');
    files[relativePath] = content as string;
  }

  function handleComplete() {
    dialogOpen = false;
  }
</script>

<BlockPageLayout
  title="Progressive Reveal Auth"
  subtitle="A multi-step authentication and onboarding flow with accordion-based progressive disclosure. Demonstrates best practices for component composition with separate files for each section."
  tags={['Authentication', 'Onboarding', 'Multi-step', 'Composition']}
>
  {#snippet topPreview()}
    <BlockPreview
      title="Progressive Reveal Auth"
      directory="blocks/progressive-reveal-auth"
      installCommand="npx ndk-svelte add progressive-reveal-auth"
      {files}
      previewAreaClass="flex items-center justify-center min-h-[200px]"
    >
      <button
        onclick={() => dialogOpen = true}
        class="text-primary hover:underline text-lg font-medium"
      >
        Sign up
      </button>
    </BlockPreview>
  {/snippet}
</BlockPageLayout>

<div class="max-w-7xl mx-auto px-8 pb-8">

  <!-- Architecture Section -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-6">Architecture</h2>
    <div class="bg-muted border border-border rounded-xl p-6">
      <h3 class="text-lg font-semibold mb-4 text-foreground">Multi-File Component Composition</h3>
      <p class="text-muted-foreground text-sm leading-relaxed mb-4">
        This block demonstrates best practices for building complex flows using multiple focused files instead of a monolithic component:
      </p>
      <ul class="list-disc pl-6 space-y-2 text-muted-foreground text-sm mb-6">
        <li><strong>Separation of Concerns</strong>: Each section is its own component with clear responsibilities</li>
        <li><strong>Reusability</strong>: Section components can be used independently in other contexts</li>
        <li><strong>Maintainability</strong>: Changes to one section don't affect others</li>
        <li><strong>Testability</strong>: Each component can be tested in isolation</li>
        <li><strong>Code Organization</strong>: File structure mirrors the UI structure</li>
      </ul>

      <h3 class="text-lg font-semibold mb-4 text-foreground">File Structure</h3>
      <pre class="bg-background border border-border rounded-lg p-4 text-sm mb-6"><code>progressive-reveal-auth/
├── progressive-reveal-auth.svelte  # Main orchestrator component
├── auth-section.svelte             # Authentication step
├── interests-section.svelte        # Interest selection step
├── communities-section.svelte      # Community discovery step
├── complete-section.svelte         # Success state
├── index.ts                        # Barrel exports
└── README.md                       # Documentation</code></pre>

      <h3 class="text-lg font-semibold mb-4 text-foreground">Component Responsibilities</h3>
      <div class="space-y-3 text-sm">
        <div>
          <strong class="text-foreground">progressive-reveal-auth.svelte</strong>
          <p class="text-muted-foreground mt-1">Orchestrates the flow, manages accordion state, tracks selections, and coordinates transitions between sections.</p>
        </div>
        <div>
          <strong class="text-foreground">auth-section.svelte</strong>
          <p class="text-muted-foreground mt-1">Handles authentication - supports nsec, npub, NIP-05, browser extensions, and account creation.</p>
        </div>
        <div>
          <strong class="text-foreground">interests-section.svelte</strong>
          <p class="text-muted-foreground mt-1">Displays hashtag grid, manages tag selection, enforces minimum selection (3 tags).</p>
        </div>
        <div>
          <strong class="text-foreground">communities-section.svelte</strong>
          <p class="text-muted-foreground mt-1">Shows follow pack cards, manages pack selection state, no minimum requirement.</p>
        </div>
        <div>
          <strong class="text-foreground">complete-section.svelte</strong>
          <p class="text-muted-foreground mt-1">Displays success state and provides final call-to-action.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-6">Key Features</h2>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">📋 Progressive Disclosure</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Accordion interface reveals one step at a time while maintaining context of all steps with clear visual hierarchy.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">🔐 Flexible Authentication</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Supports nsec, npub, NIP-05, bunker://, and browser extensions for signing in, plus quick account creation.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">🎯 Interest Selection</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Visual hashtag grid with engagement metrics helps users personalize their feed from the start.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">👥 Community Discovery</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Follow pack selection with rich previews and member counts for quick community joining.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">✅ Visual Progress</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Clear step indicators show completion status and allow navigation between completed steps.</p>
      </div>

      <div class="bg-muted border border-border rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-3 text-foreground">🧩 Composable Design</h3>
        <p class="text-muted-foreground text-sm leading-relaxed m-0">Each section can be extracted and used independently, making the block highly adaptable.</p>
      </div>
    </div>
  </section>

  <!-- Component API Section -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-6">Component API</h2>

    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">ProgressiveRevealAuth</h3>
      <table class="w-full bg-muted border border-border rounded-xl overflow-hidden border-collapse">
        <thead>
          <tr>
            <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Prop</th>
            <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Type</th>
            <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Default</th>
            <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">ndk</code></td>
            <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">NDKSvelte</code></td>
            <td class="p-4 border-b border-border text-sm">—</td>
            <td class="p-4 border-b border-border text-sm">NDK instance (optional if provided via context)</td>
          </tr>
          <tr>
            <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">onComplete</code></td>
            <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">() => void</code></td>
            <td class="p-4 border-b border-border text-sm">—</td>
            <td class="p-4 border-b border-border text-sm">Callback invoked when the user completes all steps</td>
          </tr>
          <tr>
            <td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">class</code></td>
            <td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">string</code></td>
            <td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">""</code></td>
            <td class="p-4 border-b-0 text-sm">Additional CSS classes</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">Section Components</h3>
      <p class="text-sm text-muted-foreground mb-4">Each section component accepts NDK and an onComplete callback:</p>
      <ul class="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
        <li><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">AuthSection</code> - <code>onComplete(signer?: NDKPrivateKeySigner)</code></li>
        <li><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">InterestsSection</code> - <code>onComplete(interests: string[])</code></li>
        <li><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">CommunitiesSection</code> - <code>onComplete(communities: string[])</code></li>
        <li><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">CompleteSection</code> - <code>onFinish()</code></li>
      </ul>
    </div>
  </section>

  <!-- Communication Pattern -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-6">Communication Pattern</h2>
    <div class="bg-muted border border-border rounded-xl p-6">
      <p class="text-muted-foreground text-sm leading-relaxed mb-4">
        Components use <strong>callback props</strong> for upward communication:
      </p>
      <ol class="list-decimal pl-6 space-y-3 text-muted-foreground text-sm">
        <li>Parent passes <code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">onComplete</code> callback to each section</li>
        <li>Section completes its task (e.g., user selects interests)</li>
        <li>Section calls <code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">onComplete(data)</code> with relevant data</li>
        <li>Parent receives data, stores it, and transitions to next section</li>
      </ol>
      <p class="text-muted-foreground text-sm leading-relaxed mt-4">
        This pattern avoids prop drilling and keeps components loosely coupled while maintaining clear data flow.
      </p>
    </div>
  </section>

  <!-- How It Works -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-6">How It Works</h2>
    <div class="bg-muted border border-border rounded-xl p-6">
      <h3 class="text-lg font-semibold mb-4 text-foreground">Section Flow</h3>
      <ol class="list-decimal pl-6 space-y-3 text-muted-foreground text-sm mb-6">
        <li>
          <strong>Authentication</strong>: User signs in with existing credentials or creates a new account.
          On completion, passes optional <code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">NDKPrivateKeySigner</code> if new account was created.
        </li>
        <li>
          <strong>Interests</strong>: User selects hashtags from a grid (minimum 3 required).
          Passes selected tags array on completion.
        </li>
        <li>
          <strong>Communities</strong>: User selects follow packs to join (no minimum).
          Passes selected pack IDs on completion.
        </li>
        <li>
          <strong>Complete</strong>: Shows success message and calls <code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">onFinish</code> when user proceeds.
        </li>
      </ol>

      <h3 class="text-lg font-semibold mb-4 text-foreground">Accordion Behavior</h3>
      <ul class="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
        <li>Sections expand/collapse with smooth CSS transitions</li>
        <li>Completed sections can be reopened to review or edit choices</li>
        <li>Active section highlighted with primary background color</li>
        <li>Step numbers show completion with checkmarks (✓)</li>
        <li>Only one section is active (expanded) at a time</li>
        <li>DOM manipulation via <code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">querySelector</code> for smooth UX</li>
      </ul>
    </div>
  </section>
</div>

{#if dialogOpen}
  <Dialog.Root bind:open={dialogOpen}>
    <Dialog.Portal>
      <Dialog.Overlay class="fixed inset-0 z-50 bg-black/80" />
      <Dialog.Content
        class="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw] max-w-[700px] translate-x-[-50%] translate-y-[-50%] overflow-y-auto"
      >
        <Dialog.Close
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" ></path>
          </svg>
          <span class="sr-only">Close</span>
        </Dialog.Close>

        <ProgressiveRevealAuth {ndk} onComplete={handleComplete} />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
{/if}
