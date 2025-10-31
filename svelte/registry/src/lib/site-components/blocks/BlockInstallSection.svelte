<script lang="ts">
  interface Props {
    command: string;
  }

  let { command }: Props = $props();

  function copyToClipboard() {
    navigator.clipboard.writeText(command);
  }
</script>

<section class="bg-muted border border-border rounded-2xl p-8 mb-12">
  <h2 class="text-xl font-semibold mb-4">Installation</h2>
  <div class="bg-background border border-border rounded-xl p-5 font-mono text-sm text-foreground flex justify-between items-center">
    <code>{command}</code>
    <button
      class="px-4 py-2 bg-muted border border-border rounded-md text-foreground text-sm cursor-pointer transition-all hover:bg-accent"
      onclick={copyToClipboard}
    >
      Copy
    </button>
  </div>
</section>
