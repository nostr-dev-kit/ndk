# UserProfile Component Examples

## Basic Usage

```svelte
<script>
  import { UserProfile } from '$lib/registry/components/user-profile';
  import { getContext } from 'svelte';

  const ndk = getContext('ndk');
  const user = ndk.getUser({ pubkey: '...' });
</script>

<UserProfile {ndk} {user} />
```

## Variants

### Horizontal (default)
```svelte
<UserProfile {ndk} {user} variant="horizontal" />
```

### Stacked
```svelte
<UserProfile {ndk} {user} variant="stacked" />
```

### Inline
```svelte
<UserProfile {ndk} {user} variant="inline" />
```

### Compact
```svelte
<UserProfile {ndk} {user} variant="compact" />
```

## Sizes

```svelte
<!-- Extra small -->
<UserProfile {ndk} {user} size="xs" />

<!-- Small -->
<UserProfile {ndk} {user} size="sm" />

<!-- Medium (default) -->
<UserProfile {ndk} {user} size="md" />

<!-- Large -->
<UserProfile {ndk} {user} size="lg" />
```

## With Byline Snippet

The `byline` prop accepts a Snippet, giving you full control over the content displayed below the user's name.

### Simple Text Byline
```svelte
{#snippet jobTitle()}
  Journalist
{/snippet}

<UserProfile {ndk} {user} byline={jobTitle} />
```

### Using User Components
```svelte
<script>
  import { User } from '$lib/registry/ui/user';
</script>

{#snippet nip05Byline()}
  <User.Nip05 />
{/snippet}

<UserProfile {ndk} {user} byline={nip05Byline} />
```

### Complex Byline with Multiple Elements
```svelte
<script>
  import { User } from '$lib/registry/ui/user';
</script>

{#snippet customByline()}
  <div class="flex items-center gap-2">
    <User.Nip05 />
    <span class="text-muted-foreground">• 2h ago</span>
  </div>
{/snippet}

<UserProfile {ndk} {user} byline={customByline} />
```

## Without Avatar

```svelte
{#snippet role()}
  Journalist
{/snippet}

<UserProfile {ndk} {user} showAvatar={false} byline={role} />
```

## Complete Example with All Options

```svelte
{#snippet developerRole()}
  Lead Developer
{/snippet}

<UserProfile
  {ndk}
  {user}
  variant="stacked"
  size="lg"
  showAvatar={true}
  byline={developerRole}
  class="border rounded-lg p-4"
/>
```

## Real-world Use Cases

### Comment Header
```svelte
<script>
  import { formatRelativeTime } from '$lib/utils';

  let createdAt = $state(event.created_at);
</script>

{#snippet timeByline()}
  {formatRelativeTime(createdAt)}
{/snippet}

<UserProfile
  {ndk}
  {user}
  variant="inline"
  size="sm"
  byline={timeByline}
/>
```

### User List Item
```svelte
<script>
  import { User } from '$lib/registry/ui/user';
</script>

{#snippet nip05()}
  <User.Nip05 />
{/snippet}

<UserProfile
  {ndk}
  {user}
  variant="horizontal"
  size="md"
  byline={nip05}
/>
```

### Profile Card
```svelte
{#snippet title()}
  Bitcoin Developer
{/snippet}

<UserProfile
  {ndk}
  {user}
  variant="stacked"
  size="lg"
  byline={title}
  class="text-center"
/>
```

### Compact Mention
```svelte
<UserProfile
  {ndk}
  {user}
  variant="inline"
  size="xs"
  showAvatar={false}
/>
```
