<script lang="ts">
  interface Props {
    command: string;
  }

  let { command }: Props = $props();

  function copyToClipboard() {
    navigator.clipboard.writeText(command);
  }
</script>

<section class="install-section">
  <h2>Installation</h2>
  <div class="code-block">
    <code>{command}</code>
    <button class="copy-button" onclick={copyToClipboard}>Copy</button>
  </div>
</section>

<style>
  .install-section {
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 3rem;
  }

  .install-section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .code-block {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.25rem;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.9rem;
    color: var(--color-foreground);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .copy-button {
    padding: 0.5rem 1rem;
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-foreground);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .copy-button:hover {
    background: var(--color-accent);
  }
</style>
