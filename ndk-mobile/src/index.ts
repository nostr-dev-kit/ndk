import '@bacons/text-decoder/install';
import 'react-native-get-random-values';

export * from './hooks/index.js';
export * from './cache-adapter/sqlite.js';
export * from './components/index.js';
export * from './components/relays/index.js';
export * from './signers/index.js';
export * from './stores/session/index.js';
export * from '@nostr-dev-kit/ndk';
export * as DBCache from './db/index.js';
import NDK from '@nostr-dev-kit/ndk';

export default NDK;