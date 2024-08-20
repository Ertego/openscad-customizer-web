export function extract_params(code: string) {
	let last_description;
	let title;
	let hide_next = false;
	let results: Record<string, {default: any, type?: "bool"|"number", step:number, min?: number, max?:number, choices?: [any, string][], description?: string, icon?: string}> = {}
	for (const line of code.split("\n")) {
		let match;
		if (line.match(/^\/\* *\[[Hh]idden\] *\*\/ *$/)) hide_next = true;
		else if (match = line.match(/^\/\* ?\[[tT]itle (.*) ?\] *\*\/ *$/)) {
			title = match[1];
		}
		else if (match = line.match(/^\/\/ ?(.+)/)) {
			last_description = match[1];
		}
		else if (match = line.match(/^(?<name>\w+) ?= ?(?<default>\w+|[\.0-9]+);?(?<i> ?\/\/ ?(?<i2>\[(?<range>.+?)\]|(?<step>[\.0-9]*)))? ?$/)) {
			if (hide_next) {
				hide_next = false;
				continue;
			}
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

			let icon;
			let icon_match = last_description?.match(/.*icon:([\w-_]+)/);
			if (icon_match) icon = icon_match[1];

			results[match!.groups!.name] = 
				{
					description: last_description?.replace(/icon:[\w-_]+/, ""), 
					icon,
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
	console.log(results);
	return {params: results, title};
}
