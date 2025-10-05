import "./app.css";
import { mount } from "svelte";
import App from "./App.svelte";
import { ndkReady } from "./lib/ndk";

// Wait for NDK cache to initialize before mounting the app
await ndkReady;

mount(App, {
    target: document.getElementById("app")!,
});
