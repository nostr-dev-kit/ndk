<!-- HoverCard.svelte -->
<script lang="ts">
  import { Popover } from 'bits-ui';
  import type { Snippet } from 'svelte';

  interface Props {
    trigger: Snippet;
    content: Snippet;
  }

  let { trigger, content }: Props = $props();

  let open = $state(false);
  let hoverTimeout: number | undefined = $state();

  function handleMouseEnter() {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = window.setTimeout(() => {
      open = true;
    }, 300);
  }

  function handleMouseLeave() {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = window.setTimeout(() => {
      open = false;
    }, 200);
  }
</script>

<Popover.Root bind:open>
  <div
    role="button"
    tabindex="0"
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
  >
    <Popover.Trigger>
      {@render trigger()}
    </Popover.Trigger>
    <Popover.Content>
      {@render content()}
    </Popover.Content>
  </div>
</Popover.Root>

<!-- Usage -->
<HoverCard>
  {#snippet trigger()}
    <User.Root {ndk} {pubkey}>
      <div class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
        <User.Avatar size={32} />
        <User.Name class="text-sm font-medium" />
      </div>
    </User.Root>
  {/snippet}
  {#snippet content()}
    <UserCardClassic {ndk} {pubkey} />
  {/snippet}
</HoverCard>
