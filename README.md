# OpenSCAD Web Customizer

Like the customizer in openscad (or on thingyverse), but in better and WASM based, so using it is as simple as possible

## How to use this
It should in most cases be as simple as replacing the demo `src/input.scad` with your own code and running `npm run dev` or `npm run build`.

### Preview
See [https://stuff.lelecode.dev/spikes](https://stuff.lelecode.dev/spikes)

### Limitations (i.e. TODOS):
- Currently, this projects only supports OpenSCAD files that are one file only and don't reference anything else. This is very limiting and is a future TODO.
- Text inputs are not supported as of now, but should be easy to add
- Multiple Tabs are not supported, all parameters are on a single page

### What is supported:
- Number inputs (should support the full `// [min,step,max]` syntax with all variations
- Choices (and not-to-spec: boolean choices `[true:yes, false:no]`
- Not-to-spec title comment: `/* [Title This will be the page title] */`
- `/* [Hidden] */`
- Not-to-spec Icons: add `icon:mdi-id` to the description comment above the parameter. For a list of valid ids see `src/lib/Icon.svelte` and extend if needed (the values are SVG Paths)

## Technical Details

This uses the [OpenSCAD WASM Port](https://github.com/openscad/openscad-wasm), [ViewSTL](https://github.com/omrips/viewstl), both slightly modified so Vite can load and bundle them
The Frontend is written with SvelteKit

## Developing

Once you've installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.
The static build files are written to `build/`

