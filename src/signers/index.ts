import User from '../user';
import type {NostrEvent} from '../events/';
import { Nip07Signer } from './nip07';
import PrivateKeySigner from './private-key';

export type SignerType = Nip07Signer | PrivateKeySigner;

export interface Signer {
    user: User | undefined;
    sign(event: NostrEvent): Promise<string>;
}
