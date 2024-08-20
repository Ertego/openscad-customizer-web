let browser = true;
import openscad from "$lib/openscad/openscad.js";

let instance: any;

async function render(scad_file: string, params: [string, string][], preview: boolean) {
	console.log(scad_file, params);

	if (browser) {

			const mod = openscad;
			instance = instance ?? await mod({ noInitialRun: true });

			const outFileName = `/out.stl`;
			instance.FS.writeFile("/input.scad", scad_file); 

			let params_ = params.map(param => ['-D', param.join('=')]).flat(1);

			if (preview) {
				instance.callMain(["/input.scad", "-o", outFileName, "--export-format=png", "--preview=throwntogether", ...params_]);
			}
			else {
				instance.callMain(["/input.scad", "-o", outFileName, "--export-format=stl", ...params_]);
			}

			const output = instance.FS.readFile(outFileName);
			let dl_url = URL.createObjectURL(new Blob([output], { type: "application/octet-stream" }), null);
			return dl_url;
}}

onmessage = async function(event) {
	this.postMessage({url: await render(event.data.file, event.data.params, event.data.preview), preview: event.data.preview});
}
