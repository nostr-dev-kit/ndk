import "./app.css";
import { mount } from "svelte";
import App from "./App.svelte";

// Mount the app after cache is ready
mount(App, {
    target: document.getElementById("app")!,
});
