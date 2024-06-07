import "websocket-polyfill"
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk"


type NostrServiceProps = {
    privateKey: string
    relayUrls: string[]
}

interface INostrService {
  writeNote(message: string): Promise<void>
  check(): Promise<boolean>
}

class NostrService implements INostrService {
    private ndk: NDK

  constructor(props: NostrServiceProps) {
    this.ndk = new NDK({
        explicitRelayUrls: props.relayUrls,
        signer: new NDKPrivateKeySigner(props.privateKey),
    })
  }

  async writeNote(message: string): Promise<void> {
    await this.ndk.connect(2000)

    const event = new NDKEvent(this.ndk)
    event.content = message
    event.kind = NDKKind.Text
    
    const relays = await event.publish()
  }

  check(): Promise<boolean> {
    // TODO ping any relay
    return Promise.resolve(true)
  }
}


export { NostrService, NostrServiceProps }
