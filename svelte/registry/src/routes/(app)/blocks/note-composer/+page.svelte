<script lang="ts">
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import BlockPageLayout from '$site-components/BlockPageLayout.svelte';
  import Preview from '$site-components/preview.svelte';
  import NoteComposerInline from '$lib/registry/components/note-composer/note-composer-inline.svelte';
  import NoteComposerModal from '$lib/registry/components/note-composer/note-composer-modal.svelte';
  import NoteComposerCard from '$lib/registry/components/note-composer/note-composer-card.svelte';
  import NoteComposerMinimal from '$lib/registry/components/note-composer/note-composer-minimal.svelte';

  // Import code examples
  import inlineExample from './examples/inline.example?raw';
  import cardExample from './examples/card.example?raw';
  import minimalExample from './examples/minimal.example?raw';
  import modalExample from './examples/modal.example?raw';
  import replyInlineExample from './examples/reply-inline.example?raw';
  import replyModalExample from './examples/reply-modal.example?raw';
  import customExample from './examples/custom.example?raw';
  // Create a sample event for reply examples
  const sampleEvent = new NDKEvent(ndk, {
    kind: 1,
    content: 'This is a sample note that you can reply to!',
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    id: 'sample123',
    tags: []
  } as any);

  let showModal = $state(false);
  let showReplyModal = $state(false);
</script>

<BlockPageLayout
  title="Note Composer"
  subtitle="Composable note and reply composer with support for mentions, media uploads, and multiple layout options. Build the perfect composer for your use case."
  tags={['Kind 1', 'Kind 1111', 'Media Upload', '4 variants']}
>
  {#snippet topPreview()}
    <Preview title="Note Composer" code={inlineExample} previewAreaClass="max-h-none">
      <div class="max-w-2xl">
        <NoteComposerInline
          {ndk}
          onPublish={(event: any) => {}}
        />
      </div>
    </Preview>
  {/snippet}
</BlockPageLayout>

<div class="max-w-7xl mx-auto px-8 pb-8">
  <section class="mb-16 space-y-8">
    <div>
      <h2 class="text-[1.75rem] font-bold mb-3">Variants</h2>
      <p class="text-muted-foreground mb-8 text-[1.05rem]">
        Choose from pre-built variants or compose your own using the primitives.
      </p>
    </div>

    <Preview title="Card Composer" code={cardExample} previewAreaClass="max-h-none">
      <div class="max-w-2xl">
        <NoteComposerCard
          {ndk}
          title="Share your thoughts"
          onPublish={(event: any) => {}}
        />
      </div>
    </Preview>

    <Preview title="Minimal Composer" code={minimalExample} previewAreaClass="max-h-none">
      <div class="max-w-2xl">
        <NoteComposerMinimal
          {ndk}
          placeholder="Quick note..."
          onPublish={(event: any) => {}}
        />
      </div>
    </Preview>

    <Preview title="Modal Composer" code={modalExample} previewAreaClass="max-h-none">
      <div class="flex gap-3">
        <button
          onclick={() => showModal = true}
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Open Composer
        </button>
      </div>
      <NoteComposerModal
        {ndk}
        bind:open={showModal}
        onPublish={(event: any) => {
          showModal = false;
        }}
      />
    </Preview>
  </section>

  <section class="mb-16 space-y-8">
    <div>
      <h2 class="text-[1.75rem] font-bold mb-3">Reply Support</h2>
      <p class="text-muted-foreground mb-8 text-[1.05rem]">
        Use the replyTo prop to create a reply. Automatically sets kind 1111 and adds proper e/p/root tags.
      </p>
    </div>

    <Preview title="Reply to Note" code={replyInlineExample} previewAreaClass="max-h-none">
      <div class="max-w-2xl space-y-4">
        <div class="p-4 border border-border rounded-lg bg-muted/30">
          <p class="text-sm text-muted-foreground mb-2">Original note:</p>
          <p>{sampleEvent.content}</p>
        </div>
        <NoteComposerInline
          {ndk}
          replyTo={sampleEvent}
          placeholder="Write your reply..."
          onPublish={(event: NDKEvent) => {}}
        />
      </div>
    </Preview>

    <Preview title="Reply Modal" code={replyModalExample} previewAreaClass="max-h-none">
      <div class="max-w-2xl space-y-4">
        <div class="p-4 border border-border rounded-lg bg-muted/30">
          <p class="text-sm text-muted-foreground mb-2">Original note:</p>
          <p>{sampleEvent.content}</p>
        </div>
        <button
          onclick={() => showReplyModal = true}
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Reply
        </button>
      </div>
      <NoteComposerModal
        {ndk}
        replyTo={sampleEvent}
        bind:open={showReplyModal}
        onPublish={(event: any) => {
          showReplyModal = false;
        }}
      />
    </Preview>
  </section>

  <section class="mb-16 space-y-8">
    <div>
      <h2 class="text-[1.75rem] font-bold mb-3">Custom Composition</h2>
      <p class="text-muted-foreground mb-8 text-[1.05rem]">
        Use the composable primitives to build custom composers that fit your exact needs.
      </p>
    </div>

    <Preview title="Build Your Own" code={customExample} previewAreaClass="max-h-none">
      <div class="max-w-2xl p-6 border border-border rounded-lg">
        <p class="text-sm text-muted-foreground mb-4">
          Import the <code class="text-xs bg-muted px-1 py-0.5 rounded">NoteComposer</code> primitives and compose them however you like.
        </p>
        <p class="text-sm text-muted-foreground">
          Available primitives: <code class="text-xs bg-muted px-1 py-0.5 rounded">Root</code>, <code class="text-xs bg-muted px-1 py-0.5 rounded">Textarea</code>, <code class="text-xs bg-muted px-1 py-0.5 rounded">MentionInput</code>, <code class="text-xs bg-muted px-1 py-0.5 rounded">Media</code>, <code class="text-xs bg-muted px-1 py-0.5 rounded">Submit</code>
        </p>
      </div>
    </Preview>
  </section>
</div>
