export function extract_params(code: string) {
	let last_description;
	let results: Record<string, {default: any, type?: "bool"|"number", step:number, min?: number, max?:number, choices?: [any, string][], description?: string}> = {}
	for (const line of code.split("\n")) {
		let match;
		if (match = line.match(/^\/\/ ?(.+)/)) {
			last_description = match[1];
		}
		else if (match = line.match(/^(?<name>\w+) ?= ?(?<default>\w+|[\.0-9]+);?(?<i> ?\/\/ ?(?<i2>\[(?<range>.+?)\]|(?<step>[\.0-9]*)))? ?$/)) {
			console.log(match);
			let type: "number" | "bool" | undefined;
			let step, min, max, choices;
			if (match!.groups!.default.match(/^[0-9\.]+$/)) {
				type = 'number';
			}
			else if (match!.groups!.default.match(/(true|false)/)) {
				type = 'bool';
			}

			if (match!.groups!.range) {
				if (match!.groups!.range.includes(',')) {
					choices = []
					for (const choice of match!.groups!.range.split(',')) {
						let split = choice.split(':').map(elem => elem.trim()) as [string, string];
						choices.push(split);
					}
				}
				else {
					let split = match!.groups!.range.split(":").map(elem => Number.parseFloat(elem));
					if (split.length == 1) [max] = split;
					if (split.length == 2) [min, max] = split;
					if (split.length == 3) [min, step, max] = split;
					if (!step) step = 1;
				}
			}

			results[match!.groups!.name] = 
				{
					description: last_description, 
					default: match!.groups!.default,
					type,
					step: step ?? Number.parseFloat(match!.groups!.step),
					min,
					max,
					choices
				}
			;
		}
	}
	return results;
}
