<script lang="ts">
	export const prerender = true;
	import { browser } from '$app/environment';
	import LoadButton from "$lib/LoadButton.svelte";
	import {extract_params} from "$lib/extract_params";
	import {slide} from "svelte/transition";
	import {tick} from "svelte";
	import Worker from "$lib/render_worker?worker";
	import Loader from "$lib/Loader.svelte"
	import Button from "$lib/Button.svelte"
	import Select from "$lib/Select.svelte"
	import Icon from "$lib/Icon.svelte"
	import Input from "$lib/Input.svelte"
	const scad_file = import("../input.scad?raw");

	let params;
	let title;
	let values = {};

	scad_file.then(mod => {
		console.log(mod.default);
		({params, title} = extract_params(mod.default));
		if (browser && location.search) {
				values = JSON.parse(decodeURIComponent(location.search.substring(1)));
				console.log(values)
		}
		for (const [name, param] of Object.entries(params)) {
			if (values[name]) continue;
			if (param.type === 'bool' && !param.choices) values[name] = param.default === 'true';
			else values[name] = param.default;
		}
	});

	let dl_url;
	let rendering = false;
	let stlcont;

	const StlViewer = (async () => {
		if (!browser) return;
		return (await import("$lib/stlview/stl_viewer.min.js")).StlViewer;
	})();

const openscad = browser?import("$lib/openscad/openscad.js"):null;
let current = null;
let preview_url;
let instance;
let errors = {};

$: {
		if (browser && Object.entries(values).length) {
		let url = new URL(location.href);
		url.search = encodeURIComponent(JSON.stringify(values));
		history.replaceState(null, {}, url.href);
		}
		if (params) {
	
		for (const [name, param] of Object.entries(params)) {
			if (!values[name] && params[name].type !== "bool") {
				errors[name] = "Can't be empty";
			}
			else {
				errors[name] = null;
			}
		}
		}
}

async function render(preview=false) {

	if (browser) {
			rendering = preview? "preview": "stl";
			let resolve = () => {};

			const worker = new Worker;
			worker.onmessage = async (event) => {
				if (event.data.preview) {
					current = "png";
					preview_url = event.data.url;
				}
				else {

					if (stlcont.lastChild) stlcont.removeChild(stlcont.lastChild);
					let stl_viewer=new (await StlViewer)(document.getElementById("stl_cont"), { models: [ {id:0, filename: event.data.url} ] });
					dl_url = event.data.url;
					current = "stl";
					await tick();
					scrollTo(0, document.body.scrollHeight);
				}
				rendering = false;
				resolve()
			}
			worker.postMessage({file: (await scad_file).default, params: Object.entries(values), preview});
			await new Promise(r => {resolve = r});
}}

globalThis.render =render;

let dl;



</script>


<div style="max-width: 900px; margin: 0 auto; background: #f3c89c; border-radius: 3px; padding: 5px">
	<h1 style="text-align: center;">{title}</h1>
	<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 5px;">
	{#if params}
	{#each Object.entries(params ?? {}) as [name, param] (name)}
		<div style="width: 400px; max-width: 90vw; display: flex; flex-direction: column; justify-content: space-between; border-bottom: 1px solid black; padding: 5px">
		<h4 style="text-transform: capitalize;">{name.replace("_", " ")}</h4>
		<p>{param.description}</p>
		{#if param.type == 'number' && param.max && param.min !== undefined}
			<input type="range" min={param.min} max={param.max} step={param.step} bind:value={values[name]}/>
			<span>{values[name]}</span>
		{/if}
		{#if param.choices}
			<Select bind:value={values[name]}>
				{#each param.choices as [value, name] (name)}
					<option {value}>{name}</option>
				{/each}
			</Select>
		{:else if param.type == 'number'}
			<Input icon={param.icon} spinner='true' error={errors[name]} bind:value={values[name]} placeholder={name} min={param.min} max={param.max} step={param.step}/>
		{:else if param.type == 'bool'}
			<input type="checkbox" bind:checked={values[name]}/>
		{/if}
	</div>
	{:else}
		<p>No params</p>
	{/each}
{:else}
	<Loader/>
{/if}

	</div>
	<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin: 10px">

		{#if rendering != "preview"}
			<div style="width: 400px; max-width: 100vw;" transition:slide>
				<LoadButton icon="cog-play" disabled={Object.values(errors).some(e => e !== null)} on:clicked={event => event.detail.waitUntil(render())}>{#if rendering}Rendering...{:else}Render{/if}</LoadButton>
			</div>
		{/if}
		{#if rendering != "stl" && false}
			<div style="width: 400px; max-width: 100vw;">
				<LoadButton on:clicked={event => event.detail.waitUntil(render(true))}>{#if rendering}Rendering...{:else}Render Preview{/if}</LoadButton>
			</div>
		{/if}
	</div>
	{#if Object.values(errors).some(e => e !== null)}
		<div style="display: flex; align-items: center; gap:5px; justify-content: center;" transition:slide>
			<Icon icon="alert" color="red"/>
			<span style="color: red">There are errors with {Object.entries(errors).filter(e => e[1] !== null).map(e =>e[0]).join(",")}</span>
		</div>
	{/if}
	{#if current === "png"}
		<img src={preview_url}/>
	{/if}
	<div bind:this={stlcont} id="stl_cont" style="height: 400px"></div>

	<div style="display: flex; flex-direction: column; gap:5px">
	{#if dl_url}
		<div transition:slide>
		<Button icon="download" on:click={() => dl.click()}>Download STL</Button>
		</div>
			<a bind:this={dl} style="display:none" href={dl_url} download="spike.stl">Download file</a>
	{/if}
		<Button icon="share" on:click={() => navigator.share({url: location.href})}>Share</Button>

		<Button icon="reload-alert" on:click={() => location.search=''}>Reset to defaults</Button>
			</div>
			
	<p>Generated using <a href="https://github.com/Ertego/openscad-customizer-web" target="_blank">OpenSCAD Web Customizer</a></p>

</div>
