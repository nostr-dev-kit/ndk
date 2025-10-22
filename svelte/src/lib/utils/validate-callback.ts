/**
 * Validates that a parameter is a function and throws a descriptive error if not.
 *
 * @param param - The parameter to validate
 * @param functionName - The name of the function that expects the callback (for error messages)
 * @param paramName - The name of the parameter (for error messages)
 * @throws {TypeError} If the parameter is not a function
 */
export function validateCallback(param: unknown, functionName: string, paramName: string): void {
    if (typeof param !== 'function') {
        throw new TypeError(
            `${functionName} expects ${paramName} to be a function, but received ${typeof param}. ` +
            `Example: ndk.${functionName}(() => value) instead of ndk.${functionName}(value)`
        );
    }
}
