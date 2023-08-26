import type { Preview } from "@storybook/svelte";
import "../src/styles/global.css";
import ndkTheme from "./ndk-theme";

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: "^on[A-Z].*" },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        docs: {
            theme: ndkTheme,
        },
    },
};

export default preview;
