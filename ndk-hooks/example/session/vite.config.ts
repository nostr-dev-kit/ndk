import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // This allows importing from the local ndk-hooks source
            "@nostr-dev-kit/ndk-hooks": resolve(__dirname, "../../src"),
        },
    },
    optimizeDeps: {
        include: ["react", "react-dom"],
    },
    // Explicitly set the base directory to ensure paths resolve correctly
    root: __dirname,
    // Configure the build output
    build: {
        outDir: "dist",
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
            },
        },
    },
    // Configure the dev server
    server: {
        port: 5173,
        open: true,
    },
});
