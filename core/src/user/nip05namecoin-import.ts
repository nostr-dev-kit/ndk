/**
 * Import-chain expansion for Namecoin Domain Name Object values, per
 * [ifa-0001](https://github.com/namecoin/proposals/blob/master/ifa-0001.md)
 * §"import".
 *
 * Background
 * ----------
 *
 * The 520-byte per-name limit on Namecoin makes apex records crowded.
 * ifa-0001 §"import" lets a record delegate shared blocks into a sibling
 * name (typically `dd/<name>`) via an `"import"` key on the JSON value.
 * Without import-chain handling, NIP-05 lookups against records that use
 * this pattern (the canonical demo target `testls.bit` is one of them)
 * silently fail: the resolver sees the apex value, finds no `nostr`
 * field, and returns `null` — never consulting the imported sibling that
 * actually carries the `nostr.names` block.
 *
 * Semantics implemented (matches the Kotlin reference byte-for-byte):
 *
 *  1. **Trigger.** If the root object has no `import` key, return it
 *     unchanged — zero extra I/O.
 *  2. **Four `import` value shapes** are accepted and normalised to the
 *     canonical array-of-arrays:
 *       - `"d/foo"`
 *       - `["d/foo"]`
 *       - `["d/foo", "selector"]`
 *       - `[["d/foo", "selector"], ...]`
 *     Anything else is treated as no-imports.
 *  3. **Selector walk.** The imported value's `map` tree is walked
 *     DNS-rightmost-first using ifa-0001 §"map" rules: exact label >
 *     `*` wildcard > empty default. Empty selector or no `map` →
 *     imported value used as-is.
 *  4. **Importer-wins merge.** Keys in the importer override keys in
 *     the imported value. `null` in the importer is a "delete" marker
 *     (semantic suppression). Multiple imports merge left-to-right with
 *     the importer stacked on top.
 *  5. **Recursion** up to a configurable depth (default `4`, the
 *     minimum the spec mandates). When exhausted, partial merges still
 *     apply.
 *  6. **Cycle protection** via a visited `(name|selector)` set scoped
 *     to one top-level expansion.
 *  7. **Lenient I/O.** Lookup returning `null`, throwing, or returning
 *     malformed JSON is treated as `{}` — the importer's own fields
 *     still apply.
 *  8. The final `import` key is stripped from the result.
 */

/**
 * Shape of a Namecoin Domain Name Object value once parsed. Conceptually
 * the same as `Record<string, unknown>`, but a named alias makes the
 * lookup callback signature easier to read.
 */
export type NamecoinValue = Record<string, unknown>;

/**
 * Asynchronous lookup callback. Given a Namecoin name (e.g. `dd/foo`),
 * return the raw JSON string of its latest `NAME_UPDATE` value, or
 * `null` if the name does not exist / cannot be fetched.
 *
 * A throw is treated identically to a `null` return per ifa-0001's
 * lenient-by-default posture in this implementation: transient
 * ElectrumX hiccups must not nuke an otherwise resolvable record.
 */
export type NamecoinImportLookup = (name: string) => Promise<string | null>;

/** The minimum recursion depth ifa-0001 requires implementations to support. */
export const DEFAULT_IMPORT_MAX_DEPTH = 4;

interface ImportOp {
    readonly name: string;
    /** DNS-dotted; may be empty. */
    readonly selector: string;
}

/**
 * Expand all `import` items in `root` (and recursively in imported
 * values) up to `maxDepth` levels deep, returning a single merged
 * object with no `import` key.
 *
 * If `root` has no `import` key, the input object is returned
 * unchanged (reference-equal); callers that need a pristine copy
 * should clone before passing it in.
 */
export async function expandImports(
    root: NamecoinValue,
    lookup: NamecoinImportLookup,
    maxDepth: number = DEFAULT_IMPORT_MAX_DEPTH,
): Promise<NamecoinValue> {
    return expandRecursive(root, lookup, maxDepth, new Set<string>());
}

async function expandRecursive(
    obj: NamecoinValue,
    lookup: NamecoinImportLookup,
    budgetRemaining: number,
    visited: Set<string>,
): Promise<NamecoinValue> {
    if (!Object.hasOwn(obj, "import")) {
        return obj;
    }
    const operations = parseImportItem(obj.import);
    if (operations === null) {
        // Malformed import value: strip the key and stop.
        return removeImportKey(obj);
    }
    if (operations.length === 0 || budgetRemaining <= 0) {
        return removeImportKey(obj);
    }

    // Walk imports left-to-right. The spec is silent on multi-import
    // precedence; we follow the common-sense rule that LATER imports
    // override EARLIER ones, then the importing object overrides all.
    let accumulator: NamecoinValue = {};
    for (const op of operations) {
        const visitKey = `${op.name}|${op.selector}`;
        if (visited.has(visitKey)) continue;
        visited.add(visitKey);
        try {
            let importedRaw: string | null = null;
            try {
                importedRaw = await lookup(op.name);
            } catch {
                // Lenient: treat throw as not-found.
                importedRaw = null;
            }
            if (importedRaw === null) continue;
            const importedRoot = tryParseObject(importedRaw);
            if (importedRoot === null) continue;
            const selected = applySelector(importedRoot, op.selector);
            if (selected === null) continue;
            const expanded = await expandRecursive(selected, lookup, budgetRemaining - 1, visited);
            accumulator = mergeImporterWins(expanded, accumulator);
        } finally {
            visited.delete(visitKey);
        }
    }

    const withoutImport = removeImportKey(obj);
    return mergeImporterWins(withoutImport, accumulator);
}

/**
 * Importer-wins merge. Every key in `importer` stays as-is (including
 * `null` values, which suppress the imported counterpart per
 * ifa-0001). Keys present only in `imported` are added.
 */
function mergeImporterWins(importer: NamecoinValue, imported: NamecoinValue): NamecoinValue {
    if (isEmpty(imported)) return importer;
    if (isEmpty(importer)) return imported;
    const out: NamecoinValue = {};
    for (const k of Object.keys(imported)) out[k] = imported[k];
    for (const k of Object.keys(importer)) out[k] = importer[k];
    return out;
}

function isEmpty(obj: NamecoinValue): boolean {
    for (const _ in obj) return false;
    return true;
}

/**
 * Walk the imported object's `map` tree to the node addressed by
 * `selector` (DNS-dotted, e.g. `relay`, `a.b.c`). Empty selector or
 * missing `map` returns the root unchanged.
 *
 * Resolution rules per ifa-0001 §"map":
 *   - Exact label match wins.
 *   - Wildcard `*` matches any label.
 *   - Empty key `""` is the default for the current level.
 *   - A non-object child terminates the walk with `null`.
 */
function applySelector(root: NamecoinValue, selector: string): NamecoinValue | null {
    if (selector.length === 0) return root;
    // DNS-dotted: leftmost label is most specific. The map tree is
    // rooted at the parent and nests inwards toward the leaf, so we
    // walk labels right-to-left.
    const labels = selector
        .split(".")
        .filter((s) => s.length > 0)
        .reverse();
    if (labels.length === 0) return root;

    let current: NamecoinValue = root;
    for (const label of labels) {
        const map = current.map;
        if (!isPlainObject(map)) return null;
        const child = pickObject(map, label) ?? pickObject(map, "*") ?? pickObject(map, "");
        if (child === null) return null;
        current = child;
    }
    return current;
}

function pickObject(map: NamecoinValue, key: string): NamecoinValue | null {
    if (!Object.hasOwn(map, key)) return null;
    const v = map[key];
    return isPlainObject(v) ? v : null;
}

function tryParseObject(raw: string): NamecoinValue | null {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }
    return isPlainObject(parsed) ? parsed : null;
}

function removeImportKey(obj: NamecoinValue): NamecoinValue {
    if (!Object.hasOwn(obj, "import")) return obj;
    const out: NamecoinValue = {};
    for (const k of Object.keys(obj)) {
        if (k !== "import") out[k] = obj[k];
    }
    return out;
}

/**
 * Parse the value of an `import` item into a flat list of operations.
 *
 * Returns:
 *   - a list of `ImportOp` for any well-formed shape (possibly empty)
 *   - `null` only when the value is so malformed that the import is
 *     skipped without further processing (numbers, booleans, plain
 *     objects, etc.)
 *
 * The empty array result is preserved (returns `[]`) for shapes that
 * are syntactically valid but logically empty (`[]`).
 */
function parseImportItem(item: unknown): ImportOp[] | null {
    // Shorthand: bare string.
    if (typeof item === "string") {
        const name = item.trim();
        if (name.length === 0) return null;
        return [{ name, selector: "" }];
    }
    if (!Array.isArray(item)) return null;
    if (item.length === 0) return [];

    // Distinguish: array-of-arrays (canonical) vs array-of-strings (shorthand).
    if (Array.isArray(item[0])) {
        const out: ImportOp[] = [];
        for (const entry of item) {
            if (!Array.isArray(entry)) continue;
            const op = opFromArray(entry);
            if (op !== null) out.push(op);
        }
        return out;
    }
    // Shorthand: ["name"] or ["name", "selector"]. All elements must
    // be strings; anything else makes the whole item malformed.
    const op = opFromArray(item);
    return op === null ? [] : [op];
}

function opFromArray(arr: unknown[]): ImportOp | null {
    if (arr.length === 0) return null;
    const first = arr[0];
    if (typeof first !== "string") return null;
    const name = first.trim();
    if (name.length === 0) return null;

    let selector = "";
    if (arr.length >= 2) {
        const second = arr[1];
        if (typeof second !== "string") return null;
        selector = second.trim();
    }
    // Trailing dot is forbidden by spec; treat as malformed.
    if (selector.endsWith(".")) return null;
    return { name, selector };
}

function isPlainObject(v: unknown): v is NamecoinValue {
    return v !== null && typeof v === "object" && !Array.isArray(v);
}
