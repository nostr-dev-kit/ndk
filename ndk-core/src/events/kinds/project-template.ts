import type { NostrEvent } from "../../index.js";
import type { NDK } from "../../ndk/index.js";
import { NDKEvent } from "../index.js";
import { NDKKind } from "./index.js";

/**
 * Represents a project template event in Nostr (kind 30717).
 * Templates are parameterized replaceable events used to define reusable project structures.
 */
export class NDKProjectTemplate extends NDKEvent {
    static kind = NDKKind.ProjectTemplate;
    static kinds = [NDKKind.ProjectTemplate];

    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind = NDKKind.ProjectTemplate;
    }

    static from(event: NDKEvent): NDKProjectTemplate {
        return new NDKProjectTemplate(event.ndk, event.rawEvent());
    }

    /**
     * Template identifier from 'd' tag
     */
    get templateId(): string {
        return this.dTag ?? "";
    }

    set templateId(value: string) {
        this.dTag = value;
    }

    /**
     * Template name from 'title' tag
     */
    get name(): string {
        return this.tagValue("title") ?? "";
    }

    set name(value: string) {
        this.removeTag("title");
        if (value) this.tags.push(["title", value]);
    }

    /**
     * Template description from 'description' tag
     */
    get description(): string {
        return this.tagValue("description") ?? "";
    }

    set description(value: string) {
        this.removeTag("description");
        if (value) this.tags.push(["description", value]);
    }

    /**
     * Git repository URL from 'uri' tag
     */
    get repoUrl(): string {
        return this.tagValue("uri") ?? "";
    }

    set repoUrl(value: string) {
        this.removeTag("uri");
        if (value) this.tags.push(["uri", value]);
    }

    /**
     * Template preview image URL from 'image' tag
     */
    get image(): string | undefined {
        return this.tagValue("image");
    }

    set image(value: string | undefined) {
        this.removeTag("image");
        if (value) this.tags.push(["image", value]);
    }

    /**
     * Command to run from 'command' tag
     */
    get command(): string | undefined {
        return this.tagValue("command");
    }

    set command(value: string | undefined) {
        this.removeTag("command");
        if (value) this.tags.push(["command", value]);
    }

    /**
     * Agent configuration from 'agent' tag
     */
    get agentConfig(): object | undefined {
        const agentTag = this.tagValue("agent");
        if (!agentTag) return undefined;

        try {
            return JSON.parse(agentTag);
        } catch {
            return undefined;
        }
    }

    set agentConfig(value: object | undefined) {
        this.removeTag("agent");
        if (value) {
            this.tags.push(["agent", JSON.stringify(value)]);
        }
    }

    /**
     * Template tags from 't' tags
     */
    get templateTags(): string[] {
        return this.getMatchingTags("t")
            .map((tag) => tag[1])
            .filter(Boolean);
    }

    set templateTags(values: string[]) {
        // Remove all existing 't' tags
        this.tags = this.tags.filter((tag) => tag[0] !== "t");
        // Add new 't' tags
        values.forEach((value) => {
            if (value) this.tags.push(["t", value]);
        });
    }
}
