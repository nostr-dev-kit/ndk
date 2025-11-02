<script lang="ts">
  interface Props {
    nip: string;
  }

  let { nip }: Props = $props();
</script>

<span class="nip-badge">{nip}</span>

<style>
  .nip-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.625rem;
    font-weight: 500;
    line-height: 1;
    background: color-mix(in srgb, var(--color-primary) 15%, transparent);
    color: color-mix(in srgb, var(--color-primary) 70%, var(--color-muted-foreground));
    opacity: 0.7;
    pointer-events: none;
    flex-shrink: 0;
  }
</style>
