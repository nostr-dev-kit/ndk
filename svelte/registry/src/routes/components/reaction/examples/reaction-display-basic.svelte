<script lang="ts">
  import { Reaction } from '$lib/registry/components/reaction';
</script>

<div class="flex flex-wrap items-center gap-6">
  <!-- Standard emojis -->
  <Reaction.Display emoji="❤️" size={24} />
  <Reaction.Display emoji="🔥" size={24} />
  <Reaction.Display emoji="👍" size={24} />
  <Reaction.Display emoji="🚀" size={24} />

  <!-- Different sizes -->
  <div class="flex items-center gap-2">
    <Reaction.Display emoji="💜" size={16} />
    <Reaction.Display emoji="💜" size={20} />
    <Reaction.Display emoji="💜" size={24} />
    <Reaction.Display emoji="💜" size={32} />
  </div>
</div>
