<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKUser } from '@nostr-dev-kit/ndk';
	import { EditProps } from '$lib/site-components/edit-props';
	import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
	import ComponentCardInline from '$site-components/ComponentCardInline.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';
	import { User } from '$lib/registry/ui';
	import { ScrollArea } from '$lib/site-components/ui/scroll-area';
	import * as Tabs from '$lib/components/ui/tabs';
	import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
	import * as ComponentAnatomy from '$site-components/component-anatomy';

	// Import blocks
	import UserCardClassic from '$lib/registry/components/user-card/user-card-classic.svelte';
	import UserCardPortrait from '$lib/registry/components/user-card/user-card-portrait.svelte';
	import UserCardLandscape from '$lib/registry/components/user-card/user-card-landscape.svelte';
	import UserCardCompact from '$lib/registry/components/user-card/user-card-compact.svelte';
	import UserCardNeon from '$lib/registry/components/user-card/user-card-neon.svelte';
	import UserListItem from '$lib/registry/components/user-card/user-list-item.svelte';

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

	// Primitives drawer state
	let focusedPrimitive = $state<string | null>(null);

	function openPrimitiveDrawer(primitiveId: string) {
		focusedPrimitive = primitiveId;
	}

	function closePrimitiveDrawer() {
		focusedPrimitive = null;
	}

	// Anatomy layer data
	const anatomyLayers: Record<string, ComponentAnatomy.AnatomyLayer> = {
		avatar: {
			id: 'avatar',
			label: 'User.Avatar',
			description: 'Displays user avatar image with automatic loading and fallback handling.',
			props: ['size', 'class']
		},
		name: {
			id: 'name',
			label: 'User.Name',
			description: 'Renders the user display name or handle from profile metadata.',
			props: ['class']
		},
		bio: {
			id: 'bio',
			label: 'User.Bio',
			description: 'Shows user biography text from profile with automatic truncation support.',
			props: ['maxLength', 'class']
		},
		nip05: {
			id: 'nip05',
			label: 'User.Nip05',
			description: 'Displays verified NIP-05 identifier with verification badge.',
			props: ['class']
		}
	};

	const primitiveData = {
		root: {
			name: 'User.Root',
			description: 'Root container component that provides user context and manages state for all child primitives. Must wrap all other User primitives.',
			props: [
				{ name: 'ndk', type: 'NDKSvelte', desc: 'NDK instance (required)' },
				{ name: 'pubkey', type: 'string', desc: 'User public key in hex format (required)' },
				{ name: 'user', type: 'NDKUser', desc: 'NDKUser instance (alternative to pubkey)' },
				{ name: 'class', type: 'string', desc: 'Additional CSS classes' }
			]
		},
		avatar: {
			name: 'User.Avatar',
			description: 'Displays user avatar image with automatic loading and fallback handling.',
			props: [
				{ name: 'size', type: "'sm' | 'md' | 'lg'", desc: 'Avatar size (default: md)' },
				{ name: 'class', type: 'string', desc: 'Additional CSS classes for styling' }
			]
		},
		name: {
			name: 'User.Name',
			description: 'Renders the user display name or handle from profile metadata.',
			props: [{ name: 'class', type: 'string', desc: 'Additional CSS classes' }]
		},
		bio: {
			name: 'User.Bio',
			description: 'Shows user biography text from profile with automatic truncation support.',
			props: [
				{ name: 'maxLength', type: 'number', desc: 'Maximum character length (optional)' },
				{ name: 'class', type: 'string', desc: 'Additional CSS classes' }
			]
		},
		nip05: {
			name: 'User.Nip05',
			description: 'Displays verified NIP-05 identifier with verification badge.',
			props: [{ name: 'class', type: 'string', desc: 'Additional CSS classes' }]
		}
	};

	// Component card data for inline display
	const classicCardData = {
		name: 'user-card-classic',
		title: 'UserCardClassic',
		description: 'Classic user card with banner, avatar, name, bio, and stats.',
		richDescription: 'Perfect for popovers, dialogs, and standalone displays. This card provides a complete user profile view with banner image, avatar overlay, display name, bio, and follower/following stats.',
		command: 'npx shadcn@latest add user-card-classic',
		apiDocs: [
			{
				name: 'UserCardClassic',
				description: 'Classic user card component',
				importPath: "import { UserCardClassic } from '$lib/registry/components/user-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'pubkey', type: 'string', description: 'User public key (hex format)', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};

	const compactCardData = {
		name: 'user-card-compact',
		title: 'UserCardCompact',
		description: 'Minimal user card for lists.',
		richDescription: 'Shows avatar, name, and follow button. Ideal for sidebars and compact layouts where space is limited but user identity needs to be clear.',
		command: 'npx shadcn@latest add user-card-compact',
		apiDocs: [
			{
				name: 'UserCardCompact',
				description: 'Compact user card component',
				importPath: "import { UserCardCompact } from '$lib/registry/components/user-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'pubkey', type: 'string', description: 'User public key (hex format)', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};

	const listItemCardData = {
		name: 'user-list-item',
		title: 'UserListItem',
		description: 'Ultra-compact list item showing avatar, name, and follow status badge.',
		richDescription: 'Perfect for dense user lists and search results. Minimal design with just the essentials: avatar, name, and follow status indicator.',
		command: 'npx shadcn@latest add user-list-item',
		apiDocs: [
			{
				name: 'UserListItem',
				description: 'Ultra-compact user list item component',
				importPath: "import { UserListItem } from '$lib/registry/components/user-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'pubkey', type: 'string', description: 'User public key (hex format)', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};

	const portraitCardData = {
		name: 'user-card-portrait',
		title: 'UserCardPortrait',
		description: 'Vertical card layout showing avatar, name, bio, and stats.',
		richDescription: 'Great for grids and profile galleries. This portrait-oriented card presents user information in a vertical layout ideal for grid displays and gallery views.',
		command: 'npx shadcn@latest add user-card-portrait',
		apiDocs: [
			{
				name: 'UserCardPortrait',
				description: 'Portrait user card component',
				importPath: "import { UserCardPortrait } from '$lib/registry/components/user-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'pubkey', type: 'string', description: 'User public key (hex format)', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};

	const landscapeCardData = {
		name: 'user-card-landscape',
		title: 'UserCardLandscape',
		description: 'Horizontal card layout with avatar on left.',
		richDescription: 'Perfect for feed views and detailed lists. This horizontal layout places the avatar on the left with name, bio, and stats flowing to the right.',
		command: 'npx shadcn@latest add user-card-landscape',
		apiDocs: [
			{
				name: 'UserCardLandscape',
				description: 'Landscape user card component',
				importPath: "import { UserCardLandscape } from '$lib/registry/components/user-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'pubkey', type: 'string', description: 'User public key (hex format)', required: true },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};

	const neonCardData = {
		name: 'user-card-neon',
		title: 'UserCardNeon',
		description: 'Neon-style card with full background image and glossy top border.',
		richDescription: 'Features a full background image with darkening gradient and a neon glow effect at the top border. Perfect for modern, visually striking user displays.',
		command: 'npx shadcn@latest add user-card-neon',
		apiDocs: [
			{
				name: 'UserCardNeon',
				description: 'Neon-style user card component',
				importPath: "import { UserCardNeon } from '$lib/registry/components/user-card'",
				props: [
					{ name: 'ndk', type: 'NDKSvelte', description: 'NDK instance', required: true },
					{ name: 'pubkey', type: 'string', description: 'User public key (hex format)', required: true },
					{ name: 'width', type: 'string', description: 'Card width (default: w-[320px])' },
					{ name: 'height', type: 'string', description: 'Card height (default: h-[480px])' },
					{ name: 'onclick', type: '(e: MouseEvent) => void', description: 'Click handler' },
					{ name: 'class', type: 'string', description: 'Additional CSS classes' }
				]
			}
		]
	};
</script>

<div class="px-8">
<!-- Header -->
<div class="mb-12 pt-8">
	    <div class="flex items-start justify-between gap-4 mb-4">
	        <h1 class="text-4xl font-bold">User Card</h1>
	    </div>
			<p class="text-lg text-muted-foreground mb-6">
				Display user information in card layouts. Choose from compact list items, portrait cards, or landscape layouts for different contexts.
			</p>
	
			{#key users}
				<EditProps.Root>
					<EditProps.Prop name="User 1" type="user" bind:value={user1} options={users} />
					<EditProps.Prop name="User 2" type="user" bind:value={user2} options={users} />
					<EditProps.Prop name="User 3" type="user" bind:value={user3} options={users} />
					<EditProps.Button>Edit Examples</EditProps.Button>
				</EditProps.Root>
			{/key}
		</div>
	<!-- ComponentsShowcase Section -->
	{#if displayUsers.length > 0 && user1}
		{#snippet classicPreview()}
			{#if user1}
				<UserCardClassic {ndk} pubkey={user1.pubkey} />
			{/if}
		{/snippet}

		{#snippet compactPreview()}
			<div class="space-y-2 max-w-sm">
				{#each displayUsers as user (user.pubkey)}
					<UserCardCompact {ndk} pubkey={user.pubkey} />
				{/each}
			</div>
		{/snippet}

		{#snippet listItemPreview()}
			<div class="max-w-sm border border-border rounded-lg overflow-hidden">
				{#each displayUsers as user (user.pubkey)}
					<UserListItem {ndk} pubkey={user.pubkey} />
				{/each}
			</div>
		{/snippet}

		{#snippet portraitPreview()}
			<ScrollArea orientation="horizontal" class="w-full">
				<div class="flex gap-4 pb-4">
					{#each displayUsers as user (user.pubkey)}
						<UserCardPortrait {ndk} pubkey={user.pubkey} />
					{/each}
				</div>
			</ScrollArea>
		{/snippet}

		{#snippet landscapePreview()}
			<div class="space-y-4 max-w-2xl">
				{#each displayUsers as user (user.pubkey)}
					<UserCardLandscape {ndk} pubkey={user.pubkey} />
				{/each}
			</div>
		{/snippet}

		{#snippet neonPreview()}
			<ScrollArea orientation="horizontal" class="w-full">
				<div class="flex gap-4 pb-4">
					{#each displayUsers as user (user.pubkey)}
						<UserCardNeon {ndk} pubkey={user.pubkey} />
					{/each}
				</div>
			</ScrollArea>
		{/snippet}

		<ComponentPageSectionTitle
			title="Components Showcase"
			description="Six carefully crafted variants. From ultra-compact list items to full-featured classic cards. Choose the perfect fit for your layout."
		/>

		<ComponentsShowcase
			class="-mx-8 px-8"
			blocks={[
				{
					name: 'Classic',
					description: 'Classic user card with banner, avatar, name, bio, and stats. Perfect for popovers, dialogs, and standalone displays.',
					command: 'npx shadcn@latest add user-card-classic',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">UserCardClassic</span> <span class="text-cyan-400">pubkey</span><span class="text-gray-500">=&#123;</span>pubkey<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: classicPreview,
					cardData: classicCardData
				},
				{
					name: 'Compact',
					description: 'Minimal user card for lists, showing avatar, name, and follow button. Ideal for sidebars and compact layouts.',
					command: 'npx shadcn@latest add user-card-compact',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">UserCardCompact</span> <span class="text-cyan-400">pubkey</span><span class="text-gray-500">=&#123;</span>pubkey<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: compactPreview,
					cardData: compactCardData
				},
				{
					name: 'List Item',
					description: 'Ultra-compact list item showing avatar, name, and follow status badge. Perfect for dense user lists.',
					command: 'npx shadcn@latest add user-list-item',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">UserListItem</span> <span class="text-cyan-400">pubkey</span><span class="text-gray-500">=&#123;</span>pubkey<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: listItemPreview,
					cardData: listItemCardData
				},
				{
					name: 'Portrait',
					description: 'Vertical card layout showing avatar, name, bio, and stats. Great for grids and profile galleries.',
					command: 'npx shadcn@latest add user-card-portrait',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">UserCardPortrait</span> <span class="text-cyan-400">pubkey</span><span class="text-gray-500">=&#123;</span>pubkey<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: portraitPreview,
					cardData: portraitCardData
				},
				{
					name: 'Landscape',
					description: 'Horizontal card layout with avatar on left. Perfect for feed views and detailed lists.',
					command: 'npx shadcn@latest add user-card-landscape',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">UserCardLandscape</span> <span class="text-cyan-400">pubkey</span><span class="text-gray-500">=&#123;</span>pubkey<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: landscapePreview,
					cardData: landscapeCardData
				},
				{
					name: 'Neon',
					description: 'Neon-style card with full background image and glossy top border. Perfect for modern, visually striking user displays.',
					command: 'npx shadcn@latest add user-card-neon',
					codeSnippet:
						'<span class="text-gray-500">&lt;</span><span class="text-blue-400">UserCardNeon</span> <span class="text-cyan-400">pubkey</span><span class="text-gray-500">=&#123;</span>pubkey<span class="text-gray-500">&#125;</span> <span class="text-gray-500">/&gt;</span>',
					preview: neonPreview,
					cardData: neonCardData
				}
			]}
		/>
	{/if}

	{#if displayUsers.length > 0}
		<!-- Anatomy Section -->
		<ComponentPageSectionTitle title="Anatomy" description="Click on any layer to see its details and props" />

		<ComponentAnatomy.Root>
			<ComponentAnatomy.Preview>
				{#if user1}
					<div class="relative bg-card border border-border rounded-xl overflow-hidden">
						<User.Root {ndk} pubkey={user1.pubkey}>
							<div class="p-4 space-y-3">
								<ComponentAnatomy.Layer id="avatar" label="User.Avatar" class="w-fit mx-auto">
									<User.Avatar class="w-24 h-24" />
								</ComponentAnatomy.Layer>

								<ComponentAnatomy.Layer id="name" label="User.Name" class="text-center">
									<User.Name class="text-lg font-semibold" />
								</ComponentAnatomy.Layer>

								<ComponentAnatomy.Layer id="bio" label="User.Bio">
									<User.Bio class="text-sm text-muted-foreground text-center" />
								</ComponentAnatomy.Layer>

								<ComponentAnatomy.Layer id="nip05" label="User.Nip05" class="w-fit mx-auto">
									<User.Nip05 class="text-xs text-muted-foreground" />
								</ComponentAnatomy.Layer>
							</div>
						</User.Root>
					</div>
				{/if}
			</ComponentAnatomy.Preview>

			<ComponentAnatomy.DetailPanel layers={anatomyLayers} />
		</ComponentAnatomy.Root>
	{/if}

	<!-- Components Section -->
	{#if user1}
		<Tabs.Root value="classic">
			<div class="border-t border-b border-border/50 py-8 -mx-8 px-8 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-muted-foreground">Components</h2>
				<Tabs.List>
					<Tabs.Trigger value="classic">Classic</Tabs.Trigger>
					<Tabs.Trigger value="compact">Compact</Tabs.Trigger>
					<Tabs.Trigger value="list">List Item</Tabs.Trigger>
					<Tabs.Trigger value="portrait">Portrait</Tabs.Trigger>
					<Tabs.Trigger value="landscape">Landscape</Tabs.Trigger>
					<Tabs.Trigger value="neon">Neon</Tabs.Trigger>
				</Tabs.List>
			</div>

			<section class="min-h-[500px] lg:min-h-[60vh] py-12">
				<Tabs.Content value="classic">
						<ComponentCardInline data={classicCardData}>
							{#snippet preview()}
								<UserCardClassic {ndk} pubkey={user1.pubkey} />
							{/snippet}
						</ComponentCardInline>
					</Tabs.Content>

					<Tabs.Content value="compact">
						<ComponentCardInline data={compactCardData}>
							{#snippet preview()}
								<div class="space-y-2 max-w-sm">
									{#each displayUsers as user (user.pubkey)}
										<UserCardCompact {ndk} pubkey={user.pubkey} />
									{/each}
								</div>
							{/snippet}
						</ComponentCardInline>
					</Tabs.Content>

					<Tabs.Content value="list">
						<ComponentCardInline data={listItemCardData}>
							{#snippet preview()}
								<div class="max-w-sm border border-border rounded-lg overflow-hidden">
									{#each displayUsers as user (user.pubkey)}
										<UserListItem {ndk} pubkey={user.pubkey} />
									{/each}
								</div>
							{/snippet}
						</ComponentCardInline>
					</Tabs.Content>

					<Tabs.Content value="portrait">
						<ComponentCardInline data={portraitCardData}>
							{#snippet preview()}
								<ScrollArea orientation="horizontal" class="w-full">
									<div class="flex gap-4 pb-4">
										{#each displayUsers as user (user.pubkey)}
											<UserCardPortrait {ndk} pubkey={user.pubkey} />
										{/each}
									</div>
								</ScrollArea>
							{/snippet}
						</ComponentCardInline>
					</Tabs.Content>

					<Tabs.Content value="landscape">
						<ComponentCardInline data={landscapeCardData}>
							{#snippet preview()}
								<div class="space-y-4 max-w-2xl">
									{#each displayUsers as user (user.pubkey)}
										<UserCardLandscape {ndk} pubkey={user.pubkey} />
									{/each}
								</div>
							{/snippet}
						</ComponentCardInline>
					</Tabs.Content>

					<Tabs.Content value="neon">
						<ComponentCardInline data={neonCardData}>
							{#snippet preview()}
								<ScrollArea orientation="horizontal" class="w-full">
									<div class="flex gap-4 pb-4">
										{#each displayUsers as user (user.pubkey)}
											<UserCardNeon {ndk} pubkey={user.pubkey} />
										{/each}
									</div>
								</ScrollArea>
							{/snippet}
						</ComponentCardInline>
					</Tabs.Content>
				</section>
			</Tabs.Root>

		<!-- Primitives Grid -->
		<ComponentPageSectionTitle title="Primitives" />

		<section class="min-h-[500px] lg:min-h-[60vh] py-12">

			<div class="grid grid-cols-3">
				{#each Object.entries(primitiveData) as [id, data], i}
					<button
						type="button"
						class="p-12 border-border transition-all {i % 3 !== 2
							? 'border-r'
							: ''} {i < 3 ? 'border-b' : ''} {focusedPrimitive && focusedPrimitive !== id
							? 'opacity-30'
							: ''}"
						onclick={() => openPrimitiveDrawer(id)}
					>
						<div class="flex flex-col items-center justify-start">
							<h3 class="text-base font-semibold text-foreground mb-4">{data.name}</h3>
							<div class="border border-dashed border-border rounded-lg p-6 w-full min-h-[240px] flex items-center justify-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300">
								{#if user1}
									<User.Root {ndk} pubkey={user1.pubkey}>
										{#if id === 'root'}
											<div class="text-center">
												<div class="font-semibold text-foreground mb-1">Container Component</div>
												<div class="text-sm text-muted-foreground">Wraps all primitives</div>
											</div>
										{:else if id === 'avatar'}
											<User.Avatar class="w-16 h-16" />
										{:else if id === 'name'}
											<User.Name class="text-xl font-bold text-center" />
										{:else if id === 'bio'}
											<User.Bio class="text-sm text-muted-foreground text-center leading-relaxed px-2" />
										{:else if id === 'nip05'}
											<User.Nip05 class="text-base text-foreground" />
										{/if}
									</User.Root>
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</div>
		</section>
	{:else}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading users...</div>
		</div>
	{/if}
</div>

<!-- API Drawer -->
{#if focusedPrimitive && primitiveData[focusedPrimitive]}
	{@const data = primitiveData[focusedPrimitive]}
	<div
		class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
		onclick={closePrimitiveDrawer}
		role="button"
		tabindex="-1"
	></div>
	<div
		class="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-card border-l border-border shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300"
	>
		<div class="sticky top-0 bg-card border-b border-border p-8 z-10">
			<button
				type="button"
				class="absolute top-8 right-8 text-muted-foreground hover:text-foreground text-2xl"
				onclick={closePrimitiveDrawer}
			>
				×
			</button>
			<h2 class="font-mono text-2xl font-bold text-primary">{data.name}</h2>
		</div>

		<div class="p-8">
			<div class="mb-8">
				<p class="text-muted-foreground leading-relaxed">{data.description}</p>
			</div>

			<div>
				<h3 class="text-lg font-bold mb-4">Props</h3>
				<div class="space-y-4">
					{#each data.props as prop}
						<div class="bg-muted/50 border border-border rounded-lg p-4">
							<div class="flex justify-between items-start mb-2">
								<code class="font-mono font-semibold text-primary">{prop.name}</code>
								<code class="font-mono text-xs text-muted-foreground">{prop.type}</code>
							</div>
							<p class="text-sm text-muted-foreground">{prop.desc}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

