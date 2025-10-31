<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKUser } from '@nostr-dev-kit/ndk';
	import { EditProps } from '$lib/components/ndk/edit-props';
	import Demo from '$site-components/Demo.svelte';

	// Import blocks
	import { UserProfileHero, UserCardClassic } from '$lib/components/ndk/blocks';
	import HeroCodeRaw from './examples/hero-code.svelte?raw';
	import ClassicCodeRaw from './examples/classic-code.svelte?raw';

	// Import examples
	import PrimitivesGridExample from './examples/primitives-grid.svelte';
	import PrimitivesGridExampleRaw from './examples/primitives-grid.svelte?raw';
	import PopoverCompositionExample from './examples/popover-composition.svelte';
	import PopoverCompositionCodeRaw from './examples/popover-composition-code.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	let users = $state<NDKUser[]>([]);
	let user1 = $state<NDKUser | undefined>();
	let user2 = $state<NDKUser | undefined>();
	let user3 = $state<NDKUser | undefined>();
	let user4 = $state<NDKUser | undefined>();
	let user5 = $state<NDKUser | undefined>();

	$effect(() => {
		(async () => {
			try {
				// Fetch some example users - following list or popular users
				const follows = ndk.activeUser ? await ndk.activeUser.follows() : null;
				const fetchedUsers = follows ? Array.from(follows).slice(0, 10) : [];

				// If no active user or no follows, fetch some popular pubkeys
				if (fetchedUsers.length === 0) {
					const popularPubkeys = [
						'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52', // pablo
						'3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d', // fiatjaf
						'82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2', // jack
						'e33fe65f1fde44c6dc17eeb38fdad0fceaf1cae8722084332ed1e32496291d42', // c-otto
						'32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245', // jb55
					];
					for (const pubkey of popularPubkeys) {
						const user = ndk.getUser({ pubkey });
						await user.fetchProfile();
						fetchedUsers.push(user);
					}
				}

				users = fetchedUsers;

				// Auto-initialize from fetched data
				if (users.length > 0) {
					if (!user1) user1 = users[0];
					if (!user2 && users.length > 1) user2 = users[1];
					if (!user3 && users.length > 2) user3 = users[2];
					if (!user4 && users.length > 3) user4 = users[3];
					if (!user5 && users.length > 4) user5 = users[4];
				}
			} catch (err) {
				console.error('Failed to fetch users:', err);
			}
		})();
	});

	const displayUsers = $derived([user1, user2, user3, user4, user5].filter(Boolean) as NDKUser[]);
	const examplePubkey = $derived(user1?.pubkey || '');
	const examplePubkeys = $derived(displayUsers.map(u => u.pubkey));
</script>

<div class="component-page">
	<header>
		<h1>UserProfile</h1>
		<p>Composable user profile display components with multiple layout variants.</p>

		{#key users}
			<EditProps.Root>
				<EditProps.Prop name="User 1" type="user" bind:value={user1} options={users} />
				<EditProps.Prop name="User 2" type="user" bind:value={user2} options={users} />
				<EditProps.Prop name="User 3" type="user" bind:value={user3} options={users} />
				<EditProps.Prop name="User 4" type="user" bind:value={user4} options={users} />
				<EditProps.Prop name="User 5" type="user" bind:value={user5} options={users} />
			</EditProps.Root>
		{/key}
	</header>

	{#if displayUsers.length > 0}
		<!-- Blocks Section -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-2">Blocks</h2>
			<p class="text-muted-foreground mb-8">
				Pre-composed layouts ready to use. Install with a single command.
			</p>

			<div class="space-y-12">
				<Demo
					title="Hero"
					description="Full-width profile header with banner, overlapping avatar, name, handle, bio, and follow button. Perfect for user profile pages."
					component="user-profile-hero"
					code={HeroCodeRaw}
				>
					{#if user1}
						<div class="w-full max-w-2xl">
							<UserProfileHero {ndk} pubkey={user1.pubkey} />
						</div>
					{/if}
				</Demo>
			</div>
		</section>

		<!-- Card Section -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-2">Cards</h2>
			<p class="text-muted-foreground mb-8">
				Compact user cards perfect for popovers, dialogs, and user lists.
			</p>

			<div class="space-y-12">
				<Demo
					title="Classic"
					description="Classic user card with banner, avatar, name, bio, and stats. Perfect for popovers or standalone displays."
					component="user-card-classic"
					code={ClassicCodeRaw}
				>
					{#if user1}
						<UserCardClassic {ndk} pubkey={user1.pubkey} />
					{/if}
				</Demo>

				<Demo
					title="Popover Composition"
					description="Combine UserProfile primitives with bits-ui Popover to create interactive hover cards. Shows how to compose cards with any trigger."
					code={PopoverCompositionCodeRaw}
				>
					<PopoverCompositionExample {ndk} pubkeys={examplePubkeys} />
				</Demo>
			</div>
		</section>

		<!-- UI Components Section -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-2">UI Components</h2>
			<p class="text-muted-foreground mb-8">
				Primitive components for building custom user profile layouts. Mix and match to create your own designs.
			</p>

			<div class="space-y-8">
				<Demo
					title="All Primitives"
					description="Complete overview of all UserProfile component primitives with common compositions. Each primitive can be used standalone or combined with others."
					code={PrimitivesGridExampleRaw}
				>
					<PrimitivesGridExample {ndk} pubkey={examplePubkey} />
				</Demo>
			</div>
		</section>

		<!-- Component API Section -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-2">Component API</h2>

			<div class="space-y-8">
				<div>
					<h3 class="text-xl font-semibold mb-2">UserProfile.Root</h3>
					<p class="text-muted-foreground mb-4">
						Root component that provides user context to all child components. Fetches and manages user profile data.
					</p>
					<div class="bg-muted/50 p-4 rounded-lg text-sm">
						<p class="mb-2"><strong>Props:</strong></p>
						<ul class="list-disc list-inside space-y-1 text-muted-foreground">
							<li><code>ndk?: NDKSvelte</code> - NDK instance (optional, falls back to context)</li>
							<li><code>user?: NDKUser</code> - User instance</li>
							<li><code>pubkey?: string</code> - User public key (alternative to user)</li>
							<li><code>profile?: NDKUserProfile</code> - Pre-loaded profile (optional, avoids fetch)</li>
							<li><code>showHoverCard?: boolean</code> - Show profile card on hover (default: true)</li>
							<li><code>onclick?: (e: MouseEvent) =&gt; void</code> - Click handler</li>
							<li><code>class?: string</code> - Additional CSS classes</li>
						</ul>
					</div>
				</div>

				<div>
					<h3 class="text-xl font-semibold mb-2">UserProfile.Avatar</h3>
					<p class="text-muted-foreground mb-4">
						Displays user avatar image with configurable size.
					</p>
					<div class="bg-muted/50 p-4 rounded-lg text-sm">
						<p class="mb-2"><strong>Props:</strong></p>
						<ul class="list-disc list-inside space-y-1 text-muted-foreground">
							<li><code>size?: number</code> - Avatar size in pixels (default: 48)</li>
							<li><code>fallback?: string</code> - Fallback image URL</li>
							<li><code>alt?: string</code> - Alt text for image</li>
							<li><code>class?: string</code> - Additional CSS classes</li>
						</ul>
					</div>
				</div>

				<div>
					<h3 class="text-xl font-semibold mb-2">UserProfile.Name</h3>
					<p class="text-muted-foreground mb-4">
						Displays user display name with fallback to username or truncated pubkey.
					</p>
					<div class="bg-muted/50 p-4 rounded-lg text-sm">
						<p class="mb-2"><strong>Props:</strong></p>
						<ul class="list-disc list-inside space-y-1 text-muted-foreground">
							<li><code>field?: 'displayName' | 'name' | 'both'</code> - Which name field to display (default: 'displayName')</li>
							<li><code>size?: string</code> - Text size classes (default: 'text-base')</li>
							<li><code>truncate?: boolean</code> - Truncate long names (default: true)</li>
							<li><code>class?: string</code> - Additional CSS classes</li>
						</ul>
					</div>
				</div>

				<div>
					<h3 class="text-xl font-semibold mb-2">UserProfile.Handle</h3>
					<p class="text-muted-foreground mb-4">
						Displays user handle (username) with @ prefix.
					</p>
					<div class="bg-muted/50 p-4 rounded-lg text-sm">
						<p class="mb-2"><strong>Props:</strong></p>
						<ul class="list-disc list-inside space-y-1 text-muted-foreground">
							<li><code>showAt?: boolean</code> - Show @ prefix (default: true)</li>
							<li><code>truncate?: boolean</code> - Truncate long handles (default: true)</li>
							<li><code>class?: string</code> - Additional CSS classes</li>
						</ul>
					</div>
				</div>

				<div>
					<h3 class="text-xl font-semibold mb-2">UserProfile.Nip05</h3>
					<p class="text-muted-foreground mb-4">
						Displays NIP-05 identifier with verification status.
					</p>
					<div class="bg-muted/50 p-4 rounded-lg text-sm">
						<p class="mb-2"><strong>Props:</strong></p>
						<ul class="list-disc list-inside space-y-1 text-muted-foreground">
							<li><code>showNip05?: boolean</code> - Show NIP-05 identifier (default: true)</li>
							<li><code>showVerified?: boolean</code> - Show verification checkmark (default: true)</li>
							<li><code>class?: string</code> - Additional CSS classes</li>
						</ul>
					</div>
				</div>

				<div>
					<h3 class="text-xl font-semibold mb-2">UserProfile.Bio</h3>
					<p class="text-muted-foreground mb-4">
						Displays user biography/about text.
					</p>
					<div class="bg-muted/50 p-4 rounded-lg text-sm">
						<p class="mb-2"><strong>Props:</strong></p>
						<ul class="list-disc list-inside space-y-1 text-muted-foreground">
							<li><code>maxLines?: number</code> - Maximum lines to display (default: 3)</li>
							<li><code>class?: string</code> - Additional CSS classes</li>
						</ul>
					</div>
				</div>

				<div>
					<h3 class="text-xl font-semibold mb-2">UserProfile.Banner</h3>
					<p class="text-muted-foreground mb-4">
						Displays user banner image with gradient fallback.
					</p>
					<div class="bg-muted/50 p-4 rounded-lg text-sm">
						<p class="mb-2"><strong>Props:</strong></p>
						<ul class="list-disc list-inside space-y-1 text-muted-foreground">
							<li><code>height?: string</code> - Height of the banner (default: '12rem')</li>
							<li><code>class?: string</code> - Additional CSS classes</li>
						</ul>
					</div>
				</div>

				<div>
					<h3 class="text-xl font-semibold mb-2">UserProfile.Field</h3>
					<p class="text-muted-foreground mb-4">
						Generic component to display any profile field.
					</p>
					<div class="bg-muted/50 p-4 rounded-lg text-sm">
						<p class="mb-2"><strong>Props:</strong></p>
						<ul class="list-disc list-inside space-y-1 text-muted-foreground">
							<li><code>field: keyof NDKUserProfile</code> - Profile field name (e.g., 'about', 'website', 'lud16')</li>
							<li><code>size?: string</code> - Text size classes (default: 'text-sm')</li>
							<li><code>maxLines?: number</code> - Maximum lines to display</li>
							<li><code>class?: string</code> - Additional CSS classes</li>
						</ul>
					</div>
				</div>

				<div>
					<h3 class="text-xl font-semibold mb-2">Follow Buttons</h3>
					<p class="text-muted-foreground mb-4">
						For follow/unfollow functionality, use the <a href="/components/follow-action" class="text-primary underline">FollowButton or FollowButtonPill blocks</a> from <code>$lib/ndk/blocks</code> instead of a UserProfile primitive.
					</p>
					<div class="bg-muted/50 p-4 rounded-lg text-sm">
						<p class="mb-2"><strong>Available Blocks:</strong></p>
						<ul class="list-disc list-inside space-y-1 text-muted-foreground">
							<li><code>FollowButton</code> - Minimal text-style button</li>
							<li><code>FollowButtonPill</code> - Rounded pill-style button with variants</li>
							<li><code>FollowButtonCard</code> - Large card-style button with gradients</li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	{:else}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading users...</div>
		</div>
	{/if}
</div>

