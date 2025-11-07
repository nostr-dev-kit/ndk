# Progressive Reveal Auth Block

A multi-file authentication and onboarding block demonstrating best practices for component composition in Svelte 5.

## Architecture

This block is intentionally structured as multiple files to demonstrate:

1. **Separation of Concerns**: Each section is an independent component
2. **Reusability**: Section components can be used independently
3. **Maintainability**: Changes to one section don't affect others
4. **Testability**: Each component can be tested in isolation
5. **Code Organization**: Clear file structure mirrors the UI structure

## File Structure

```
progressive-reveal-auth/
├── progressive-reveal-auth.svelte  # Main orchestrator component
├── auth-section.svelte             # Authentication step (login/signup)
├── interests-section.svelte        # Interest selection step
├── communities-section.svelte      # Community discovery step
├── complete-section.svelte         # Success state
├── index.ts                        # Barrel exports
└── README.md                       # This file
```

## Component Responsibilities

### `progressive-reveal-auth.svelte` (Main)
- Orchestrates the overall flow
- Manages accordion state (which section is active)
- Tracks selected interests and communities
- Coordinates section transitions
- Provides the accordion UI shell

### `auth-section.svelte`
- Handles both login and signup
- Supports multiple auth methods (nsec, npub, NIP-05, browser extension)
- Validates credentials
- Calls `onComplete` when auth succeeds

### `interests-section.svelte`
- Displays hashtag grid
- Manages tag selection state
- Enforces minimum selection (3 tags)
- Passes selections to parent via `onComplete`

### `communities-section.svelte`
- Shows follow pack cards
- Manages pack selection state
- No minimum requirement
- Passes selections to parent via `onComplete`

### `complete-section.svelte`
- Displays success state
- Provides final CTA
- Calls `onFinish` to complete flow

## Usage

```svelte
<script lang="ts">
  import { ProgressiveRevealAuth } from '$lib/registry/blocks/progressive-reveal-auth';
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  function handleComplete() {
    console.log('User completed onboarding!');
    // Navigate to main app, show success message, etc.
  }
</script>

<ProgressiveRevealAuth {ndk} onComplete={handleComplete} />
```

## Using Individual Sections

Each section can also be used independently:

```svelte
<script lang="ts">
  import { AuthSection } from '$lib/registry/blocks/progressive-reveal-auth';
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  function handleAuthComplete(signer) {
    console.log('Auth complete:', signer);
  }
</script>

<AuthSection {ndk} onComplete={handleAuthComplete} />
```

## Communication Pattern

The components use **callback props** for upward communication:

1. Parent passes `onComplete` callback to each section
2. Section completes its task
3. Section calls `onComplete(data)` with relevant data
4. Parent receives data and transitions to next section

This pattern avoids prop drilling and keeps components loosely coupled.

## State Management

- **Local State**: Each section manages its own form state
- **Parent State**: Main component tracks:
  - Current active section
  - Selected interests
  - Selected communities
  - Created signer (if new account)

## Styling

Each component has its own scoped styles. The main component provides:
- Accordion container styling
- Section transition animations
- Header state styling (active/completed)
- Consistent spacing and layout

## Extension Points

To customize or extend this block:

1. **Add new sections**: Create a new section component and add it to the accordion
2. **Change flow**: Reorder sections or add conditional logic
3. **Customize data**: Modify the interests/communities arrays
4. **Change validation**: Adjust minimum requirements in sections
5. **Styling**: Override CSS custom properties or add classes

## Best Practices Demonstrated

✅ **Component Composition**: Building complex UIs from simple components
✅ **Single Responsibility**: Each component has one clear purpose
✅ **Callback Communication**: Using props for parent-child communication
✅ **TypeScript Interfaces**: Proper typing for all props
✅ **Svelte 5 Runes**: Modern state management with `$state`, `$derived`, `$props`
✅ **Accessibility**: Proper button types, semantic HTML
✅ **Progressive Enhancement**: Works without JavaScript for basic navigation
