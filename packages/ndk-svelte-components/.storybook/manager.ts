import { addons } from "@storybook/manager-api";
import ndkTheme from "./ndk-theme";

addons.setConfig({
    theme: ndkTheme,
});
