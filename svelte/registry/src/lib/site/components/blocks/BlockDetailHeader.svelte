<script lang="ts">
  interface Props {
    title: string;
    description: string;
    icon: string;
    iconGradient?: string;
    badges?: { label: string; variant?: 'default' | 'nip' }[];
  }

  let {
    title,
    description,
    icon,
    iconGradient = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    badges = []
  }: Props = $props();
</script>

<div class="mb-12 pb-12 border-b border-border">
  <div class="flex items-start gap-8">
    <div
      class="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-lg"
      style="background: {iconGradient};"
    >
      {icon}
    </div>
    <div class="flex-1">
      <h1 class="text-4xl font-bold mb-3 -tracking-tight">{title}</h1>
      <p class="text-lg text-muted-foreground mb-4 leading-relaxed">{description}</p>
      {#if badges.length > 0}
        <div class="flex gap-3 flex-wrap">
          {#each badges as badge (badge.label)}
            <span
              class="px-3.5 py-1.5 rounded-lg text-sm {badge.variant === 'nip'
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-muted border-border text-muted-foreground'} border"
            >
              {badge.label}
            </span>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
