<script lang="ts">
  interface Prop {
    name: string;
    type: string;
    default?: string;
    required?: boolean;
    description: string;
  }

  interface Props {
    props: Prop[];
  }

  let { props }: Props = $props();
</script>

<table class="props-table">
  <thead>
    <tr>
      <th>Prop</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    {#each props as prop}
      <tr>
        <td>
          <code>{prop.name}</code>
          {#if prop.required}
            <span class="required-tag">required</span>
          {/if}
        </td>
        <td><code>{prop.type}</code></td>
        <td>{prop.default ?? '—'}</td>
        <td>{prop.description}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .props-table {
    width: 100%;
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    overflow: hidden;
    border-collapse: collapse;
  }

  .props-table th {
    background: var(--color-accent);
    padding: 0.875rem 1.25rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-muted-foreground);
  }

  .props-table td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.9rem;
  }

  .props-table tr:last-child td {
    border-bottom: none;
  }

  .props-table code {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.85em;
    color: var(--color-primary);
  }

  .required-tag {
    background: color-mix(in srgb, red 20%, transparent);
    color: red;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    margin-left: 0.5rem;
  }
</style>
