import type { Database } from "sql.js";
import type { CashuMintInfo } from "@nostr-dev-kit/ndk";

export function saveCashuMintInfo(
    db: Database,
    mintUrl: string,
    info: CashuMintInfo,
): void {
    const now = Math.floor(Date.now() / 1000);
    const infoJson = JSON.stringify(info);

    db.run(
        "INSERT OR REPLACE INTO cashu_mint_info (mint_url, info, cached_at) VALUES (?, ?, ?)",
        [mintUrl, infoJson, now],
    );

    console.debug(`💾 [Cache] Saved mint info for ${mintUrl} (name: ${info.name || 'unknown'})`);
}
