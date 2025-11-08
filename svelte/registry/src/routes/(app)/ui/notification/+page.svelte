<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import UIPrimitivePageTemplate from '$lib/site/templates/UIPrimitivePageTemplate.svelte';
  import Preview from '$site-components/Demo.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import * as NotificationItem from '$lib/registry/ui/notification';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import CustomLayout from './examples/custom-layout/index.svelte';
  import CustomLayoutRaw from './examples/custom-layout/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Mock notification for anatomy visualization
  const mockNotification = {
    type: 'reaction',
    count: 3,
    actors: ['pubkey1', 'pubkey2', 'pubkey3'],
    targetEvent: { id: 'event123', content: 'Sample post content' },
    timestamp: Date.now() - 3600000 // 1 hour ago
  };

  // Page metadata
  const metadata = {
    title: 'NotificationItem',
    description: 'Composable primitives for building notification UIs. Uses NDK\'s $metaSubscription to automatically group interactions (reactions, zaps, reposts, replies) by target event, providing a clean API for displaying "X, Y, and Z reacted to your post" style notifications.',
    importPath: 'ui/notification',
    nips: [],
    primitives: [
      {
        name: 'NotificationItem.Root',
        title: 'NotificationItem.Root',
        description: 'Context provider that sets up notification data for child primitives. Required wrapper for all NotificationItem primitives.',
        apiDocs: [
          { name: 'ndk', type: 'NDKSvelte', default: 'required', description: 'NDK instance' },
          { name: 'notification', type: 'NotificationGroup', default: 'required', description: 'Notification group from createNotificationFeed' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'NotificationItem.Actors',
        title: 'NotificationItem.Actors',
        description: 'Shows avatars of users who interacted with the event. Uses AvatarGroup internally and supports custom snippets for advanced layouts.',
        apiDocs: [
          { name: 'max', type: 'number', default: '5', description: 'Maximum avatars before showing overflow (+N indicator)' },
          { name: 'size', type: 'number', default: '32', description: 'Avatar size in pixels' },
          { name: 'spacing', type: "'tight' | 'normal' | 'loose'", default: "'tight'", description: 'Spacing between avatars' },
          { name: 'snippet', type: 'Snippet<[{ pubkeys: string[], count: number }]>', default: 'optional', description: 'Custom render snippet for full control' }
        ]
      },
      {
        name: 'NotificationItem.Action',
        title: 'NotificationItem.Action',
        description: 'Shows the interaction type (reacted, zapped, reposted, replied) with an icon and count. Automatically displays the appropriate icon based on the notification type.',
        apiDocs: [
          { name: 'snippet', type: 'Snippet<[{ type: string, count: number, icon: Component }]>', default: 'optional', description: 'Custom render snippet for full control over action display' }
        ]
      },
      {
        name: 'NotificationItem.Content',
        title: 'NotificationItem.Content',
        description: 'Renders the embedded event being interacted with using ContentRenderer and EmbeddedEvent. Automatically handles different event types with sensible defaults.',
        apiDocs: [
          { name: 'renderer', type: 'ContentRenderer', default: 'optional', description: 'Custom content renderer (has sensible defaults)' },
          { name: 'snippet', type: 'Snippet<[{ event: NDKEvent }]>', default: 'optional', description: 'Custom render snippet for full control' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'NotificationItem.Timestamp',
        title: 'NotificationItem.Timestamp',
        description: 'Shows relative time of the most recent interaction using createTimeAgo. Automatically updates every minute to keep the display current.',
        apiDocs: [
          { name: 'snippet', type: 'Snippet<[{ timestamp: number, formatted: string }]>', default: 'optional', description: 'Custom render snippet for full control' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      }
    ],
    anatomyLayers: [
      {
        id: 'root',
        label: 'NotificationItem.Root',
        description: 'Container that provides notification context to all child primitives.',
        props: ['ndk', 'notification', 'class']
      },
      {
        id: 'actors',
        label: 'NotificationItem.Actors',
        description: 'Avatars of users who performed the interaction.',
        props: ['max', 'size', 'spacing', 'snippet']
      },
      {
        id: 'action',
        label: 'NotificationItem.Action',
        description: 'Interaction type indicator with icon and count.',
        props: ['snippet']
      },
      {
        id: 'timestamp',
        label: 'NotificationItem.Timestamp',
        description: 'Relative time display (e.g., "2 hours ago").',
        props: ['snippet', 'class']
      },
      {
        id: 'content',
        label: 'NotificationItem.Content',
        description: 'Embedded event content being interacted with.',
        props: ['renderer', 'snippet', 'class']
      }
    ]
  };
</script>

<svelte:head>
  <title>Notification Primitives - NDK Svelte</title>
  <meta name="description" content="Composable primitives for building notification UIs. Uses $metaSubscription to group interactions by target event." />
</svelte:head>

<UIPrimitivePageTemplate {metadata} {ndk}>
  {#snippet topExample()}
    <Preview code={BasicRaw}>
      <Basic />
    </Preview>
  {/snippet}

  {#snippet overview()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Overview</h2>
      <p class="text-lg leading-relaxed text-muted-foreground mb-8">
        NotificationItem primitives provide composable components for building notification UIs in Nostr applications.
        They use NDK's <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">$metaSubscription</code> to automatically
        group interactions by target event, making it easy to display "X, Y, and Z reacted to your post" style notifications.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
      <p class="leading-relaxed mb-4">
        Use NotificationItem primitives when you need to:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Build notification feeds for social interactions</li>
        <li class="leading-relaxed">Display grouped interactions (reactions, zaps, reposts, replies)</li>
        <li class="leading-relaxed">Show who interacted with a user's posts or events</li>
        <li class="leading-relaxed">Create custom notification layouts with full styling control</li>
        <li class="leading-relaxed">Automatically group multiple interactions on the same event</li>
      </ul>
      <p class="leading-relaxed mt-4 text-muted-foreground">
        These primitives work with NDK's <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">createNotificationFeed</code> builder,
        which handles the complex logic of grouping interactions by target event using <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">$metaSubscription</code>.
      </p>
    </section>
  {/snippet}

  {#snippet anatomyPreview()}
    <NotificationItem.Root {ndk} notification={mockNotification}>
      <ComponentAnatomy.Layer id="root" label="NotificationItem.Root">
        <div class="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card max-w-md">
          <div class="flex items-center gap-3">
            <ComponentAnatomy.Layer id="actors" label="NotificationItem.Actors">
              <NotificationItem.Actors max={3} size={32} spacing="tight" />
            </ComponentAnatomy.Layer>
            <div class="flex-1 flex items-center gap-2">
              <ComponentAnatomy.Layer id="action" label="NotificationItem.Action">
                <NotificationItem.Action />
              </ComponentAnatomy.Layer>
              <ComponentAnatomy.Layer id="timestamp" label="NotificationItem.Timestamp">
                <NotificationItem.Timestamp class="text-xs text-muted-foreground" />
              </ComponentAnatomy.Layer>
            </div>
          </div>
          <ComponentAnatomy.Layer id="content" label="NotificationItem.Content">
            <NotificationItem.Content class="mt-2 p-3 bg-muted/50 rounded text-sm" />
          </ComponentAnatomy.Layer>
        </div>
      </ComponentAnatomy.Layer>
    </NotificationItem.Root>
  {/snippet}

  {#snippet examples()}
    <div>
      <h3 class="text-xl font-semibold mb-3">Custom Layout</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Create custom notification layouts by composing primitives with your own structure and styling.
        This example shows a different arrangement with custom styling.
      </p>
      <Preview
        title="Custom Layout"
        description="Create custom notification layouts by composing primitives differently."
        code={CustomLayoutRaw}
      >
        <CustomLayout />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Using createNotificationFeed</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Use NDK's <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">createNotificationFeed</code> to get grouped notifications
        for the current user. The feed automatically groups interactions by target event.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { createNotificationFeed } from '@nostr-dev-kit/svelte';

// Create notification feed for current user
const notificationFeed = createNotificationFeed(ndk, {
  // Optional: filter by interaction types
  types: ['reaction', 'zap', 'repost', 'reply']
});

// Access grouped notifications
$effect(() => {
  const notifications = notificationFeed.notifications;
  console.log(\`\${notifications.length} grouped notifications\`);
});`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Notification List Pattern</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Common pattern for displaying a list of notifications with proper grouping.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import { NotificationItem } from '$lib/registry/ui/notification';
import { createNotificationFeed } from '@nostr-dev-kit/svelte';

const notificationFeed = createNotificationFeed(ndk);
const notifications = $derived(notificationFeed.notifications);

{#each notifications as notification (notification.id)}
  <NotificationItem.Root {ndk} {notification}>
    <div class="notification-card">
      <div class="header">
        <NotificationItem.Actors max={5} />
        <NotificationItem.Action />
        <NotificationItem.Timestamp />
      </div>
      <NotificationItem.Content />
    </div>
  </NotificationItem.Root>
{/each}`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Custom Snippets</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Use custom snippets for complete control over how each primitive renders.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<NotificationItem.Root {ndk} {notification}>
  <!-- Custom actors display -->
  <NotificationItem.Actors>
    {#snippet snippet({ pubkeys, count })}
      <div class="custom-actors">
        {#each pubkeys as pubkey}
          <img src={getAvatar(pubkey)} alt="avatar" />
        {/each}
        {#if count > pubkeys.length}
          <span>+{count - pubkeys.length} more</span>
        {/if}
      </div>
    {/snippet}
  </NotificationItem.Actors>

  <!-- Custom action display -->
  <NotificationItem.Action>
    {#snippet snippet({ type, count, icon })}
      <div class="custom-action">
        <svelte:component this={icon} />
        <span>{type}</span>
        <span class="badge">{count}</span>
      </div>
    {/snippet}
  </NotificationItem.Action>
</NotificationItem.Root>`}
        />
      </div>
    </div>
  {/snippet}

  {#snippet contextSection()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">NotificationGroup Type</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Notifications are represented by the NotificationGroup type, which groups multiple interactions
        on the same target event. Created automatically by <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">createNotificationFeed</code>.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import type { NotificationGroup } from '@nostr-dev-kit/svelte';

interface NotificationGroup {
  id: string;                    // Unique notification ID
  type: 'reaction' | 'zap' | 'repost' | 'reply';
  count: number;                 // Number of interactions
  actors: string[];              // Pubkeys of users who interacted
  targetEvent: NDKEvent;         // Event being interacted with
  timestamp: number;             // Timestamp of most recent interaction
  events: NDKEvent[];            // All interaction events
}`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">$metaSubscription</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        The notification feed uses NDK's <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">$metaSubscription</code> feature,
        which automatically tracks and groups events that reference other events (via "e" tags). This enables
        efficient notification grouping without manual event processing.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`// $metaSubscription automatically:
// 1. Tracks events that reference other events
// 2. Groups them by target event
// 3. Provides counts and actor lists
// 4. Updates in real-time as new events arrive

const notificationFeed = createNotificationFeed(ndk);
// Returns grouped notifications via $metaSubscription`}
        />
      </div>
    </section>
  {/snippet}

  {#snippet relatedComponents()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/ui/user" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">User Primitives</strong>
          <span class="text-sm text-muted-foreground">For displaying notification actors</span>
        </a>
        <a href="/ui/reaction" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Reaction Primitives</strong>
          <span class="text-sm text-muted-foreground">For displaying reaction types</span>
        </a>
        <a href="/ui/zap" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Zap Primitives</strong>
          <span class="text-sm text-muted-foreground">For displaying zap information</span>
        </a>
      </div>
    </section>
  {/snippet}
</UIPrimitivePageTemplate>
