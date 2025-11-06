/**
 * Data attribute generation system for UI components.
 * Based on bits-ui's attribute system but without external dependencies.
 *
 * Generates consistent `data-{component}-{part}` attributes for:
 * - Component part identification (styling hooks)
 * - Internal DOM queries
 * - Debugging and development
 */

type AttrsConfig = {
	component: string;
	parts: readonly string[];
};

type AttrsObject<TParts extends readonly string[]> = {
	[K in TParts[number]]: string;
} & {
	getAttr(part: string): string;
};

class Attrs<TParts extends readonly string[]> {
	#prefix: string;
	#parts: TParts;
	attrs: AttrsObject<TParts>;

	constructor(config: AttrsConfig & { parts: TParts }) {
		this.#prefix = `data-${config.component}-`;
		this.#parts = config.parts;

		// Create attrs object with each part as a key
		const attrsObj = {} as AttrsObject<TParts>;

		for (const part of config.parts) {
			(attrsObj as any)[part] = this.getAttr(part);
		}

		attrsObj.getAttr = this.getAttr.bind(this);

		this.attrs = attrsObj;
	}

	getAttr(part: string): string {
		return `${this.#prefix}${part}`;
	}
}

/**
 * Creates a data attribute object for a component.
 *
 * @example
 * ```ts
 * const articleAttrs = createAttrs({
 *   component: "article",
 *   parts: ["root", "title", "image", "summary", "reading-time"]
 * });
 *
 * // Use in components:
 * <div {attrs[articleAttrs.attrs.root]}="">  // data-article-root=""
 * <h2 {attrs[articleAttrs.attrs.title]}="">  // data-article-title=""
 * ```
 */
export function createAttrs<TParts extends readonly string[]>(
	config: AttrsConfig & { parts: TParts }
): AttrsObject<TParts> {
	return new Attrs(config).attrs;
}

/**
 * Helper to get a single data attribute string.
 * Useful when you only need one attribute without creating a full attrs object.
 *
 * @example
 * ```ts
 * const attr = getAttr("user-card", "root");  // "data-user-card-root"
 * <div {attr}="" />
 * ```
 */
export function getAttr(component: string, part: string): string {
	return `data-${component}-${part}`;
}
