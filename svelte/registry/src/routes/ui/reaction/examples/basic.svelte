<script lang="ts">
  import { Reaction } from '$lib/registry/ui';
</script>

<div class="reaction-demo">
  <div class="emoji-row">
    <Reaction.Display emoji="❤️" size={24} />
    <Reaction.Display emoji="🔥" size={24} />
    <Reaction.Display emoji="👍" size={24} />
    <Reaction.Display emoji="🚀" size={24} />
    <Reaction.Display emoji="💯" size={24} />
  </div>

  <div class="size-demo">
    <span>Different sizes:</span>
    <Reaction.Display emoji="💜" size={16} />
    <Reaction.Display emoji="💜" size={20} />
    <Reaction.Display emoji="💜" size={24} />
    <Reaction.Display emoji="💜" size={32} />
  </div>
</div>

<style>
  .reaction-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .emoji-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .size-demo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .size-demo span {
    font-size: 0.875rem;
    color: #6b7280;
    margin-right: 0.5rem;
  }
</style>
