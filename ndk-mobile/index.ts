import '@bacons/text-decoder/install';
import 'react-native-get-random-values';

export * from './src/hooks';
export * from './src/cache-adapter/sqlite';
export * from './src/components';
export * from './src/components/relays';
export * from '@nostr-dev-kit/ndk';

import NDK from '@nostr-dev-kit/ndk';

export default NDK;