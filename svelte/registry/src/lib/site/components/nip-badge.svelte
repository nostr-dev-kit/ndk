<script lang="ts">
  interface Props {
    nip: string;
  }

  let { nip }: Props = $props();
</script>

<span class="inline-flex items-center px-1.5 py-1 rounded text-[0.625rem] font-medium leading-none bg-secondary text-secondary-foreground opacity-70 pointer-events-none shrink-0">{nip}</span>
