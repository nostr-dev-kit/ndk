/**
 * Allows callers of the library to provide their own small-object storage solution.
 * 
 * This could be localStorage in the browser, or a secure storage in mobile.
 */
export type SettingsStore = {
    getSync: (key: string) => string | null;
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
    delete: (key: string) => Promise<void>;
};
