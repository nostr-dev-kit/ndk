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

## With String Byline

```svelte
<UserProfile {ndk} {user} byline="Journalist" />
<UserProfile {ndk} {user} byline="Developer" size="lg" />
```

## With Component Byline

```svelte
<script>
  import { User } from '$lib/registry/ui/user';
</script>

<UserProfile {ndk} {user} byline={User.Nip05} />
<UserProfile {ndk} {user} byline={User.Handle} />
```

## With Snippet Byline (Advanced)

```svelte
<script>
  import { User } from '$lib/registry/ui/user';

  const customByline = () => {
    return {
      render: () => `<div class="flex items-center gap-2">
        <User.Nip05 />
        <span>• 2h ago</span>
      </div>`
    };
  };
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
<UserProfile {ndk} {user} showAvatar={false} byline="Journalist" />
```

## Complete Example with All Options

```svelte
<UserProfile
  {ndk}
  {user}
  variant="stacked"
  size="lg"
  showAvatar={true}
  byline="Lead Developer"
  class="border rounded-lg p-4"
/>
```

## Real-world Use Cases

### Comment Header
```svelte
<UserProfile
  {ndk}
  {user}
  variant="inline"
  size="sm"
  byline={customTimeSnippet}
/>
```

### User List Item
```svelte
<UserProfile
  {ndk}
  {user}
  variant="horizontal"
  size="md"
  byline={User.Nip05}
/>
```

### Profile Card
```svelte
<UserProfile
  {ndk}
  {user}
  variant="stacked"
  size="lg"
  byline="Bitcoin Developer"
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
