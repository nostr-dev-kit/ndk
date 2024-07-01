import { NostrService, NostrServiceProps } from "./nostr";

const relayUrls = [
    "wss://nostr.bitcoiner.social",
    "wss://nostr-pub.wellorder.net",
    "wss://nostr.mom",
    "wss://nos.lol",
    "wss://relay.mostr.pub",
    "wss://relay.damus.io"
]

const config = {
    sk: "8711b61bac3a7e830e1c2dbcf7f8fe3fca1f71c46af939fb791336117d6f9b72",
    pk: "a7bfa289dd6d6edbf732e7c97ee3524d811c850fe90880a5e5bd741c1e0b6010",
    nsec: "nsec1sugmvxav8flgxrsu9k7007878l9p7uwydtunn7mezvmpzlt0ndeqrd840c",
    npub: "npub157l69zwad4hdhaejulyhac6jfkq3epg0ayygpf09h46pc8stvqgqw78e55",
    homepage: "https://snort.social/npub157l69zwad4hdhaejulyhac6jfkq3epg0ayygpf09h46pc8stvqgqw78e55",
}

const props = {
    privateKey: config.sk,
    relayUrls,
} as NostrServiceProps

const service = new NostrService(props)

service.writeNote("Hello, World! ~ from Nostr Service example")
    .then(() => {
        console.log("Note sent!")
    })
    .catch((err) => {
        console.error("Error sending note:", err)
    })
