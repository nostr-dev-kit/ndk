import "websocket-polyfill";
import { NDK } from "../ndk";
import { NDKNwc } from ".";

const ndk = new NDK();
const nwcString = "<put a real nwc string here to test and replace xit() with it()>";
const bolt11 =
    "lnbc110n1pjueasgpp50w3ewf5c2r6x8hr4uduw7fdv3y5kx3hglqqt9fjm6f24ex6djecsdp0wdshgueqvehhygrsv93xcmmxxaayqurjd9kkzmpwdejhgwscqzzsxqrrs0sp5ga6z4tvvlhg0aq74nq7q88cnufjd5mktxyt24g8uln95g5gwp5js9qyyssq82fy9jtajlhpfdrj7ycmamc5aj33jn4xhxg0wfyktteuf69z9rkznej7c3aw8tjmzttngdadqkwejmnmqdv7unggqrymkevqz2a3uqgpsek6xx";

describe("NDKNwc", () => {
    it.skip("connects", async () => {
        const nwc = await NDKNwc.fromURI(ndk, nwcString);
        await nwc.blockUntilReady();

        expect(nwc.active).toBe(true);
    });

    it.skip("sends a request", async () => {
        const nwc = await NDKNwc.fromURI(ndk, nwcString);
        await nwc.blockUntilReady();

        const res = await nwc.sendReq("get_info", {});
        expect(res).toBeDefined();
    });

    it.skip("it pays an invoice", async () => {
        const nwc = await NDKNwc.fromURI(ndk, nwcString);
        await nwc.blockUntilReady();

        const res = await nwc.payInvoice(bolt11);
        console.log(res);
        expect(res).toBeDefined();
    });
});
