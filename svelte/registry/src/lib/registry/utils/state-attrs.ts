/**
 * State-based data attribute helpers for UI components.
 * Based on bits-ui's state attribute system.
 *
 * These helpers generate consistent `data-state`, `data-disabled`, etc. attributes
 * that provide styling hooks for different component states.
 *
 * @example
 * ```css
 * [data-state="open"] { ... }
 * [data-state="closed"] { ... }
 * [data-disabled] { opacity: 0.5; }
 * [data-loading] { cursor: wait; }
 * ```
 */

/**
 * Returns "open" or "closed" based on condition.
 * Used for components that can be opened/closed (dialogs, dropdowns, collapsibles, etc.)
 *
 * @example
 * ```ts
 * <div data-state={getDataOpenClosed(isOpen)}>
 * ```
 */
export function getDataOpenClosed(condition: boolean): "open" | "closed" {
	return condition ? "open" : "closed";
}

/**
 * Returns "active" or "inactive" based on condition.
 * Used for components that can be active/inactive (tabs, nav items, etc.)
 *
 * @example
 * ```ts
 * <button data-state={getDataActiveInactive(isActive)}>
 * ```
 */
export function getDataActiveInactive(condition: boolean): "active" | "inactive" {
	return condition ? "active" : "inactive";
}

/**
 * Returns "checked" or "unchecked" based on condition.
 * Used for checkboxes, radio buttons, toggle switches, etc.
 *
 * @example
 * ```ts
 * <input data-state={getDataChecked(isChecked)}>
 * ```
 */
export function getDataChecked(condition: boolean): "checked" | "unchecked" {
	return condition ? "checked" : "unchecked";
}

/**
 * Returns empty string (attribute present) or undefined (attribute absent) based on condition.
 * Used for boolean states like disabled, loading, selected, etc.
 *
 * @example
 * ```ts
 * <button data-disabled={getDataDisabled(isDisabled)}>
 * <div data-loading={getDataLoading(isLoading)}>
 * <option data-selected={getDataSelected(isSelected)}>
 * ```
 */
export function getDataDisabled(condition: boolean): "" | undefined {
	return condition ? "" : undefined;
}

export function getDataLoading(condition: boolean): "" | undefined {
	return condition ? "" : undefined;
}

export function getDataSelected(condition: boolean): "" | undefined {
	return condition ? "" : undefined;
}

export function getDataPlaying(condition: boolean): "" | undefined {
	return condition ? "" : undefined;
}

export function getDataUploading(condition: boolean): "" | undefined {
	return condition ? "" : undefined;
}

export function getDataExpanded(condition: boolean): "" | undefined {
	return condition ? "" : undefined;
}

export function getDataHidden(condition: boolean): "" | undefined {
	return condition ? "" : undefined;
}

export function getDataVisible(condition: boolean): "" | undefined {
	return condition ? "" : undefined;
}

/**
 * Generic state attribute helper.
 * Returns the provided state value or undefined if no state.
 *
 * @example
 * ```ts
 * <div data-state={getDataState(currentState)}>  // data-state="loading"
 * <div data-state={getDataState(null)}>          // no data-state attribute
 * ```
 */
export function getDataState(state: string | null | undefined): string | undefined {
	return state ?? undefined;
}

/**
 * Returns a percentage string for progress/value attributes.
 * Useful for progress bars, sliders, upload progress, etc.
 *
 * @example
 * ```ts
 * <div data-progress={getDataProgress(uploadProgress)}>  // data-progress="75%"
 * ```
 */
export function getDataProgress(value: number | null | undefined): string | undefined {
	if (value == null) return undefined;
	return `${Math.round(value)}%`;
}

/**
 * Returns a count string for counting attributes.
 * Useful for badges, notification counts, item counts, etc.
 *
 * @example
 * ```ts
 * <div data-count={getDataCount(notificationCount)}>  // data-count="5"
 * ```
 */
export function getDataCount(count: number | null | undefined): string | undefined {
	if (count == null) return undefined;
	return String(count);
}

/**
 * Returns "horizontal" or "vertical" based on condition.
 * Used for components that support different orientations.
 *
 * @example
 * ```ts
 * <div data-orientation={getDataOrientation(isVertical, true)}>
 * ```
 */
export function getDataOrientation(
	orientation: "horizontal" | "vertical"
): "horizontal" | "vertical" {
	return orientation;
}

/**
 * Returns "ltr" or "rtl" for text direction.
 *
 * @example
 * ```ts
 * <div data-dir={getDataDir(textDirection)}>
 * ```
 */
export function getDataDir(direction: "ltr" | "rtl"): "ltr" | "rtl" {
	return direction;
}
