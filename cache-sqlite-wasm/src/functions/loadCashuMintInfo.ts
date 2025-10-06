import type { CashuMintInfo } from "@nostr-dev-kit/ndk";
import type { Database } from "sql.js";

export function loadCashuMintInfo(db: Database, mintUrl: string, maxAgeInSecs?: number): CashuMintInfo | undefined {
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare("SELECT info, cached_at FROM cashu_mint_info WHERE mint_url = ?");
    stmt.bind([mintUrl]);

    if (stmt.step()) {
        const row = stmt.getAsObject();
        const cachedAt = row.cached_at as number;

        // Check if expired
        if (maxAgeInSecs && now - cachedAt > maxAgeInSecs) {
            console.debug(
                `🗄️ [Cache] Mint info for ${mintUrl} expired (age: ${now - cachedAt}s, max: ${maxAgeInSecs}s)`,
            );
            stmt.free();
            return undefined;
        }

        const info = JSON.parse(row.info as string) as CashuMintInfo;
        console.debug(`✅ [Cache] Loaded mint info for ${mintUrl} from cache (age: ${now - cachedAt}s)`);
        stmt.free();
        return info;
    }

    console.debug(`❌ [Cache] No cached mint info found for ${mintUrl}`);
    stmt.free();
    return undefined;
}
