/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable no-empty */

export function tryNormalizeRelayUrl(url: string): string | undefined {
    try {
        return normalizeRelayUrl(url);
    } catch {
        return undefined;
    }
}

/**
 * Normalizes a relay URL by removing authentication, www, and hash,
 * and ensures that it ends with a slash.
 *
 * @param url - The URL to be normalized.
 * @returns The normalized URL.
 */
export function normalizeRelayUrl(url: string): string {
    let r = normalizeUrl(url.toLowerCase(), {
        stripAuthentication: false,
        stripWWW: false,
        stripHash: true,
    });

    // if it doesn't end with a slash, add it
    if (!r.endsWith("/")) {
        r += "/";
    }

    return r;
}

/**
 * Normalizes an array of URLs by removing duplicates and applying a normalization function to each URL.
 * Any URLs that fail to normalize will be ignored.
 *
 * @param urls - An array of URLs to be normalized.
 * @returns An array of normalized URLs without duplicates.
 */
export function normalize(urls: string[]): string[] {
    const normalized = new Set<string>();

    for (const url of urls) {
        try {
            normalized.add(normalizeRelayUrl(url));
        } catch {
            /**/
        }
    }

    return Array.from(normalized);
}

/**
 * The below is from the normalize-url package, with some modifications.
 * The package itself is ESM only now and doesn't allow our test suite to work.
 * We should try and add that package back in the future and remove the code below.
 */
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
const DATA_URL_DEFAULT_MIME_TYPE = "text/plain";
const DATA_URL_DEFAULT_CHARSET = "us-ascii";

const testParameter = (name: any, filters: any) =>
    filters.some((filter: any) => (filter instanceof RegExp ? filter.test(name) : filter === name));

const supportedProtocols = new Set(["https:", "http:", "file:"]);

const hasCustomProtocol = (urlString: string) => {
    try {
        const { protocol } = new URL(urlString);

        return (
            protocol.endsWith(":") && !protocol.includes(".") && !supportedProtocols.has(protocol)
        );
    } catch {
        return false;
    }
};

const normalizeDataURL = (urlString: string, { stripHash }: { stripHash: boolean }) => {
    const match = /^data:(?<type>[^,]*?),(?<data>[^#]*?)(?:#(?<hash>.*))?$/.exec(urlString);

    if (!match) {
        throw new Error(`Invalid URL: ${urlString}`);
    }

    let type: string = match.groups?.type ?? "";
    let data: string = match.groups?.data ?? "";
    let hash = match.groups?.hash ?? "";

    const mediaType = type.split(";");
    hash = stripHash ? "" : hash;

    let isBase64 = false;
    if (mediaType[mediaType.length - 1] === "base64") {
        mediaType.pop();
        isBase64 = true;
    }

    // Lowercase MIME type
    const mimeType = mediaType.shift()?.toLowerCase() ?? "";
    const attributes = mediaType
        .map((attribute: any) => {
            let [key, value = ""] = attribute.split("=").map((string: string) => string.trim());

            // Lowercase `charset`
            if (key === "charset") {
                value = value.toLowerCase();

                if (value === DATA_URL_DEFAULT_CHARSET) {
                    return "";
                }
            }

            return `${key}${value ? `=${value}` : ""}`;
        })
        .filter(Boolean);

    const normalizedMediaType = [...attributes];

    if (isBase64) {
        normalizedMediaType.push("base64");
    }

    if (normalizedMediaType.length > 0 || (mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE)) {
        normalizedMediaType.unshift(mimeType);
    }

    return `data:${normalizedMediaType.join(";")},${isBase64 ? data.trim() : data}${
        hash ? `#${hash}` : ""
    }`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function normalizeUrl(urlString: string, options: any) {
    options = {
        defaultProtocol: "http",
        normalizeProtocol: true,
        forceHttp: false,
        forceHttps: false,
        stripAuthentication: true,
        stripHash: false,
        stripTextFragment: true,
        stripWWW: true,
        removeQueryParameters: [/^utm_\w+/i],
        removeTrailingSlash: true,
        removeSingleSlash: true,
        removeDirectoryIndex: false,
        removeExplicitPort: false,
        sortQueryParameters: true,
        ...options,
    };

    // Legacy: Append `:` to the protocol if missing.
    if (typeof options.defaultProtocol === "string" && !options.defaultProtocol.endsWith(":")) {
        options.defaultProtocol = `${options.defaultProtocol}:`;
    }

    urlString = urlString.trim();

    // Data URL
    if (/^data:/i.test(urlString)) {
        return normalizeDataURL(urlString, options);
    }

    if (hasCustomProtocol(urlString)) {
        return urlString;
    }

    const hasRelativeProtocol = urlString.startsWith("//");
    const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);

    // Prepend protocol
    if (!isRelativeUrl) {
        urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
    }

    const urlObject = new URL(urlString);

    if (options.forceHttp && options.forceHttps) {
        throw new Error("The `forceHttp` and `forceHttps` options cannot be used together");
    }

    if (options.forceHttp && urlObject.protocol === "https:") {
        urlObject.protocol = "http:";
    }

    if (options.forceHttps && urlObject.protocol === "http:") {
        urlObject.protocol = "https:";
    }

    // Remove auth
    if (options.stripAuthentication) {
        urlObject.username = "";
        urlObject.password = "";
    }

    // Remove hash
    if (options.stripHash) {
        urlObject.hash = "";
    } else if (options.stripTextFragment) {
        urlObject.hash = urlObject.hash.replace(/#?:~:text.*?$/i, "");
    }

    // Remove duplicate slashes if not preceded by a protocol
    // NOTE: This could be implemented using a single negative lookbehind
    // regex, but we avoid that to maintain compatibility with older js engines
    // which do not have support for that feature.
    if (urlObject.pathname) {
        // TODO: Replace everything below with `urlObject.pathname = urlObject.pathname.replace(/(?<!\b[a-z][a-z\d+\-.]{1,50}:)\/{2,}/g, '/');` when Safari supports negative lookbehind.

        // Split the string by occurrences of this protocol regex, and perform
        // duplicate-slash replacement on the strings between those occurrences
        // (if any).
        const protocolRegex = /\b[a-z][a-z\d+\-.]{1,50}:\/\//g;

        let lastIndex = 0;
        let result = "";
        for (;;) {
            const match = protocolRegex.exec(urlObject.pathname);
            if (!match) {
                break;
            }

            const protocol = match[0];
            const protocolAtIndex = match.index;
            const intermediate = urlObject.pathname.slice(lastIndex, protocolAtIndex);

            result += intermediate.replace(/\/{2,}/g, "/");
            result += protocol;
            lastIndex = protocolAtIndex + protocol.length;
        }

        const remnant = urlObject.pathname.slice(lastIndex, urlObject.pathname.length);
        result += remnant.replace(/\/{2,}/g, "/");

        urlObject.pathname = result;
    }

    // Decode URI octets
    if (urlObject.pathname) {
        try {
            urlObject.pathname = decodeURI(urlObject.pathname);
        } catch {}
    }

    // Remove directory index
    if (options.removeDirectoryIndex === true) {
        options.removeDirectoryIndex = [/^index\.[a-z]+$/];
    }

    if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
        let pathComponents = urlObject.pathname.split("/");
        const lastComponent = pathComponents[pathComponents.length - 1];

        if (testParameter(lastComponent, options.removeDirectoryIndex)) {
            pathComponents = pathComponents.slice(0, -1);
            urlObject.pathname = pathComponents.slice(1).join("/") + "/";
        }
    }

    if (urlObject.hostname) {
        // Remove trailing dot
        urlObject.hostname = urlObject.hostname.replace(/\.$/, "");

        // Remove `www.`
        if (
            options.stripWWW &&
            /^www\.(?!www\.)[a-z\-\d]{1,63}\.[a-z.\-\d]{2,63}$/.test(urlObject.hostname)
        ) {
            // Each label should be max 63 at length (min: 1).
            // Source: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
            // Each TLD should be up to 63 characters long (min: 2).
            // It is technically possible to have a single character TLD, but none currently exist.
            urlObject.hostname = urlObject.hostname.replace(/^www\./, "");
        }
    }

    // Remove query unwanted parameters
    if (Array.isArray(options.removeQueryParameters)) {
        for (const key of [...urlObject.searchParams.keys()]) {
            if (testParameter(key, options.removeQueryParameters)) {
                urlObject.searchParams.delete(key);
            }
        }
    }

    if (!Array.isArray(options.keepQueryParameters) && options.removeQueryParameters === true) {
        urlObject.search = "";
    }

    // Keep wanted query parameters
    if (Array.isArray(options.keepQueryParameters) && options.keepQueryParameters.length > 0) {
        for (const key of [...urlObject.searchParams.keys()]) {
            if (!testParameter(key, options.keepQueryParameters)) {
                urlObject.searchParams.delete(key);
            }
        }
    }

    // Sort query parameters
    if (options.sortQueryParameters) {
        urlObject.searchParams.sort();

        // Calling `.sort()` encodes the search parameters, so we need to decode them again.
        try {
            urlObject.search = decodeURIComponent(urlObject.search);
        } catch {}
    }

    if (options.removeTrailingSlash) {
        urlObject.pathname = urlObject.pathname.replace(/\/$/, "");
    }

    // Remove an explicit port number, excluding a default port number, if applicable
    if (options.removeExplicitPort && urlObject.port) {
        urlObject.port = "";
    }

    const oldUrlString = urlString;

    // Take advantage of many of the Node `url` normalizations
    urlString = urlObject.toString();

    if (
        !options.removeSingleSlash &&
        urlObject.pathname === "/" &&
        !oldUrlString.endsWith("/") &&
        urlObject.hash === ""
    ) {
        urlString = urlString.replace(/\/$/, "");
    }

    // Remove ending `/` unless removeSingleSlash is false
    if (
        (options.removeTrailingSlash || urlObject.pathname === "/") &&
        urlObject.hash === "" &&
        options.removeSingleSlash
    ) {
        urlString = urlString.replace(/\/$/, "");
    }

    // Restore relative protocol, if applicable
    if (hasRelativeProtocol && !options.normalizeProtocol) {
        urlString = urlString.replace(/^http:\/\//, "//");
    }

    // Remove http/https
    if (options.stripProtocol) {
        urlString = urlString.replace(/^(?:https?:)?\/\//, "");
    }

    return urlString;
}
