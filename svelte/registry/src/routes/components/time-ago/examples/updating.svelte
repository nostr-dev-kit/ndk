<script lang="ts">
  import TimeAgo from '$lib/components/ndk/time-ago/time-ago.svelte';

  // Create a timestamp that's 30 seconds ago to demonstrate the auto-update
  const thirtySecondsAgo = Math.floor(Date.now() / 1000) - 30;
</script>

<div class="space-y-4">
  <div class="rounded-lg border p-4 bg-muted/50">
    <p class="text-sm text-muted-foreground mb-2">
      This timestamp updates automatically every minute.
      Currently showing time 30 seconds ago:
    </p>
    <div class="text-2xl font-bold">
      <TimeAgo timestamp={thirtySecondsAgo} />
    </div>
  </div>

  <p class="text-sm text-muted-foreground">
    Wait for the minute to change and watch the display update automatically.
    The component uses a 60-second interval to update all visible timestamps.
  </p>
</div>
