import "websocket-polyfill";
import NDK, { type NDKRelay } from "@nostr-dev-kit/ndk";
import { relaysFromArgs } from "./utils/relays-from-args";

import chalk from "chalk";
const log = console.log;
const time = console.time;
const timeEnd = console.timeEnd;
const info = chalk.bold.white;
const error = chalk.bold.red;
const infoLog = (...args: string[]) => log(info(...args));

log("");
log("");
infoLog(`Starting perftest`);

const relays = relaysFromArgs();

const ndk = new NDK();
ndk.pool.on("relay:connect", (r: NDKRelay) => {
    infoLog(`Connected to relay ${r.url}`);
});
for (const relay of relays) {
    ndk.addExplicitRelay(relay, undefined, false);
    log(relay.url);
}
await ndk.connect(2000);

await fetchAndVerifyEvents("With verification", false);
await fetchAndVerifyEvents("With no verification", true);

async function fetchAndVerifyEvents(label: string, skipVerification: boolean) {
    infoLog(label);
    time(info("fetchEvents"));
    const events = await ndk.fetchEvents({ limit: 2000 }, { groupable: false, skipVerification });
    timeEnd(info("fetchEvents"));
    infoLog(`Fetched ${events.size} events`);

    time(info("verifySignature"));
    for (const event of events) {
        event.verifySignature(false);
    }
    timeEnd(info("verifySignature"));
}
