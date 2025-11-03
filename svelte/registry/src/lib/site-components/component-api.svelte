<script lang="ts">
	interface Prop {
		name: string;
		type: string;
		default?: string;
		description: string;
		required?: boolean;
	}

	interface ComponentDoc {
		name: string;
		description: string;
		props?: Prop[];
		events?: { name: string; description: string }[];
		slots?: { name: string; description: string }[];
		importPath?: string;
	}

	interface Props {
		/** Array of component documentation */
		components: ComponentDoc[];

		/** Optional title for the API section */
		title?: string;
	}

	let { components, title = 'Component API' }: Props = $props();
</script>

<section class="component-api">
	<h2 class="section-title">{title}</h2>

	<div class="components-grid">
		{#each components as component}
			<div class="component-card">
				<div class="component-header">
					<h3 class="component-name">{component.name}</h3>
					{#if component.importPath}
						<code class="import-path">{component.importPath}</code>
					{/if}
				</div>

				<p class="component-description">{component.description}</p>

				{#if component.props && component.props.length > 0}
					<div class="api-section">
						<h4 class="api-section-title">Props</h4>
						<div class="props-list">
							{#each component.props as prop}
								<div class="prop-item">
									<div class="prop-header">
										<code class="prop-name">{prop.name}</code>
										{#if prop.required}
											<span class="required-badge">required</span>
										{/if}
									</div>
									<code class="prop-type">{prop.type}</code>
									{#if prop.default}
										<div class="prop-default">
											<span class="label">Default:</span>
											<code>{prop.default}</code>
										</div>
									{/if}
									<p class="prop-description">{prop.description}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if component.events && component.events.length > 0}
					<div class="api-section">
						<h4 class="api-section-title">Events</h4>
						<div class="events-list">
							{#each component.events as event}
								<div class="event-item">
									<code class="event-name">{event.name}</code>
									<p class="event-description">{event.description}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if component.slots && component.slots.length > 0}
					<div class="api-section">
						<h4 class="api-section-title">Slots</h4>
						<div class="slots-list">
							{#each component.slots as slot}
								<div class="slot-item">
									<code class="slot-name">{slot.name}</code>
									<p class="slot-description">{slot.description}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>

<style>
	.component-api {
		margin: 2rem 0;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--foreground);
		margin: 0 0 1.5rem 0;
	}

	.components-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.component-card {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	.component-header {
		margin-bottom: 0.75rem;
	}

	.component-name {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--foreground);
		margin: 0 0 0.5rem 0;
	}

	.import-path {
		display: inline-block;
		font-size: 0.75rem;
		color: var(--muted-foreground);
		background: var(--muted);
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-family: 'Monaco', 'Courier New', monospace;
	}

	.component-description {
		font-size: 0.875rem;
		color: var(--muted-foreground);
		margin: 0 0 1.5rem 0;
		line-height: 1.6;
	}

	.api-section {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.api-section:first-of-type {
		margin-top: 0;
		padding-top: 0;
		border-top: none;
	}

	.api-section-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--foreground);
		margin: 0 0 1rem 0;
	}

	.props-list,
	.events-list,
	.slots-list {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.prop-item,
	.event-item,
	.slot-item {
		background: color-mix(in srgb, var(--muted) calc(0.3 * 100%), transparent);
		padding: 1rem;
		border-radius: 0.5rem;
		border: 1px solid var(--border);
	}

	.prop-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.prop-name,
	.event-name,
	.slot-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--primary);
		font-family: 'Monaco', 'Courier New', monospace;
	}

	.required-badge {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--destructive-foreground);
		background: var(--destructive);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.prop-type {
		display: block;
		font-size: 0.8125rem;
		color: var(--foreground);
		background: var(--muted);
		padding: 0.5rem;
		border-radius: 0.25rem;
		font-family: 'Monaco', 'Courier New', monospace;
		margin: 0.5rem 0;
		overflow-x: auto;
	}

	.prop-default {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: var(--muted-foreground);
		margin: 0.5rem 0;
	}

	.prop-default .label {
		font-weight: 500;
	}

	.prop-default code {
		font-family: 'Monaco', 'Courier New', monospace;
		background: var(--muted);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.prop-description,
	.event-description,
	.slot-description {
		font-size: 0.875rem;
		color: var(--muted-foreground);
		margin: 0.5rem 0 0 0;
		line-height: 1.6;
	}
</style>
