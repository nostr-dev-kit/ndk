import { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { useEffect, useState } from "react";
import { UseSubscribeOptions } from ".";
import { useNDK } from "../../ndk/hooks";

/**
 * Fetches an event.
 *
 * @example
 * const event = useEvent<NDKArticle>("naddr1qvzqqqr4gupzqmjxss3dld622uu8q25gywum9qtg4w4cv4064jmg20xsac2aam5nqy88wumn8ghj7mn0wvhxcmmv9uq32amnwvaz7tmjv4kxz7fwv3sk6atn9e5k7tcqp5cnvwpsxccnywfjxc6njwg4ef260", { wrap: true });
 *
 * if (event === undefined) return <div>Loading...</div>;
 * if (event === null) return <div>Not found</div>;
 * if (event) return <div>{event.content}</div>;
 *
 * @param filters
 * @param opts
 * @param dependencies
 * @returns
 */
export function useEvent<T extends NDKEvent>(
    idOrFilter: string | NDKFilter | NDKFilter[] | false,
    opts: UseSubscribeOptions = {},
    dependencies: unknown[] = [],
): NDKEvent | null {
    const [event, setEvent] = useState();
    const { ndk } = useNDK();

    dependencies.push(!!idOrFilter);

    useEffect(() => {
        async function fetchEvent() {
            if (!ndk || !idOrFilter) return;

            const events = await ndk.fetchEvent(idOrFilter, opts);
            setEvent(events as T);
        }

        fetchEvent();
    }, dependencies);

    return event as T;
}
