// @ndk-version: emoji-picker@0.2.0
/**
 * EmojiPicker - Flexible emoji selection components
 *
 * A composable system for displaying and selecting emojis from multiple sources:
 * - User's custom emojis from Nostr (NIP-51 kind:10030)
 * - Aggregated emojis from specified pubkeys (sorted by frequency)
 * - Default/standard emoji sets
 *
 * @example Primitive usage (custom layout):
 * ```svelte
 * <EmojiPicker.List
 *   emojis={[{ emoji: '❤️' }, { emoji: '👍' }]}
 *   onSelect={(emoji) => handleSelect(emoji)}
 *   columns={6}
 * />
 * ```
 *
 * @example Opinionated usage (sections + builder):
 * ```svelte
 * <EmojiPicker.Content
 *   {ndk}
 *   onSelect={(emoji) => handleSelect(emoji)}
 *   defaults={[{ emoji: '❤️' }, { emoji: '👍' }]}
 * />
 * ```
 *
 * @example In a popover (see reaction-action.svelte):
 * ```svelte
 * <Popover.Root bind:open={showPicker}>
 *   <Popover.Trigger>Pick emoji</Popover.Trigger>
 *   <Popover.Content>
 *     <EmojiPicker.Content {ndk} onSelect={handleSelect} />
 *   </Popover.Content>
 * </Popover.Root>
 * ```
 */

import List from './emoji-picker-list.svelte';
import Content from './emoji-picker-content.svelte';

// Export as namespace for dot notation
export const EmojiPicker = {
  List,
  Content,
};

// Export types from the builder
export type { EmojiData, EmojiPickerConfig } from '@nostr-dev-kit/svelte';
