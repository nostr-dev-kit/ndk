<script lang="ts">
	import { ndk } from '$lib/ndk';
	import { User } from '$lib/components/ui/user';

	const userPubkey = 'e33fe65f1fde44c6dc17eeb38fdad0fceaf1cae8722084332ed1e32496291d42';
	const profile = ndk.$fetchProfile(() => userPubkey);
</script>

<div class="container mx-auto p-8">
	<h1 class="text-4xl font-bold mb-8">@nostr/svelte Component Test</h1>

	<div class="space-y-8">
		<section>
			<h2 class="text-2xl font-semibold mb-4">User Component</h2>
			<div class="border rounded-lg p-6 bg-white shadow-sm">
				{#if profile}
					<User.Root pubkey={userPubkey}>
						<div class="flex items-center gap-4">
							<User.Avatar class="w-16 h-16" />
							<div>
								<User.Name class="text-xl font-bold" />
								<User.Nip05 class="text-sm text-gray-600" />
								<User.Bio class="mt-2 text-gray-700" />
							</div>
						</div>
					</User.Root>
				{:else}
					<p class="text-gray-500">Loading profile...</p>
				{/if}
			</div>
		</section>

		<section>
			<h2 class="text-2xl font-semibold mb-4">Component Installation Success!</h2>
			<div class="bg-green-50 border border-green-200 rounded-lg p-4">
				<p class="text-green-800">
					✓ jsrepo successfully installed components from @nostr/svelte registry
				</p>
				<p class="text-green-600 mt-2 text-sm">
					Components are working with NDK Svelte and Tailwind CSS v4
				</p>
			</div>
		</section>
	</div>
</div>
