/* [Title Spike STL Creator] */
// size in the x direction in mm icon:arrow-left-right
size_x = 35; // .1
// size in the y direction in mm icon:arrow-up-down
size_y = 35; // .1
// Space between the spikes, lower = less space between spikes icon:dots-grid
density = 7.001; // [0:0.001:30] 
// factor, just try until it fits icon:triangle
pointyness = 6; // [30]
// use a high value for cones
spike_sides = 3; // [50]
// baseplate height in mm
baseplate_height = 1.6; // .1
// base of the spikes in mm
spike_base_xy = 4; // .1

// enable random sized spikes
random = false;
// radius around 1, result is factor
random_factor_r = .3; // .01
/* [Hidden] */
// makes halfed spikes start at the edges, best explained by trying
weird_edges = true; 

// true = square, false = circle, circles assume size_y = size_x, because who need ellipses?
shape = false; // [true:square, false:circle]


// seed for the random setting
seed = 42;
prng = rands(1 - random_factor_r,1 + random_factor_r,((size_x + 1) * (size_y + 1)) / density,seed);

module spike(i) {
	rand = random ? prng[i] : 1;
	scale([1 * rand, 1 * rand, 1 * rand])
	cylinder(1,spike_base_xy,00,$fn=spike_sides);
}

intersection () {
	total_max_height = (pointyness + baseplate_height) * (1+(random?random_factor_r:0));
	if (shape) {
		cube([size_x, size_y, total_max_height]);
	} else {
		translate([size_x/2, size_x/2,0])
			linear_extrude(total_max_height)
			circle(d=size_x);
	}
	union () {
		offset = weird_edges? 1 : 0;
		xmax = size_x + (weird_edges?density:0);
		ymax = size_y + (weird_edges?density:0);
		cube([size_x,size_y, baseplate_height]);

		for (x = [1:density:xmax])
			for (y = [1:density:ymax]) {
				translate([x - offset, y - offset, baseplate_height - 0.0001])
					scale([1, 1, pointyness])
					spike(floor(x / density) * floor(xmax / density) + floor(y / density));
			}
	}
}
