<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import Demo from '$site-components/Demo.svelte';
  import NoteComposerInline from '$lib/registry/components/blocks/note-composer-inline.svelte';
  import NoteComposerModal from '$lib/registry/components/blocks/note-composer-modal.svelte';
  import NoteComposerCard from '$lib/registry/components/blocks/note-composer-card.svelte';
  import NoteComposerMinimal from '$lib/registry/components/blocks/note-composer-minimal.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

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

<div class="component-page">
  <header>
    <h1>Note Composer</h1>
    <p>Composable note and reply composer with support for mentions, media uploads, and multiple layout options. Build the perfect composer for your use case.</p>
  </header>

  <section class="demo space-y-12">
    <h2 class="text-2xl font-semibold mb-4">Variants</h2>

    <Demo
      title="Inline Composer"
      description="Compact inline composer with all features. Perfect for embedding in pages or feeds."
      code={`<script>
  import { NoteComposerInline } from '@nostr-dev-kit/svelte-registry/blocks';
</script>

<NoteComposerInline
  {ndk}
  onPublish={(event) => console.log('Published:', event)}
/>`}
    >
      <div class="max-w-2xl">
        <NoteComposerInline
          {ndk}
          onPublish={(event) => console.log('Published:', event)}
        />
      </div>
    </Demo>

    <Demo
      title="Card Composer"
      description="Note composer in a card layout with border and shadow. Great for prominent placement."
      code={`<script>
  import { NoteComposerCard } from '@nostr-dev-kit/svelte-registry/blocks';
</script>

<NoteComposerCard
  {ndk}
  title="Share your thoughts"
  onPublish={(event) => console.log('Published:', event)}
/>`}
    >
      <div class="max-w-2xl">
        <NoteComposerCard
          {ndk}
          title="Share your thoughts"
          onPublish={(event) => console.log('Published:', event)}
        />
      </div>
    </Demo>

    <Demo
      title="Minimal Composer"
      description="Minimal composer with just textarea and submit button. Perfect for quick notes or replies."
      code={`<script>
  import { NoteComposerMinimal } from '@nostr-dev-kit/svelte-registry/blocks';
</script>

<NoteComposerMinimal
  {ndk}
  placeholder="Quick note..."
  onPublish={(event) => console.log('Published:', event)}
/>`}
    >
      <div class="max-w-2xl">
        <NoteComposerMinimal
          {ndk}
          placeholder="Quick note..."
          onPublish={(event) => console.log('Published:', event)}
        />
      </div>
    </Demo>

    <Demo
      title="Modal Composer"
      description="Full-featured composer in a modal dialog. Gives users space for longer notes."
      code={`<script>
  import { NoteComposerModal } from '@nostr-dev-kit/svelte-registry/blocks';
  let open = $state(false);
</script>

<button onclick={() => open = true}>Compose Note</button>
<NoteComposerModal
  {ndk}
  bind:open
  onPublish={(event) => {
    console.log('Published:', event);
    open = false;
  }}
/>`}
    >
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
        onPublish={(event) => {
          console.log('Published:', event);
          showModal = false;
        }}
      />
    </Demo>

    <h2 class="text-2xl font-semibold mb-4 mt-12">Reply Support</h2>

    <Demo
      title="Reply to Note"
      description="Use the replyTo prop to create a reply. Automatically sets kind 1111 and adds proper e/p/root tags."
      code={`<script>
  import { NoteComposerInline } from '@nostr-dev-kit/svelte-registry/blocks';
  // event is the note you're replying to
</script>

<NoteComposerInline
  {ndk}
  replyTo={event}
  onPublish={(reply) => console.log('Reply published:', reply)}
/>`}
    >
      <div class="max-w-2xl space-y-4">
        <div class="p-4 border border-border rounded-lg bg-muted/30">
          <p class="text-sm text-muted-foreground mb-2">Original note:</p>
          <p>{sampleEvent.content}</p>
        </div>
        <NoteComposerInline
          {ndk}
          replyTo={sampleEvent}
          placeholder="Write your reply..."
          onPublish={(event) => console.log('Reply published:', event)}
        />
      </div>
    </Demo>

    <Demo
      title="Reply Modal"
      description="Modal composer for replies gives users more space for detailed responses."
      code={`<script>
  import { NoteComposerModal } from '@nostr-dev-kit/svelte-registry/blocks';
  let open = $state(false);
</script>

<button onclick={() => open = true}>Reply</button>
<NoteComposerModal
  {ndk}
  replyTo={event}
  bind:open
/>`}
    >
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
        onPublish={(event) => {
          console.log('Reply published:', event);
          showReplyModal = false;
        }}
      />
    </Demo>

    <h2 class="text-2xl font-semibold mb-4 mt-12">Custom Composition</h2>

    <Demo
      title="Build Your Own"
      description="Use the composable primitives to build custom composers that fit your exact needs."
      code={`<script>
  import { NoteComposer } from '@nostr-dev-kit/svelte-registry/components/note-composer';
</script>

<NoteComposer.Root {ndk}>
  <div class="space-y-4">
    <NoteComposer.Textarea placeholder="Custom composer..." />
    <div class="flex gap-2">
      <NoteComposer.MentionInput />
      <NoteComposer.Media />
    </div>
    <NoteComposer.Submit variant="outline" />
  </div>
</NoteComposer.Root>`}
    >
      <div class="max-w-2xl p-6 border border-border rounded-lg">
        <p class="text-sm text-muted-foreground mb-4">
          Import the <code class="text-xs bg-muted px-1 py-0.5 rounded">NoteComposer</code> primitives and compose them however you like.
        </p>
        <p class="text-sm text-muted-foreground">
          Available primitives: <code class="text-xs bg-muted px-1 py-0.5 rounded">Root</code>, <code class="text-xs bg-muted px-1 py-0.5 rounded">Textarea</code>, <code class="text-xs bg-muted px-1 py-0.5 rounded">MentionInput</code>, <code class="text-xs bg-muted px-1 py-0.5 rounded">Media</code>, <code class="text-xs bg-muted px-1 py-0.5 rounded">Submit</code>
        </p>
      </div>
    </Demo>
  </section>
</div>
