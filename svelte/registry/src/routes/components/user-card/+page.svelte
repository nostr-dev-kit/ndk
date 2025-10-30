<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKUser } from '@nostr-dev-kit/ndk';
	import { EditProps } from '$lib/ndk/edit-props';
	import Demo from '$site-components/Demo.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';

	// Import blocks
	import {
		UserCardClassic,
		UserCardPortrait,
		UserCardLandscape,
		UserCardCompact
	} from '$lib/ndk/blocks';
	import ClassicCodeRaw from '../user-profile/examples/classic-code.svelte?raw';
	import PortraitCodeRaw from './examples/portrait-code.svelte?raw';
	import LandscapeCodeRaw from './examples/landscape-code.svelte?raw';
	import CompactCodeRaw from './examples/compact-code.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');

	let users = $state<NDKUser[]>([]);
	let user1 = $state<NDKUser | undefined>();
	let user2 = $state<NDKUser | undefined>();
	let user3 = $state<NDKUser | undefined>();

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
				}
			} catch (err) {
				console.error('Failed to fetch users:', err);
			}
		})();
	});

	const displayUsers = $derived([user1, user2, user3].filter(Boolean) as NDKUser[]);
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-4xl font-bold mb-4">User Card</h1>
		<p class="text-lg text-muted-foreground mb-6">
			Display user information in card layouts. Choose from compact list items, portrait cards, or landscape layouts for different contexts.
		</p>

		{#key users}
			<EditProps.Root>
				<EditProps.Prop name="User 1" type="user" bind:value={user1} options={users} />
				<EditProps.Prop name="User 2" type="user" bind:value={user2} options={users} />
				<EditProps.Prop name="User 3" type="user" bind:value={user3} options={users} />
			</EditProps.Root>
		{/key}
	</div>

	{#if displayUsers.length > 0}
		<!-- Blocks Section -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-2">Blocks</h2>
			<p class="text-muted-foreground mb-8">
				Pre-composed layouts ready to use. Install with a single command.
			</p>

			<div class="space-y-12">
				<Demo
					title="Classic"
					description="Classic user card with banner, avatar, name, bio, and stats. Perfect for popovers, dialogs, and standalone displays."
					component="user-card-classic"
					code={ClassicCodeRaw}
				>
					{#if user1}
						<UserCardClassic {ndk} pubkey={user1.pubkey} />
					{/if}
				</Demo>

				<Demo
					title="Compact"
					description="Minimal user card for lists, showing avatar, name, and follow button. Ideal for sidebars and compact layouts."
					component="user-card-compact"
					code={CompactCodeRaw}
				>
					<div class="space-y-2 max-w-sm">
						{#each displayUsers as user (user.pubkey)}
							<UserCardCompact {ndk} pubkey={user.pubkey} />
						{/each}
					</div>
				</Demo>

				<Demo
					title="Portrait"
					description="Vertical card layout showing avatar, name, bio, and stats. Great for grids and profile galleries."
					component="user-card-portrait"
					code={PortraitCodeRaw}
				>
					<div class="flex gap-4 flex-wrap">
						{#each displayUsers as user (user.pubkey)}
							<UserCardPortrait {ndk} pubkey={user.pubkey} />
						{/each}
					</div>
				</Demo>

				<Demo
					title="Landscape"
					description="Horizontal card layout with avatar on left. Perfect for feed views and detailed lists."
					component="user-card-landscape"
					code={LandscapeCodeRaw}
				>
					<div class="space-y-4 max-w-2xl">
						{#each displayUsers as user (user.pubkey)}
							<UserCardLandscape {ndk} pubkey={user.pubkey} />
						{/each}
					</div>
				</Demo>
			</div>
		</section>

		<!-- Component API -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-2">Component API</h2>
			<p class="text-muted-foreground mb-4">
				User cards are built using UserProfile primitives. See the <a href="/components/user-profile" class="text-primary underline">UserProfile documentation</a> for complete API details.
			</p>

			<ComponentAPI
				components={[
					{
						name: 'UserProfile.Root',
						description: 'Root component that provides user context to all child components',
						importPath: "import { UserProfile } from '$lib/ndk/user-profile'",
						props: [
							{
								name: 'ndk',
								type: 'NDKSvelte',
								required: true,
								description: 'NDK instance'
							},
							{
								name: 'pubkey',
								type: 'string',
								required: true,
								description: 'User public key (hex format)'
							}
						]
					},
					{
						name: 'UserProfile.Avatar',
						description: 'Displays user avatar image',
						importPath: "import { UserProfile } from '$lib/ndk/user-profile'",
						props: [
							{
								name: 'size',
								type: "'sm' | 'md' | 'lg'",
								default: "'md'",
								description: 'Avatar size'
							},
							{
								name: 'class',
								type: 'string',
								default: "''",
								description: 'Additional CSS classes'
							}
						]
					},
					{
						name: 'UserProfile.Name',
						description: 'Displays user display name or handle',
						importPath: "import { UserProfile } from '$lib/ndk/user-profile'",
						props: [
							{
								name: 'class',
								type: 'string',
								default: "''",
								description: 'Additional CSS classes'
							}
						]
					},
					{
						name: 'UserProfile.Bio',
						description: 'Displays user biography text',
						importPath: "import { UserProfile } from '$lib/ndk/user-profile'",
						props: [
							{
								name: 'class',
								type: 'string',
								default: "''",
								description: 'Additional CSS classes'
							}
						]
					},
					{
						name: 'UserProfile.Follow',
						description: 'Follow/unfollow button',
						importPath: "import { UserProfile } from '$lib/ndk/user-profile'",
						props: [
							{
								name: 'class',
								type: 'string',
								default: "''",
								description: 'Additional CSS classes'
							}
						]
					}
				]}
			/>
		</section>
	{:else}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading users...</div>
		</div>
	{/if}
</div>

