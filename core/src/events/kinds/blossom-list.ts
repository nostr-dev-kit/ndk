import type { NDK } from "../../ndk/index.js";
import type { NostrEvent } from "../index.js";
import { NDKEvent } from "../index.js";
import { NDKKind } from "./index.js";

/**
 * Represents a Blossom server list for a user, kind:10063
 * @group Kind Wrapper
 */
export class NDKBlossomList extends NDKEvent {
    static kind = NDKKind.BlossomList;
    static kinds = [NDKKind.BlossomList];

    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.BlossomList;
    }

    static from(ndkEvent: NDKEvent): NDKBlossomList {
        return new NDKBlossomList(ndkEvent.ndk, ndkEvent.rawEvent());
    }

    /**
     * Returns all Blossom servers in the list
     */
    get servers(): string[] {
        return this.tags.filter((tag) => tag[0] === "server").map((tag) => tag[1]);
    }

    /**
     * Sets the list of Blossom servers
     */
    set servers(servers: string[]) {
        // Remove all existing server tags
        this.tags = this.tags.filter((tag) => tag[0] !== "server");

        // Add the new server tags
        for (const server of servers) {
            this.tags.push(["server", server]);
        }
    }

    /**
     * Returns the default Blossom server (first in the list)
     */
    get default(): string | undefined {
        const servers = this.servers;
        return servers.length > 0 ? servers[0] : undefined;
    }

    /**
     * Sets the default Blossom server by moving it to the beginning of the list
     */
    set default(server: string) {
        if (!server) return;

        const currentServers = this.servers;

        // Remove the server if it already exists in the list
        const filteredServers = currentServers.filter((s) => s !== server);

        // Add the server to the beginning of the list
        this.servers = [server, ...filteredServers];
    }

    /**
     * Adds a server to the list if it doesn't already exist
     */
    addServer(server: string): void {
        if (!server) return;

        const currentServers = this.servers;

        // Check if the server already exists
        if (!currentServers.includes(server)) {
            this.servers = [...currentServers, server];
        }
    }

    /**
     * Removes a server from the list
     */
    removeServer(server: string): void {
        if (!server) return;

        const currentServers = this.servers;

        // Filter out the server to remove
        this.servers = currentServers.filter((s) => s !== server);
    }
}
