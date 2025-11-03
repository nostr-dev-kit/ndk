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

	// Import blocks
	import UserCardClassic from '$lib/registry/components/user-card/user-card-classic.svelte';
	import UserCardPortrait from '$lib/registry/components/user-card/user-card-portrait.svelte';
	import UserCardLandscape from '$lib/registry/components/user-card/user-card-landscape.svelte';
	import UserCardCompact from '$lib/registry/components/user-card/user-card-compact.svelte';
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

	// Anatomy interaction state
	let selectedLayer = $state<string | null>(null);
	let focusedPrimitive = $state<string | null>(null);

	function toggleLayer(layerId: string) {
		selectedLayer = selectedLayer === layerId ? null : layerId;
	}

	function openPrimitiveDrawer(primitiveId: string) {
		focusedPrimitive = primitiveId;
	}

	function closePrimitiveDrawer() {
		focusedPrimitive = null;
	}

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
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	  <div class="mb-12">
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

		<ComponentsShowcase
			title="Components Showcase"
			description="Five carefully crafted variants. From ultra-compact list items to full-featured classic cards. Choose the perfect fit for your layout."
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
				}
			]}
		/>
	{/if}

	{#if displayUsers.length > 0}
		<!-- Anatomy Section -->
		<section class="mb-24">
			<h2 class="text-3xl font-bold mb-4">Anatomy</h2>
			<p class="text-muted-foreground mb-8">Click on any layer to see its details and props</p>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
				<!-- Card Preview -->
				<div class="flex items-center justify-center lg:justify-end">
					<div class="max-w-md w-full relative">
						{#if user1}
							<!-- The actual card preview -->
							<div class="relative bg-card border border-border rounded-xl overflow-hidden">
								<User.Root {ndk} pubkey={user1.pubkey}>
									<div class="p-4 space-y-3">
										<!-- Avatar Layer -->
										<div class="relative w-fit mx-auto">
											<User.Avatar class="w-24 h-24" />
											<button
												type="button"
												class="group absolute inset-0 -m-1 border-2 border-dashed border-primary/60 rounded-full transition-all cursor-pointer {selectedLayer ===
												'avatar'
													? 'bg-primary/20 border-primary'
													: 'hover:bg-primary/5'}"
												onclick={() => toggleLayer('avatar')}
											>
												<span
													class="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
												>
													User.Avatar
												</span>
											</button>
										</div>

										<!-- Name Layer -->
										<div class="relative text-center">
											<User.Name class="text-lg font-semibold" />
											<button
												type="button"
												class="group absolute inset-0 -m-1 border-2 border-dashed border-primary/60 rounded transition-all cursor-pointer {selectedLayer ===
												'name'
													? 'bg-primary/20 border-primary'
													: 'hover:bg-primary/5'}"
												onclick={() => toggleLayer('name')}
											>
												<span
													class="absolute -bottom-7 right-1 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
												>
													User.Name
												</span>
											</button>
										</div>

										<!-- Bio Layer -->
										<div class="relative">
											<User.Bio class="text-sm text-muted-foreground text-center" />
											<button
												type="button"
												class="group absolute inset-0 -m-1 border-2 border-dashed border-primary/60 rounded transition-all cursor-pointer {selectedLayer ===
												'bio'
													? 'bg-primary/20 border-primary'
													: 'hover:bg-primary/5'}"
												onclick={() => toggleLayer('bio')}
											>
												<span
													class="absolute -bottom-7 right-1 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
												>
													User.Bio
												</span>
											</button>
										</div>

										<!-- NIP-05 Layer -->
										<div class="relative w-fit mx-auto">
											<User.Nip05 class="text-xs text-muted-foreground" />
											<button
												type="button"
												class="group absolute inset-0 -m-1 border-2 border-dashed border-primary/60 rounded transition-all cursor-pointer {selectedLayer ===
												'nip05'
													? 'bg-primary/20 border-primary'
													: 'hover:bg-primary/5'}"
												onclick={() => toggleLayer('nip05')}
											>
												<span
													class="absolute -bottom-7 right-1 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
												>
													User.Nip05
												</span>
											</button>
										</div>
									</div>
								</User.Root>
							</div>
						{/if}
					</div>
				</div>

				<!-- Detail Panel -->
				<div class="flex flex-col justify-start">
					{#if selectedLayer === 'avatar'}
						<div class="animate-in fade-in duration-200">
							<h3 class="font-mono text-xl font-bold mb-3">User.Avatar</h3>
							<p class="text-muted-foreground mb-4">
								Displays the user avatar image with automatic loading states and fallback handling.
							</p>
							<div class="flex gap-2">
								<code class="bg-muted px-2 py-1 rounded text-sm">size</code>
								<code class="bg-muted px-2 py-1 rounded text-sm">class</code>
							</div>
						</div>
					{:else if selectedLayer === 'name'}
						<div class="animate-in fade-in duration-200">
							<h3 class="font-mono text-xl font-bold mb-3">User.Name</h3>
							<p class="text-muted-foreground mb-4">
								Renders the user display name or handle from profile metadata.
							</p>
							<div class="flex gap-2">
								<code class="bg-muted px-2 py-1 rounded text-sm">class</code>
							</div>
						</div>
					{:else if selectedLayer === 'bio'}
						<div class="animate-in fade-in duration-200">
							<h3 class="font-mono text-xl font-bold mb-3">User.Bio</h3>
							<p class="text-muted-foreground mb-4">
								Shows user biography text from profile with automatic truncation support.
							</p>
							<div class="flex gap-2">
								<code class="bg-muted px-2 py-1 rounded text-sm">maxLength</code>
								<code class="bg-muted px-2 py-1 rounded text-sm">class</code>
							</div>
						</div>
					{:else if selectedLayer === 'nip05'}
						<div class="animate-in fade-in duration-200">
							<h3 class="font-mono text-xl font-bold mb-3">User.Nip05</h3>
							<p class="text-muted-foreground mb-4">
								Displays verified NIP-05 identifier with verification badge.
							</p>
							<div class="flex gap-2">
								<code class="bg-muted px-2 py-1 rounded text-sm">class</code>
							</div>
						</div>
					{:else}
						<div class="text-muted-foreground text-sm">
							Hover and click on a layer to see its details
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- Components Section -->
		<section class="mb-24">
			<h2 class="text-3xl font-bold mb-8">Components</h2>

			<div class="space-y-12">
				{#if user1}
					<!-- Classic -->
					<ComponentCardInline data={classicCardData}>
						{#snippet preview()}
							<UserCardClassic {ndk} pubkey={user1.pubkey} />
						{/snippet}
					</ComponentCardInline>

					<!-- Compact -->
					<ComponentCardInline data={compactCardData}>
						{#snippet preview()}
							<div class="space-y-2 max-w-sm">
								{#each displayUsers as user (user.pubkey)}
									<UserCardCompact {ndk} pubkey={user.pubkey} />
								{/each}
							</div>
						{/snippet}
					</ComponentCardInline>

					<!-- List Item -->
					<ComponentCardInline data={listItemCardData}>
						{#snippet preview()}
							<div class="max-w-sm border border-border rounded-lg overflow-hidden">
								{#each displayUsers as user (user.pubkey)}
									<UserListItem {ndk} pubkey={user.pubkey} />
								{/each}
							</div>
						{/snippet}
					</ComponentCardInline>

					<!-- Portrait -->
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

					<!-- Landscape -->
					<ComponentCardInline data={landscapeCardData}>
						{#snippet preview()}
							<div class="space-y-4 max-w-2xl">
								{#each displayUsers as user (user.pubkey)}
									<UserCardLandscape {ndk} pubkey={user.pubkey} />
								{/each}
							</div>
						{/snippet}
					</ComponentCardInline>
				{/if}
			</div>
		</section>

		<!-- Primitives Grid -->
		<section class="mb-24">
			<h2 class="text-3xl font-bold mb-8">Primitives</h2>

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

