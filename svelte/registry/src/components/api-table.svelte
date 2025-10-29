<!--
Standardized API documentation table for props, methods, events, etc.
Use for: component API documentation across all component pages.
-->
<script lang="ts">
	interface ApiRow {
		name: string;
		type: string;
		default?: string;
		description: string;
		required?: boolean;
	}

	interface Props {
		title?: string;
		rows: ApiRow[];
		class?: string;
	}

	let { title, rows, class: className = '' }: Props = $props();
</script>

{#if title}
	<h3 class="api-table-title">{title}</h3>
{/if}

<div class="api-table-container {className}">
	<table class="api-table">
		<thead>
			<tr>
				<th>Name</th>
				<th>Type</th>
				<th>Default</th>
				<th>Description</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row}
				<tr>
					<td>
						<code class="prop-name">{row.name}</code>
						{#if row.required}
							<span class="required-badge">required</span>
						{/if}
					</td>
					<td><code class="prop-type">{row.type}</code></td>
					<td>
						{#if row.default}
							<code class="prop-default">{row.default}</code>
						{:else}
							<span class="no-default">-</span>
						{/if}
					</td>
					<td class="prop-description">{row.description}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.api-table-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--color-foreground));
		margin: 2rem 0 1rem 0;
	}

	.api-table-container {
		margin: 1rem 0 2rem 0;
		border: 1px solid hsl(var(--color-border));
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.api-table {
		width: 100%;
		border-collapse: collapse;
		background: hsl(var(--color-card));
		font-size: 0.875rem;
	}

	.api-table thead {
		background: hsl(var(--color-muted) / 0.5);
	}

	.api-table th {
		text-align: left;
		padding: 0.75rem 1rem;
		font-weight: 600;
		color: hsl(var(--color-foreground));
		border-bottom: 1px solid hsl(var(--color-border));
	}

	.api-table td {
		padding: 0.75rem 1rem;
		color: hsl(var(--color-muted-foreground));
		border-bottom: 1px solid hsl(var(--color-border));
		vertical-align: top;
	}

	.api-table tbody tr:last-child td {
		border-bottom: none;
	}

	.api-table code {
		background: hsl(var(--color-muted) / 0.5);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
		font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
	}

	.prop-name {
		color: hsl(var(--color-primary));
		font-weight: 500;
	}

	.prop-type {
		color: hsl(var(--color-foreground));
	}

	.prop-default {
		color: hsl(var(--color-muted-foreground));
	}

	.prop-description {
		color: hsl(var(--color-muted-foreground));
		line-height: 1.5;
	}

	.no-default {
		color: hsl(var(--color-muted-foreground) / 0.5);
	}

	.required-badge {
		display: inline-block;
		margin-left: 0.5rem;
		padding: 0.125rem 0.375rem;
		background: hsl(var(--color-destructive) / 0.1);
		color: hsl(var(--color-destructive));
		border-radius: 0.25rem;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.api-table {
			font-size: 0.8125rem;
		}

		.api-table th,
		.api-table td {
			padding: 0.5rem 0.75rem;
		}

		/* Stack on very small screens */
		@media (max-width: 640px) {
			.api-table thead {
				display: none;
			}

			.api-table tr {
				display: block;
				margin-bottom: 1rem;
				border: 1px solid hsl(var(--color-border));
				border-radius: 0.375rem;
				overflow: hidden;
			}

			.api-table td {
				display: block;
				padding: 0.5rem 0.75rem;
				border-bottom: 1px solid hsl(var(--color-border));
			}

			.api-table td:last-child {
				border-bottom: none;
			}

			.api-table td::before {
				content: attr(data-label);
				font-weight: 600;
				color: hsl(var(--color-foreground));
				display: block;
				margin-bottom: 0.25rem;
			}
		}
	}
</style>
