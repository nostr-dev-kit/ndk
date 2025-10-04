import type { Database } from "sql.js";
import type { CashuMintKeys } from "@nostr-dev-kit/ndk";

export function loadCashuMintKeys(
    db: Database,
    mintUrl: string,
    maxAgeInSecs?: number,
): CashuMintKeys[] | undefined {
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(
        "SELECT keys, cached_at FROM cashu_mint_keys WHERE mint_url = ?",
    );
    stmt.bind([mintUrl]);

    if (stmt.step()) {
        const row = stmt.getAsObject();
        const cachedAt = row.cached_at as number;

        // Check if expired
        if (maxAgeInSecs && now - cachedAt > maxAgeInSecs) {
            console.debug(`🗄️ [Cache] Mint keys for ${mintUrl} expired (age: ${now - cachedAt}s, max: ${maxAgeInSecs}s)`);
            stmt.free();
            return undefined;
        }

        const keys = JSON.parse(row.keys as string) as CashuMintKeys[];
        console.debug(`✅ [Cache] Loaded ${keys.length} keyset(s) for ${mintUrl} from cache (age: ${now - cachedAt}s)`);
        stmt.free();
        return keys;
    }

    console.debug(`❌ [Cache] No cached mint keys found for ${mintUrl}`);
    stmt.free();
    return undefined;
}
