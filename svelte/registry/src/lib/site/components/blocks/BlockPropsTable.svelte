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

<table class="w-full bg-muted border border-border rounded-xl overflow-hidden border-collapse">
  <thead>
    <tr>
      <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Prop</th>
      <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Type</th>
      <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Default</th>
      <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Description</th>
    </tr>
  </thead>
  <tbody>
    {#each props as prop (prop.name)}
      <tr>
        <td class="p-4 border-b border-border text-sm last:border-b-0">
          <code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">{prop.name}</code>
          {#if prop.required}
            <span class="bg-red-500/20 text-red-500 py-1 px-2 rounded text-xs font-medium ml-2">required</span>
          {/if}
        </td>
        <td class="p-4 border-b border-border text-sm last:border-b-0">
          <code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">{prop.type}</code>
        </td>
        <td class="p-4 border-b border-border text-sm last:border-b-0">{prop.default ?? '—'}</td>
        <td class="p-4 border-b border-border text-sm last:border-b-0">{prop.description}</td>
      </tr>
    {/each}
  </tbody>
</table>
