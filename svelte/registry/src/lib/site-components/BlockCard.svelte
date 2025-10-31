<script lang="ts">
  interface Props {
    title: string;
    description: string;
    icon: string;
    href: string;
    variantCount: number;
    badges?: { label: string; variant?: 'default' | 'nip' }[];
    gradient?: string;
    iconGradient?: string;
  }

  let {
    title,
    description,
    icon,
    href,
    variantCount,
    badges = [],
    gradient = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    iconGradient = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
  }: Props = $props();
</script>

<a {href} class="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer no-underline text-inherit block hover:bg-accent hover:border-border/50">
  <div class="p-8 flex items-center justify-center h-[200px] relative" style="background: {gradient};">
    <div class="w-20 h-20 rounded-[20px] flex items-center justify-center text-[2.5rem] shadow-lg" style="background: {iconGradient};">
      {icon}
    </div>
    <div class="absolute bottom-6 right-6 bg-background/80 backdrop-blur-[10px] border border-border rounded-lg p-3 text-xs text-muted-foreground">
      {variantCount} variants
    </div>
  </div>
  <div class="p-6">
    <h3 class="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p class="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>
    {#if badges.length > 0}
      <div class="flex gap-2 flex-wrap">
        {#each badges as badge}
          <span class="py-1 px-2.5 {badge.variant === 'nip' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border text-muted-foreground'} border rounded-md text-xs">
            {badge.label}
          </span>
        {/each}
      </div>
    {/if}
  </div>
</a>
