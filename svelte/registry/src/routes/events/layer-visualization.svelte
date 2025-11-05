<script lang="ts">
	import { eventsIntroductionCards } from '$lib/component-registry/events-introduction';
</script>

<div class="visualization-container">
	<!-- Step 1: Chrome Layer -->
	<div class="layer-step">
		<div class="step-number bg-blue-500/10 text-blue-500">1</div>
		<div class="step-content">
			<div class="wireframe-box chrome-layer">
			<!-- Header Section -->
			<div class="wireframe-header">
				<div class="wireframe-avatar"></div>
				<div class="wireframe-meta">
					<div class="wireframe-line short"></div>
					<div class="wireframe-line shorter"></div>
				</div>
			</div>

			<!-- Content placeholder -->
			<div class="content-placeholder">
				<div class="wireframe-line"></div>
				<div class="wireframe-line"></div>
				<div class="wireframe-line medium"></div>
			</div>

			<!-- Actions -->
			<div class="wireframe-actions">
				<div class="wireframe-button"></div>
				<div class="wireframe-button"></div>
				<div class="wireframe-button"></div>
				<div class="wireframe-button"></div>
			</div>

			<div class="layer-label chrome-label">Chrome Layer</div>
		</div>
		<div class="info-card">
			<h3 class="font-semibold mb-2 text-lg">{eventsIntroductionCards[0].title}</h3>
			<p class="text-sm text-muted-foreground mb-4">
				{eventsIntroductionCards[0].richDescription}
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
	<div class="arrow-down">↓</div>

	<!-- Step 2: Content Layer -->
	<div class="layer-step">
		<div class="step-number bg-purple-500/10 text-purple-500">2</div>
		<div class="step-content">
			<div class="wireframe-box chrome-layer">
			<div class="wireframe-header dimmed">
				<div class="wireframe-avatar"></div>
				<div class="wireframe-meta">
					<div class="wireframe-line short"></div>
					<div class="wireframe-line shorter"></div>
				</div>
			</div>

			<!-- Content with highlights -->
			<div class="content-active">
				<div class="content-text">
					<span class="content-plain">Check out this article about </span>
					<span class="content-mention">@alice</span>
					<span class="content-plain"> and </span>
					<span class="content-hashtag">#nostr</span>
					<span class="content-plain">!</span>
				</div>
				<div class="content-embed-ref">
					<div class="wireframe-line short"></div>
				</div>
			</div>

			<div class="wireframe-actions dimmed">
				<div class="wireframe-button"></div>
				<div class="wireframe-button"></div>
				<div class="wireframe-button"></div>
				<div class="wireframe-button"></div>
			</div>

			<div class="layer-label content-label">Content Layer</div>
		</div>
		<div class="info-card">
			<h3 class="font-semibold mb-2 text-lg">{eventsIntroductionCards[1].title}</h3>
			<p class="text-sm text-muted-foreground mb-4">
				{eventsIntroductionCards[1].richDescription}
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
	<div class="arrow-down">↓</div>

	<!-- Step 3: Embed Layer -->
	<div class="layer-step">
		<div class="step-number bg-orange-500/10 text-orange-500">3</div>
		<div class="step-content">
			<div class="wireframe-box chrome-layer">
			<div class="wireframe-header dimmed">
				<div class="wireframe-avatar"></div>
				<div class="wireframe-meta">
					<div class="wireframe-line short"></div>
					<div class="wireframe-line shorter"></div>
				</div>
			</div>

			<div class="content-dimmed">
				<div class="content-text">
					<span class="content-plain">Check out this article about </span>
					<span class="content-mention">@alice</span>
					<span class="content-plain"> and </span>
					<span class="content-hashtag">#nostr</span>
					<span class="content-plain">!</span>
				</div>

				<!-- Embedded Preview -->
				<div class="embed-preview">
					<div class="embed-header">
						<div class="embed-avatar"></div>
						<div class="embed-meta">
							<div class="wireframe-line tiny"></div>
						</div>
					</div>
					<div class="embed-content">
						<div class="wireframe-line short"></div>
						<div class="wireframe-line medium"></div>
					</div>
				</div>
			</div>

			<div class="wireframe-actions dimmed">
				<div class="wireframe-button"></div>
				<div class="wireframe-button"></div>
				<div class="wireframe-button"></div>
				<div class="wireframe-button"></div>
			</div>

			<div class="layer-label embed-label">Embed Layer</div>
		</div>
		<div class="info-card">
			<h3 class="font-semibold mb-2 text-lg">{eventsIntroductionCards[2].title}</h3>
			<p class="text-sm text-muted-foreground mb-4">
				{eventsIntroductionCards[2].richDescription}
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
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		background: var(--card);
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
		border-color: rgb(59 130 246 / 0.3);
	}

	.layer-label {
		position: absolute;
		top: -0.75rem;
		left: 1rem;
		padding: 0.25rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 600;
		background: var(--background);
		border: 1px solid;
	}

	.chrome-label {
		color: rgb(59 130 246);
		border-color: rgb(59 130 246 / 0.3);
		background: rgb(59 130 246 / 0.05);
	}

	.content-label {
		color: rgb(168 85 247);
		border-color: rgb(168 85 247 / 0.3);
		background: rgb(168 85 247 / 0.05);
	}

	.embed-label {
		color: rgb(249 115 22);
		border-color: rgb(249 115 22 / 0.3);
		background: rgb(249 115 22 / 0.05);
	}

	/* Wireframe elements */
	.wireframe-header {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		padding: 0.5rem;
		border-radius: 0.5rem;
		background: rgb(59 130 246 / 0.05);
		border: 1px solid rgb(59 130 246 / 0.2);
	}

	.wireframe-avatar {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background: var(--muted);
		flex-shrink: 0;
	}

	.wireframe-meta {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		flex: 1;
	}

	.wireframe-line {
		height: 0.5rem;
		background: var(--muted);
		border-radius: 0.25rem;
	}

	.wireframe-line.short {
		width: 40%;
	}

	.wireframe-line.shorter {
		width: 25%;
	}

	.wireframe-line.medium {
		width: 60%;
	}

	.wireframe-line.tiny {
		width: 30%;
	}

	.content-placeholder {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem;
		opacity: 0.3;
	}

	.wireframe-actions {
		display: flex;
		gap: 0.75rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		background: rgb(59 130 246 / 0.05);
		border: 1px solid rgb(59 130 246 / 0.2);
	}

	.wireframe-button {
		width: 2rem;
		height: 1.5rem;
		background: var(--muted);
		border-radius: 0.25rem;
	}

	/* Content layer specific */
	.content-active {
		padding: 0.75rem;
		border-radius: 0.5rem;
		background: rgb(168 85 247 / 0.05);
		border: 2px solid rgb(168 85 247 / 0.3);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.content-text {
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.content-plain {
		color: var(--foreground);
	}

	.content-mention {
		color: rgb(249 115 22);
		font-weight: 600;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		background: rgb(249 115 22 / 0.1);
		border: 1px dashed rgb(249 115 22 / 0.3);
	}

	.content-hashtag {
		color: rgb(249 115 22);
		font-weight: 600;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		background: rgb(249 115 22 / 0.1);
		border: 1px dashed rgb(249 115 22 / 0.3);
	}

	.content-embed-ref {
		padding: 0.5rem;
		background: rgb(249 115 22 / 0.1);
		border-radius: 0.375rem;
		border: 1px dashed rgb(249 115 22 / 0.3);
	}

	/* Embed layer specific */
	.content-dimmed {
		padding: 0.75rem;
		border-radius: 0.5rem;
		opacity: 0.4;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.embed-preview {
		padding: 0.75rem;
		background: rgb(249 115 22 / 0.1);
		border-radius: 0.5rem;
		border: 2px solid rgb(249 115 22 / 0.3);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		opacity: 1;
	}

	.embed-header {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.embed-avatar {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background: var(--muted);
		flex-shrink: 0;
	}

	.embed-meta {
		flex: 1;
	}

	.embed-content {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.dimmed {
		opacity: 0.3;
	}

	.arrow-down {
		text-align: center;
		font-size: 2rem;
		color: var(--muted-foreground);
		opacity: 0.5;
	}

	.layer-description {
		text-align: center;
		font-size: 0.875rem;
		color: var(--muted-foreground);
		max-width: 500px;
		margin: 0;
	}

	.layer-description strong {
		color: var(--foreground);
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
