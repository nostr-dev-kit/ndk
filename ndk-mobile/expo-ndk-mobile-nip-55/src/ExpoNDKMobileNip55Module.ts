import { /* NativeModule, */ requireNativeModule } from "expo";

// import { ExpoNDKMobileNip55ModuleEvents } from './ExpoNDKMobileNip55.types';

// declare class ExpoNDKMobileNip55Module extends NativeModule<ExpoNDKMobileNip55ModuleEvents> {
//   PI: number;
//   hello(): string;
//   setValueAsync(value: string): Promise<void>;
// }

declare class ExpoNDKMobileNip55Module {
    getTheme(): string;
    getPublicKey(): string;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoNDKMobileNip55Module>("ExpoNDKMobileNip55");
