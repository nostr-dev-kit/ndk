import type { CashuMintKeys } from "@nostr-dev-kit/ndk";
import type { Database } from "sql.js";

export function saveCashuMintKeys(db: Database, mintUrl: string, keys: CashuMintKeys[]): void {
    const now = Math.floor(Date.now() / 1000);
    const keysJson = JSON.stringify(keys);

    db.run("INSERT OR REPLACE INTO cashu_mint_keys (mint_url, keys, cached_at) VALUES (?, ?, ?)", [
        mintUrl,
        keysJson,
        now,
    ]);

    console.debug(`💾 [Cache] Saved ${keys.length} keyset(s) for ${mintUrl}`);
}
