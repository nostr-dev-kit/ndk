<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { ContentRenderer } from '$lib/registry/ui/content-renderer';
	import EventContent from '$lib/registry/ui/event-content.svelte';
	import { NDKEvent } from '@nostr-dev-kit/ndk';

	const ndk = getContext<NDKSvelte>('ndk');

	// Create mock components to demonstrate priority
	const BasicMention = {
		render: () => '<span class="text-blue-500">[basic mention]</span>'
	};

	const CompactMention = {
		render: () => '<span class="text-green-500 font-medium">[compact mention]</span>'
	};

	const EnhancedMention = {
		render: () => '<span class="text-purple-500 font-bold underline">[enhanced mention]</span>'
	};

	// Create three renderers with different priority configurations
	const basicRenderer = new ContentRenderer();
	basicRenderer.setMentionComponent(BasicMention, 1); // Priority 1

	const compactRenderer = new ContentRenderer();
	compactRenderer.setMentionComponent(BasicMention, 1); // Priority 1 first
	compactRenderer.setMentionComponent(CompactMention, 5); // Priority 5 wins!

	const enhancedRenderer = new ContentRenderer();
	enhancedRenderer.setMentionComponent(BasicMention, 1); // Priority 1 first
	enhancedRenderer.setMentionComponent(CompactMention, 5); // Priority 5 next
	enhancedRenderer.setMentionComponent(EnhancedMention, 10); // Priority 10 wins!

	// Also try to register a lower priority after - it should be ignored
	enhancedRenderer.setMentionComponent(BasicMention, 3); // Priority 3 - ignored!

	// Sample event with mention
	const event = new NDKEvent(ndk, {
		kind: 1,
		content: 'Hello nostr:npub1example and welcome to the priority system demo!'
	});

	// Get priority info for display
	const basicPriorities = basicRenderer.getInlinePriorities();
	const compactPriorities = compactRenderer.getInlinePriorities();
	const enhancedPriorities = enhancedRenderer.getInlinePriorities();
</script>

<div class="space-y-6">
	<div class="text-sm text-muted-foreground mb-4">
		This example demonstrates how the priority system works. The same content is rendered
		with three different renderers that have progressively higher priority components registered.
	</div>

	<div class="space-y-4">
		<div class="p-4 border border-border rounded-lg bg-card">
			<h4 class="font-semibold mb-2 flex items-center justify-between">
				Basic Renderer
				<span class="text-xs font-mono text-muted-foreground">
					mention priority: {basicPriorities.mention}
				</span>
			</h4>
			<p class="text-sm text-muted-foreground mb-3">
				Only BasicMention registered (priority 1)
			</p>
			<EventContent {ndk} {event} renderer={basicRenderer} />
		</div>

		<div class="p-4 border border-border rounded-lg bg-card">
			<h4 class="font-semibold mb-2 flex items-center justify-between">
				Compact Renderer
				<span class="text-xs font-mono text-muted-foreground">
					mention priority: {compactPriorities.mention}
				</span>
			</h4>
			<p class="text-sm text-muted-foreground mb-3">
				BasicMention (priority 1) registered first, then CompactMention (priority 5) wins
			</p>
			<EventContent {ndk} {event} renderer={compactRenderer} />
		</div>

		<div class="p-4 border border-border rounded-lg bg-card">
			<h4 class="font-semibold mb-2 flex items-center justify-between">
				Enhanced Renderer
				<span class="text-xs font-mono text-muted-foreground">
					mention priority: {enhancedPriorities.mention}
				</span>
			</h4>
			<p class="text-sm text-muted-foreground mb-3">
				All three registered in order, EnhancedMention (priority 10) wins.
				Attempt to register BasicMention with priority 3 is ignored (lower than 10).
			</p>
			<EventContent {ndk} {event} renderer={enhancedRenderer} />
		</div>
	</div>

	<div class="mt-6 p-4 bg-muted rounded-lg">
		<h4 class="font-semibold mb-2">Key Points:</h4>
		<ul class="text-sm space-y-1 list-disc ml-5">
			<li>Higher priority components automatically override lower priority ones</li>
			<li>The last registered component's priority is what matters</li>
			<li>Attempts to register lower priority components are silently ignored</li>
			<li>This enables progressive enhancement without breaking existing code</li>
		</ul>
	</div>
</div>