import type { NDKFilter } from "../subscription/index.js";
import type { Debugger } from "debug";

/**
 * Filter validation modes for NDK subscriptions.
 *
 * @example
 * ```typescript
 * const ndk = new NDK({
 *     filterValidationMode: "validate" // Throw on invalid filters (default)
 * });
 * ```
 */
export enum NDKFilterValidationMode {
    /**
     * Throw an error when invalid filters are detected (default).
     * Use this in development to catch filter bugs early.
     */
    VALIDATE = "validate",

    /**
     * Automatically fix invalid filters by removing undefined values.
     * Use this in production for lenient handling of dynamic filters.
     */
    FIX = "fix",

    /**
     * Skip validation entirely (legacy behavior).
     */
    IGNORE = "ignore"
}

/**
 * Validates or fixes filters based on the specified mode.
 *
 * This function checks for:
 * - Undefined values in arrays
 * - Invalid data types (non-strings in author/id arrays, non-numbers in kinds)
 * - Invalid hex strings (authors, ids, #e and #p tags must be 64-char hex)
 * - Out-of-range kind numbers (must be 0-65535)
 *
 * @param filters - The filters to validate or fix
 * @param mode - The validation mode to use
 * @param debug - Optional debug instance for logging warnings
 * @returns Original filters (if valid or ignored) or fixed filters (if fix mode)
 * @throws Error if validation fails in VALIDATE mode
 *
 * @example
 * ```typescript
 * // Validate filters (throws on invalid)
 * const validated = processFilters(filters, NDKFilterValidationMode.VALIDATE);
 *
 * // Fix filters (returns cleaned)
 * const cleaned = processFilters(filters, NDKFilterValidationMode.FIX);
 * ```
 */
export function processFilters(
    filters: NDKFilter[],
    mode: NDKFilterValidationMode = NDKFilterValidationMode.VALIDATE,
    debug?: Debugger
): NDKFilter[] {
    if (mode === NDKFilterValidationMode.IGNORE) {
        return filters;
    }

    const issues: string[] = [];
    const processedFilters = filters.map((filter, index) => {
        const result = processFilter(filter, mode, index, issues, debug);
        return result;
    });

    if (mode === NDKFilterValidationMode.VALIDATE && issues.length > 0) {
        throw new Error(`Invalid filter(s) detected:\n${issues.join('\n')}`);
    }

    return processedFilters;
}

/**
 * Process a single filter - either validate it or fix it
 */
function processFilter(
    filter: NDKFilter,
    mode: NDKFilterValidationMode,
    filterIndex: number,
    issues: string[],
    debug?: Debugger
): NDKFilter {
    const isValidating = mode === NDKFilterValidationMode.VALIDATE;
    const cleanedFilter = isValidating ? filter : { ...filter };

    // Process 'ids' array - must be 64-character hex strings
    if (filter.ids) {
        const validIds: string[] = [];
        filter.ids.forEach((id, idx) => {
            if (id === undefined) {
                if (isValidating) {
                    issues.push(`Filter[${filterIndex}].ids[${idx}] is undefined`);
                } else {
                    debug?.(`Fixed: Removed undefined value at ids[${idx}]`);
                }
            } else if (typeof id !== 'string') {
                if (isValidating) {
                    issues.push(`Filter[${filterIndex}].ids[${idx}] is not a string (got ${typeof id})`);
                } else {
                    debug?.(`Fixed: Removed non-string value at ids[${idx}] (was ${typeof id})`);
                }
            } else if (!/^[0-9a-f]{64}$/i.test(id)) {
                if (isValidating) {
                    issues.push(`Filter[${filterIndex}].ids[${idx}] is not a valid 64-char hex string: "${id}"`);
                } else {
                    debug?.(`Fixed: Removed invalid hex string at ids[${idx}]`);
                }
            } else {
                validIds.push(id);
            }
        });

        if (!isValidating) {
            cleanedFilter.ids = validIds.length > 0 ? validIds : undefined;
        }
    }

    // Process 'authors' array - must be 64-character hex strings (pubkeys)
    if (filter.authors) {
        const validAuthors: string[] = [];
        filter.authors.forEach((author, idx) => {
            if (author === undefined) {
                if (isValidating) {
                    issues.push(`Filter[${filterIndex}].authors[${idx}] is undefined`);
                } else {
                    debug?.(`Fixed: Removed undefined value at authors[${idx}]`);
                }
            } else if (typeof author !== 'string') {
                if (isValidating) {
                    issues.push(`Filter[${filterIndex}].authors[${idx}] is not a string (got ${typeof author})`);
                } else {
                    debug?.(`Fixed: Removed non-string value at authors[${idx}] (was ${typeof author})`);
                }
            } else if (!/^[0-9a-f]{64}$/i.test(author)) {
                if (isValidating) {
                    issues.push(`Filter[${filterIndex}].authors[${idx}] is not a valid 64-char hex pubkey: "${author}"`);
                } else {
                    debug?.(`Fixed: Removed invalid hex pubkey at authors[${idx}]`);
                }
            } else {
                validAuthors.push(author);
            }
        });

        if (!isValidating) {
            cleanedFilter.authors = validAuthors.length > 0 ? validAuthors : undefined;
        }
    }

    // Process 'kinds' array - must be non-negative integers
    if (filter.kinds) {
        const validKinds: number[] = [];
        filter.kinds.forEach((kind, idx) => {
            if (kind === undefined) {
                if (isValidating) {
                    issues.push(`Filter[${filterIndex}].kinds[${idx}] is undefined`);
                } else {
                    debug?.(`Fixed: Removed undefined value at kinds[${idx}]`);
                }
            } else if (typeof kind !== 'number') {
                if (isValidating) {
                    issues.push(`Filter[${filterIndex}].kinds[${idx}] is not a number (got ${typeof kind})`);
                } else {
                    debug?.(`Fixed: Removed non-number value at kinds[${idx}] (was ${typeof kind})`);
                }
            } else if (!Number.isInteger(kind)) {
                if (isValidating) {
                    issues.push(`Filter[${filterIndex}].kinds[${idx}] is not an integer: ${kind}`);
                } else {
                    debug?.(`Fixed: Removed non-integer value at kinds[${idx}]: ${kind}`);
                }
            } else if (kind < 0 || kind > 65535) {
                if (isValidating) {
                    issues.push(`Filter[${filterIndex}].kinds[${idx}] is out of valid range (0-65535): ${kind}`);
                } else {
                    debug?.(`Fixed: Removed out-of-range kind at kinds[${idx}]: ${kind}`);
                }
            } else {
                validKinds.push(kind);
            }
        });

        if (!isValidating) {
            cleanedFilter.kinds = validKinds.length > 0 ? validKinds : undefined;
        }
    }

    // Process tag filters (e.g., #e, #p, #t, #a) - values must be strings
    for (const key in filter) {
        if (key.startsWith('#') && key.length === 2) {
            const tagValues = filter[key as `#${string}`];
            if (Array.isArray(tagValues)) {
                const validValues: string[] = [];
                tagValues.forEach((value, idx) => {
                    if (value === undefined) {
                        if (isValidating) {
                            issues.push(`Filter[${filterIndex}].${key}[${idx}] is undefined`);
                        } else {
                            debug?.(`Fixed: Removed undefined value at ${key}[${idx}]`);
                        }
                    } else if (typeof value !== 'string') {
                        if (isValidating) {
                            issues.push(`Filter[${filterIndex}].${key}[${idx}] is not a string (got ${typeof value})`);
                        } else {
                            debug?.(`Fixed: Removed non-string value at ${key}[${idx}] (was ${typeof value})`);
                        }
                    } else {
                        // For #e and #p tags, validate as hex strings
                        if ((key === '#e' || key === '#p') && !/^[0-9a-f]{64}$/i.test(value)) {
                            if (isValidating) {
                                issues.push(`Filter[${filterIndex}].${key}[${idx}] is not a valid 64-char hex string: "${value}"`);
                            } else {
                                debug?.(`Fixed: Removed invalid hex string at ${key}[${idx}]`);
                            }
                        } else {
                            validValues.push(value);
                        }
                    }
                });

                if (!isValidating) {
                    cleanedFilter[key as `#${string}`] = validValues.length > 0 ? validValues : undefined;
                }
            }
        }
    }

    // Clean up undefined fields in fix mode
    if (!isValidating) {
        Object.keys(cleanedFilter).forEach(key => {
            if (cleanedFilter[key as keyof NDKFilter] === undefined) {
                delete cleanedFilter[key as keyof NDKFilter];
            }
        });
    }

    return cleanedFilter;
}