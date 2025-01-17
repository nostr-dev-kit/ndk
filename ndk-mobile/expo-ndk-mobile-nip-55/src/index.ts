// Reexport the native module. On web, it will be resolved to ExpoNDKMobileNip55Module.web.ts
// and on native platforms to ExpoNDKMobileNip55Module.ts
// export { default } from './ExpoNDKMobileNip55Module';
// export { default as ExpoNDKMobileNip55View } from './ExpoNDKMobileNip55View';
// export * from  './ExpoNDKMobileNip55.types';

import ExpoNDKMobileNip55Module from "./ExpoNDKMobileNip55Module";

export function getTheme(): string {
    return ExpoNDKMobileNip55Module.getTheme();
}

export function getPublicKey(): string {
    return ExpoNDKMobileNip55Module.getPublicKey();
}
