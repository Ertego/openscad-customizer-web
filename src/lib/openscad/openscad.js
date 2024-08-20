/// <reference types="./openscad.d.ts" />
import wasmJsUrl from "$lib/openscad/openscad.wasm.js?url";
let wasmModule;
async function OpenSCAD(options) {
    if (!wasmModule) {
        const request = await fetch(wasmJsUrl);
        wasmModule = "data:text/javascript;base64," + btoa(await request.text());
    }
    const module = {
        noInitialRun: true,
        locateFile: (path) => new URL(`./${path}`, import.meta.url).href,
        ...options,
    };
    globalThis.OpenSCAD = module;
    await import("$lib/openscad/openscad.wasm.js");
    delete globalThis.OpenSCAD;
    await new Promise((resolve) => {
        module.onRuntimeInitialized = () => resolve(null);
    });
    return module;
}

export { OpenSCAD as default };
