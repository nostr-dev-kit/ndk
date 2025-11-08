<script lang="ts">
  interface Props {
    nip: string;
  }

  let { nip }: Props = $props();
</script>

<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[0.625rem] font-medium leading-none bg-primary/15 text-primary/70 opacity-70 pointer-events-none shrink-0">{nip}</span>
