import "./app.css";
import { mount } from "svelte";
import App from "./App.svelte";
import { ndkReady } from "./lib/ndk";
import { initPWA } from "./lib/pwa";

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}

// Initialize PWA install prompt
initPWA();

// Wait for NDK cache to initialize before mounting the app
await ndkReady;

mount(App, {
    target: document.getElementById("app")!,
});
