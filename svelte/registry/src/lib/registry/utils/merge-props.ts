/**
 * Merges multiple prop objects, with later arguments taking precedence.
 * Handles class and style specially to concatenate rather than override.
 */
export function mergeProps<T extends Record<string, any>>(
  ...sources: T[]
): T {
  const result: Record<string, any> = {};

  for (const source of sources) {
    for (const [key, value] of Object.entries(source || {})) {
      if (value === undefined) continue;

      if (key === 'class' || key === 'className') {
        // Concatenate classes
        const existingClass = result.class || result.className || '';
        result[key] = existingClass ? `${existingClass} ${value}` : value;
      } else if (key === 'style') {
        // Merge styles
        const existingStyle = result.style || '';
        result.style = existingStyle ? `${existingStyle}; ${value}` : value;
      } else {
        // For other props, later values override
        result[key] = value;
      }
    }
  }

  return result as T;
}
