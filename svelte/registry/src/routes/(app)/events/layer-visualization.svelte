<script lang="ts">
	// Import event card registry data
	import eventCardClassic from '$lib/registry/components/event/cards/classic/registry.json';
	import eventCardCompound from '$lib/registry/components/event/cards/compound/registry.json';
	import eventCardGeneric from '$lib/registry/components/event/cards/generic/registry.json';

	const eventsIntroductionCards = [
		eventCardCompound,  // Chrome layer
		eventCardClassic,   // Content layer
		eventCardGeneric    // Embeds layer
	];
</script>

<div class="visualization-container">
	<!-- Step 1: Chrome Layer -->
	<div class="layer-step">
		<div class="step-number bg-blue-500/10 text-blue-500">1</div>
		<div class="step-content">
			<div class="wireframe-box chrome-layer">
				<!-- Header Section -->
				<div class="flex gap-3 items-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
					<div class="w-10 h-10 rounded-full bg-muted shrink-0"></div>
					<div class="flex flex-col gap-1.5 flex-1">
						<div class="h-2 bg-muted rounded w-2/5"></div>
						<div class="h-2 bg-muted rounded w-1/4"></div>
					</div>
				</div>

				<!-- Content placeholder -->
				<div class="flex flex-col gap-2 p-3">
					<div class="h-2 bg-muted rounded"></div>
					<div class="h-2 bg-muted rounded"></div>
					<div class="h-2 bg-muted rounded w-3/5"></div>
				</div>

				<!-- Actions -->
				<div class="flex gap-3 p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
					<div class="w-8 h-6 bg-muted rounded"></div>
					<div class="w-8 h-6 bg-muted rounded"></div>
					<div class="w-8 h-6 bg-muted rounded"></div>
					<div class="w-8 h-6 bg-muted rounded"></div>
				</div>
			</div>
		<div class="info-card chrome-card">
			<h3 class="font-semibold mb-2 text-lg">{eventsIntroductionCards[0].title}</h3>
			<p class="text-sm text-muted-foreground mb-4">
				{eventsIntroductionCards[0].description}
			</p>
			<code
				class="text-xs bg-muted px-2 py-1 rounded font-mono block overflow-x-auto text-muted-foreground"
			>
				{eventsIntroductionCards[0].command}
			</code>
		</div>
		</div>
	</div>

	<!-- Arrow -->
	<div class="text-center text-2xl text-muted-foreground opacity-50">↓</div>

	<!-- Step 2: Content Layer -->
	<div class="layer-step">
		<div class="step-number bg-purple-500/10 text-purple-500">2</div>
		<div class="step-content">
			<div class="wireframe-box chrome-layer chrome-layer-dimmed">
				<div class="flex gap-3 items-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/20 opacity-30">
					<div class="w-10 h-10 rounded-full bg-muted shrink-0"></div>
					<div class="flex flex-col gap-1.5 flex-1">
						<div class="h-2 bg-muted rounded w-2/5"></div>
						<div class="h-2 bg-muted rounded w-1/4"></div>
					</div>
				</div>

				<!-- Content with highlights -->
				<div class="p-3 rounded-lg bg-purple-500/5 border-2 border-purple-500 flex flex-col gap-3">
				<div class="text-sm leading-relaxed">
					Check out this article about nostr:nprofile1... and #nostr!
				</div>
				<div class="text-sm leading-relaxed">
					nostr:nevent1...
				</div>
				</div>

				<div class="flex gap-3 p-2 rounded-lg bg-blue-500/5 border border-blue-500/20 opacity-30">
					<div class="w-8 h-6 bg-muted rounded"></div>
					<div class="w-8 h-6 bg-muted rounded"></div>
					<div class="w-8 h-6 bg-muted rounded"></div>
					<div class="w-8 h-6 bg-muted rounded"></div>
				</div>
			</div>
		<div class="info-card content-card">
			<h3 class="font-semibold mb-2 text-lg">{eventsIntroductionCards[1].title}</h3>
			<p class="text-sm text-muted-foreground mb-4">
				{eventsIntroductionCards[1].description}
			</p>
			<code
				class="text-xs bg-muted px-2 py-1 rounded font-mono block overflow-x-auto text-muted-foreground"
			>
				{eventsIntroductionCards[1].command}
			</code>
		</div>
		</div>
	</div>

	<!-- Arrow -->
	<div class="text-center text-2xl text-muted-foreground opacity-50">↓</div>

	<!-- Step 3: Embed Layer -->
	<div class="layer-step">
		<div class="step-number bg-orange-500/10 text-orange-500">3</div>
		<div class="step-content">
			<div class="wireframe-box chrome-layer chrome-layer-dimmed">
				<div class="flex gap-3 items-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/20 opacity-30">
					<div class="w-10 h-10 rounded-full bg-muted shrink-0"></div>
					<div class="flex flex-col gap-1.5 flex-1">
						<div class="h-2 bg-muted rounded w-2/5"></div>
						<div class="h-2 bg-muted rounded w-1/4"></div>
					</div>
				</div>

				<div class="p-3 rounded-lg flex flex-col gap-3">
					<div class="text-sm leading-relaxed">
						<span class="text-foreground opacity-30">Check out this article about </span>
						<span class="text-orange-500 font-semibold px-1 py-0.5 rounded bg-orange-500/10 border border-dashed border-orange-500">@alice</span>
						<span class="text-foreground opacity-30"> and </span>
						<span class="text-orange-500 font-semibold px-1 py-0.5 rounded bg-orange-500/10 border border-dashed border-orange-500">#nostr</span>
						<span class="text-foreground opacity-30">!</span>
					</div>

					<!-- Embedded Preview -->
					<div class="p-3 bg-orange-500/10 rounded-lg border-2 border-dashed border-orange-500 flex flex-col gap-2">
						<div class="flex gap-2 items-center">
							<div class="w-6 h-6 rounded-full bg-muted shrink-0"></div>
							<div class="flex-1">
								<div class="h-2 bg-muted rounded w-3/10"></div>
							</div>
						</div>
						<div class="flex flex-col gap-1.5">
							<div class="h-2 bg-muted rounded w-2/5"></div>
							<div class="h-2 bg-muted rounded w-3/5"></div>
						</div>
					</div>
				</div>

				<div class="flex gap-3 p-2 rounded-lg bg-blue-500/5 border border-blue-500/20 opacity-30">
					<div class="w-8 h-6 bg-muted rounded"></div>
					<div class="w-8 h-6 bg-muted rounded"></div>
					<div class="w-8 h-6 bg-muted rounded"></div>
					<div class="w-8 h-6 bg-muted rounded"></div>
				</div>
			</div>
		<div class="info-card embed-card">
			<h3 class="font-semibold mb-2 text-lg">{eventsIntroductionCards[2].title}</h3>
			<p class="text-sm text-muted-foreground mb-4">
				{eventsIntroductionCards[2].description}
			</p>
			<code
				class="text-xs bg-muted px-2 py-1 rounded font-mono block overflow-x-auto text-muted-foreground"
			>
				{eventsIntroductionCards[2].command}
			</code>
		</div>
		</div>
	</div>
</div>

<style>
	.visualization-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 2rem;
		background: var(--muted/50);
		border-radius: 0.75rem;
		border: 1px solid var(--border);
	}

	.layer-step {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.step-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		width: 100%;
		align-items: start;
	}

	.info-card {
		padding: 1.5rem;
		border: 2px solid var(--border);
		border-radius: 0.75rem;
		background: var(--card);
	}

	.chrome-card {
		border-color: rgb(59 130 246);
		background: rgb(59 130 246 / 0.02);
	}

	.content-card {
		border-color: rgb(168 85 247);
		background: rgb(168 85 247 / 0.02);
	}

	.embed-card {
		border-color: rgb(249 115 22);
		background: rgb(249 115 22 / 0.02);
	}

	.step-number {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 1.125rem;
	}

	.wireframe-box {
		position: relative;
		width: 100%;
		padding: 1.25rem;
		border: 2px dashed var(--border);
		border-radius: 0.75rem;
		background: var(--background);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.chrome-layer {
		border-color: rgb(59 130 246);
	}

	.chrome-layer-dimmed {
		border-color: rgb(59 130 246 / 0.3);
	}

	@media (max-width: 768px) {
		.visualization-container {
			padding: 1rem;
		}

		.step-content {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}
</style>
