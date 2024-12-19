import '@bacons/text-decoder/install';
import 'react-native-get-random-values';

export * from './hooks';
export * from './context';
export * from './providers';
export * from './cache-adapter/sqlite';
export * from './components';

export * from '@nostr-dev-kit/ndk';
import NDK from '@nostr-dev-kit/ndk';

export default NDK;