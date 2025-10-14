import type {
    CacheModuleDefinition,
    CacheModuleCollection,
    CacheModuleMigrationContext,
} from "@nostr-dev-kit/ndk";
import Dexie, { type Table } from "dexie";
import createDebug from "debug";

const debug = createDebug("ndk:dexie-adapter:modules");

/**
 * Module metadata stored in the database
 */
interface ModuleMetadata {
    namespace: string;
    version: number;
    lastMigration: number;
    collections: string[];
}

/**
 * Implementation of CacheModuleCollection using Dexie Table
 */
class DexieModuleCollection<T> implements CacheModuleCollection<T> {
    constructor(private db: Dexie, private tableName: string) {}

    private get table(): Table<T> {
        return (this.db as any)[this.tableName] as Table<T>;
    }

    async get(id: string): Promise<T | null> {
        const result = await this.table.get(id);
        return result || null;
    }

    async getMany(ids: string[]): Promise<T[]> {
        const results = await this.table.where(':id').anyOf(ids).toArray();
        return results;
    }

    async save(item: T): Promise<void> {
        await this.table.put(item);
    }

    async saveMany(items: T[]): Promise<void> {
        await this.table.bulkPut(items);
    }

    async delete(id: string): Promise<void> {
        await this.table.delete(id);
    }

    async deleteMany(ids: string[]): Promise<void> {
        await this.table.where(':id').anyOf(ids).delete();
    }

    async findBy(field: string, value: any): Promise<T[]> {
        return await this.table.where(field).equals(value).toArray();
    }

    async where(conditions: Record<string, any>): Promise<T[]> {
        let collection = this.table.toCollection();

        for (const [field, value] of Object.entries(conditions)) {
            collection = collection.and(item => (item as any)[field] === value);
        }

        return await collection.toArray();
    }

    async all(): Promise<T[]> {
        return await this.table.toArray();
    }

    async count(conditions?: Record<string, any>): Promise<number> {
        if (!conditions) {
            return await this.table.count();
        }

        let collection = this.table.toCollection();

        for (const [field, value] of Object.entries(conditions)) {
            collection = collection.and(item => (item as any)[field] === value);
        }

        return await collection.count();
    }

    async clear(): Promise<void> {
        await this.table.clear();
    }
}

/**
 * Module manager for a Dexie cache adapter
 */
export class DexieCacheModuleManager {
    private modules = new Map<string, CacheModuleDefinition>();
    private moduleDb: Dexie;
    private initialized = false;

    constructor(private dbName: string) {
        this.moduleDb = new Dexie(`${dbName}_modules`);
        this.setupDatabase();
    }

    private setupDatabase() {
        // Initial version with module metadata
        this.moduleDb.version(1).stores({
            moduleMetadata: "&namespace",
        });
    }

    /**
     * Register a cache module
     */
    async registerModule(module: CacheModuleDefinition): Promise<void> {
        // Open the database if not already open
        if (!this.moduleDb.isOpen()) {
            await this.moduleDb.open();
        }

        const metadataTable = this.moduleDb.table('moduleMetadata');
        const existingMetadata = await metadataTable.get(module.namespace);
        const currentVersion = existingMetadata?.version || 0;

        if (currentVersion >= module.version) {
            debug(`Module ${module.namespace} is already at version ${currentVersion}`);
            return;
        }

        // Calculate new database version
        const currentDbVersion = this.moduleDb.verno;
        const newDbVersion = currentDbVersion + 1;

        // Close and reopen with new schema
        this.moduleDb.close();

        // Create stores object for all collections
        const stores: Record<string, string | null> = {
            moduleMetadata: "&namespace",
        };

        // Add module collections
        for (const [collName, collDef] of Object.entries(module.collections)) {
            const tableName = `${module.namespace}_${collName}`;
            let indexString = `&${collDef.primaryKey}`;

            if (collDef.indexes) {
                indexString += `, ${collDef.indexes.join(", ")}`;
            }

            if (collDef.compoundIndexes) {
                const compounds = collDef.compoundIndexes.map(fields => `[${fields.join("+")}]`);
                indexString += `, ${compounds.join(", ")}`;
            }

            stores[tableName] = indexString;
        }

        // Apply the new version
        this.moduleDb.version(newDbVersion).stores(stores);

        // Reopen the database
        await this.moduleDb.open();

        // Run migrations
        for (let version = currentVersion + 1; version <= module.version; version++) {
            if (module.migrations[version]) {
                debug(`Running migration ${version} for module ${module.namespace}`);

                const context: CacheModuleMigrationContext = {
                    fromVersion: currentVersion,
                    toVersion: version,

                    async getCollection(name: string): Promise<CacheModuleCollection<any>> {
                        return new DexieModuleCollection(this.moduleDb, `${module.namespace}_${name}`);
                    },

                    async createCollection(name: string, definition: any): Promise<void> {
                        // Collections are created above, this is a no-op for Dexie
                        debug(`Collection ${name} created during schema update`);
                    },

                    async deleteCollection(name: string): Promise<void> {
                        // Would require another version bump
                        debug(`Collection deletion requires database recreation`);
                    },

                    async addIndex(collection: string, field: string | string[]): Promise<void> {
                        // Would require another version bump
                        debug(`Index addition requires database recreation`);
                    },
                };

                await module.migrations[version](context);
            }
        }

        // Update metadata
        await metadataTable.put({
            namespace: module.namespace,
            version: module.version,
            lastMigration: Date.now(),
            collections: Object.keys(module.collections),
        });

        this.modules.set(module.namespace, module);
        debug(`Module ${module.namespace} registered at version ${module.version}`);
    }

    /**
     * Get a collection from a module
     */
    async getModuleCollection<T>(namespace: string, collection: string): Promise<CacheModuleCollection<T>> {
        if (!this.moduleDb.isOpen()) {
            await this.moduleDb.open();
        }

        const tableName = `${namespace}_${collection}`;
        const table = (this.moduleDb as any)[tableName];

        if (!table) {
            const metadata = await this.moduleDb.table('moduleMetadata').get(namespace);
            if (!metadata) {
                throw new Error(`Module ${namespace} not registered`);
            }
            throw new Error(`Collection ${collection} not found in module ${namespace}`);
        }

        return new DexieModuleCollection<T>(this.moduleDb, tableName);
    }

    /**
     * Check if a module is registered
     */
    hasModule(namespace: string): boolean {
        return this.modules.has(namespace);
    }

    /**
     * Get the current version of a module
     */
    async getModuleVersion(namespace: string): Promise<number> {
        if (!this.moduleDb.isOpen()) {
            await this.moduleDb.open();
        }

        const metadata = await this.moduleDb.table('moduleMetadata').get(namespace);
        return metadata?.version || 0;
    }
}