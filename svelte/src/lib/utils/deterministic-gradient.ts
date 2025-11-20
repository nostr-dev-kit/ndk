/**
 * Generate a deterministic gradient based on the first 6 characters of a pubkey.
 * The gradient will always be the same for the same pubkey.
 *
 * @param pubkey - Nostr pubkey (hex format)
 * @returns CSS gradient string
 *
 * @example
 * ```ts
 * const gradient = deterministicPubkeyGradient('abc123...');
 * // Returns: 'linear-gradient(135deg, #abc123, hsl(210, 50%, 60%))'
 * ```
 */
export function deterministicPubkeyGradient(pubkey: string): string {
  const hex = pubkey.slice(0, 6);
  const color1 = `#${hex}`;

  // Generate second color by slightly adjusting lightness
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Convert to HSL
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r / 255:
        h = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g / 255:
        h = ((b / 255 - r / 255) / d + 2) / 6;
        break;
      case b / 255:
        h = ((r / 255 - g / 255) / d + 4) / 6;
        break;
    }
  }

  // Subtle variation: slightly rotate hue (30 degrees) and adjust lightness
  const hue2 = ((h * 360 + 30) % 360);
  const lightness2 = Math.min(l * 100 + 10, 90);

  return `linear-gradient(135deg, ${color1}, hsl(${hue2}, ${s * 100}%, ${lightness2}%))`;
}
