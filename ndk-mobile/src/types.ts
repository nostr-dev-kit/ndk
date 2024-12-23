export type SettingsStore = {
    getSync: (key: string) => string | null;
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
    delete: (key: string) => Promise<void>;
}