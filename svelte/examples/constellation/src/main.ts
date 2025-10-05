import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";

let app: ReturnType<typeof mount> | undefined;

if (typeof document !== "undefined") {
    const target = document.getElementById("app");
    if (target) {
        app = mount(App, { target });
    }
}

export default app;
