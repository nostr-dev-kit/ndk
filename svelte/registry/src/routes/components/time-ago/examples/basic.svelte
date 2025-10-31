<script lang="ts">
  import TimeAgo from '$lib/registry/components/time-ago/time-ago.svelte';

  // Different timestamps for demonstration
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutesAgo = now - (5 * 60);
  const twoHoursAgo = now - (2 * 60 * 60);
  const threeDaysAgo = now - (3 * 24 * 60 * 60);
  const twoWeeksAgo = now - (14 * 24 * 60 * 60);
</script>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <span class="text-muted-foreground">5 minutes ago:</span>
    <TimeAgo timestamp={fiveMinutesAgo} class="font-semibold" />
  </div>

  <div class="flex items-center gap-2">
    <span class="text-muted-foreground">2 hours ago:</span>
    <TimeAgo timestamp={twoHoursAgo} class="font-semibold" />
  </div>

  <div class="flex items-center gap-2">
    <span class="text-muted-foreground">3 days ago:</span>
    <TimeAgo timestamp={threeDaysAgo} class="font-semibold" />
  </div>

  <div class="flex items-center gap-2">
    <span class="text-muted-foreground">2 weeks ago:</span>
    <TimeAgo timestamp={twoWeeksAgo} class="font-semibold" />
  </div>

  <div class="flex items-center gap-2">
    <span class="text-muted-foreground">As semantic time element:</span>
    <TimeAgo timestamp={twoHoursAgo} element="time" class="font-semibold text-primary" />
  </div>
</div>
