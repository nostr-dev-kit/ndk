<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '../../utils/index.js';
  import { User } from '../../ui/user';
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from '../../ui/user/context.svelte.js';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** User's pubkey */
    pubkey: string;

    /** Card width (default: w-[280px]) */
    width?: string;

    /** Card height (default: h-[380px]) */
    height?: string;

    /** Primary color for gradient (default: derived from pubkey) */
    primaryColor?: string;

    /** Background variant: 'gradient' (default) or 'transparent' */
    variant?: 'gradient' | 'transparent';

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    pubkey,
    width = 'w-[280px]',
    height = 'h-[380px]',
    primaryColor,
    variant = 'gradient',
    onclick,
    class: className = ''
  }: Props = $props();

  // Generate color from pubkey if not provided
  function pubkeyToColor(pubkey: string): string {
    let hash = 0;
    for (let i = 0; i < Math.min(pubkey.length, 32); i++) {
      hash = pubkey.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);
    const saturation = 60 + (Math.abs(hash >> 8) % 30);
    const lightness = 50 + (Math.abs(hash >> 16) % 15);

    return hslToHex(hue, saturation, lightness);
  }

  function hslToHex(h: number, s: number, l: number): string {
    const rgb = hslToRgb(h, s, l);
    return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
  }

  const derivedPrimaryColor = $derived(primaryColor || pubkeyToColor(pubkey));

  const baseClasses = cn(
    'user-card-glass',
    'group relative flex flex-col flex-shrink-0 overflow-hidden',
    width,
    height,
    className
  );

  const interactiveClasses = onclick ? 'cursor-pointer' : '';

  // Parse hex color to RGB
  function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : { r: 99, g: 102, b: 241 }; // fallback to indigo
  }

  // Rotate hue to create complementary colors
  function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    } else {
      s = 0;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  // Generate color palette from primary color
  const rgb = $derived(hexToRgb(derivedPrimaryColor));
  const hsl = $derived(rgbToHsl(rgb.r, rgb.g, rgb.b));

  // Create complementary and analogous colors
  const complementaryHue = $derived((hsl.h + 180) % 360);
  const analogousHue = $derived((hsl.h + 60) % 360);

  const complementary = $derived(hslToRgb(complementaryHue, hsl.s, hsl.l));
  const analogous = $derived(hslToRgb(analogousHue, hsl.s, hsl.l));

  // Create darker base colors for background
  const darkBase1 = $derived(hslToRgb(hsl.h, Math.min(hsl.s * 0.8, 60), 15));
  const darkBase2 = $derived(hslToRgb(hsl.h, Math.min(hsl.s * 0.6, 40), 8));
</script>

<User.Root {ndk} {pubkey}>
  {@const context = getContext<UserContext>(USER_CONTEXT_KEY)}
  {@const user = context.ndkUser}

  <svelte:element
    this={onclick ? 'button' : 'div'}
    type={onclick ? 'button' : undefined}
    {onclick}
    class={cn(baseClasses, interactiveClasses)}
    style="
      --primary-color: {rgb.r}, {rgb.g}, {rgb.b};
      --complementary-color: {complementary.r}, {complementary.g}, {complementary.b};
      --analogous-color: {analogous.r}, {analogous.g}, {analogous.b};
      --dark-base-1: {darkBase1.r}, {darkBase1.g}, {darkBase1.b};
      --dark-base-2: {darkBase2.r}, {darkBase2.g}, {darkBase2.b};
    "
  >
    <!-- Glass card container -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full px-6 py-8">
      <!-- Frosted glass card -->
      <div class="glass-card rounded-3xl p-6 flex flex-col items-center gap-4 w-full backdrop-blur-xl overflow-hidden">
        {#if variant === 'gradient'}
          <!-- Animated gradient mesh background -->
          <div class="absolute inset-0 glass-gradient -z-10"></div>

          <!-- Noise texture overlay -->
          <div class="absolute inset-0 noise-texture opacity-30 -z-10"></div>
        {/if}

        <!-- Avatar with glow -->
        <div class="relative">
          <div class="absolute inset-0 avatar-glow rounded-full blur-xl"></div>
          <User.Avatar class="relative w-24 h-24 ring-4 ring-white/20" />

          <!-- Verification badge -->
          {#if context.profile?.nip05}
            <div class="absolute -top-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white/50 shadow-lg">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
          {/if}
        </div>

        <!-- Name and title -->
        <div class="flex flex-col items-center gap-1 w-full">
          <User.Name field="displayName" class="text-xl font-bold text-white line-clamp-1 text-center" />
          <User.Field field="name" class="text-sm text-white/70 line-clamp-1 text-center" />
        </div>

        <!-- Bio -->
        <User.Field field="about" class="text-sm text-white/80 leading-relaxed line-clamp-2 text-center min-h-[2.5rem]" />

        <!-- Action buttons -->
        <div class="flex items-center gap-3 mt-2">
          <!-- Star/Favorite button -->
          <button
            type="button"
            class="glass-button w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md hover:scale-110 transition-transform"
            onclick={(e) => { e.stopPropagation(); }}
          >
            <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </button>

          <!-- Share button -->
          <button
            type="button"
            class="glass-button w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md hover:scale-110 transition-transform"
            onclick={(e) => { e.stopPropagation(); }}
          >
            <svg class="w-5 h-5 text-white/90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </svelte:element>
</User.Root>

<style>
  .glass-gradient {
    background:
      radial-gradient(circle at 20% 30%, rgba(var(--primary-color), 0.8) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(var(--complementary-color), 0.8) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(var(--analogous-color), 0.6) 0%, transparent 70%),
      linear-gradient(135deg, rgb(var(--dark-base-1)) 0%, rgb(var(--dark-base-2)) 100%);
    animation: gradient-shift 8s ease infinite;
  }

  @keyframes gradient-shift {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.9;
    }
  }

  .noise-texture {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }

  .glass-card {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
      0 8px 32px 0 rgba(0, 0, 0, 0.37),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.3);
  }

  .glass-button {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.25);
  }

  .glass-button:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.15) 100%
    );
  }

  .avatar-glow {
    background: radial-gradient(
      circle,
      rgba(var(--primary-color), 0.6) 0%,
      rgba(var(--analogous-color), 0.3) 50%,
      transparent 100%
    );
    animation: pulse-glow 3s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  /* Hover effect for the entire card */
  .user-card-glass:hover .glass-card {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow:
      0 12px 40px 0 rgba(0, 0, 0, 0.45),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.4);
  }

  .user-card-glass:hover .avatar-glow {
    opacity: 1;
    transform: scale(1.2);
  }
</style>
