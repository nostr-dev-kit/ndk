/**
 * Convenience import for all embedded event handlers
 *
 * Importing this file registers all default embedded handlers with ContentRenderer.
 * Handlers are located directly under components/ (not nested in event/content/).
 *
 * @example
 * ```ts
 * import '$lib/registry/components/embedded-handlers';
 * // Now all embedded events render with their respective handlers
 * ```
 *
 * Individual handlers can also be imported separately:
 * ```ts
 * import '$lib/registry/components/article-embedded';
 * import '$lib/registry/ui/highlight-embedded';
 * import '$lib/registry/components/note-embedded';
 * ```
 */

import './article-embedded';
import './highlight-embedded';
import './note-embedded';
