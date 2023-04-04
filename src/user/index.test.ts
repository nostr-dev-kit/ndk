import {nip05, nip19} from 'nostr-tools';
import NDKUser, {NDKUserParams} from './index.js';

jest.mock('nostr-tools', () => ({
    nip05: {
        queryProfile: jest.fn(),
    },
    nip19: {
        npubEncode: jest.fn(),
        decode: jest.fn(),
    },
}));

jest.mock('../index.js', () => ({
    fetchEvents: jest.fn(),
}));

describe('NDKUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('sets npub from provided npub', () => {
            const opts: NDKUserParams = {
                npub: 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft',
            };

            const user = new NDKUser(opts);

            expect(user.npub).toEqual('npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft');
        });

        it('sets npub from provided hexpubkey', () => {
            const opts: NDKUserParams = {
                hexpubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
            };

            (nip19.npubEncode as jest.Mock).mockReturnValue('encoded_npub');

            const user = new NDKUser(opts);

            expect(nip19.npubEncode).toHaveBeenCalledWith('fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');
            expect(user.npub).toEqual('encoded_npub');
        });

        it('sets relayUrls from provided relayUrls', () => {
            const opts: NDKUserParams = {
                relayUrls: ['url1', 'url2'],
            };

            const user = new NDKUser(opts);

            expect(user.relayUrls).toEqual(['url1', 'url2']);
        });
    });

    describe('hexpubkey', () => {
        it('returns the decoded hexpubkey', () => {
            const user = new NDKUser({npub: 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft'});

            (nip19.decode as jest.Mock).mockReturnValue({data: 'decoded_hexpubkey'});

            const hexpubkey = user.hexpubkey();

            expect(nip19.decode).toHaveBeenCalledWith('npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft');
            expect(hexpubkey).toEqual('decoded_hexpubkey');
        });
    });
});