var width = 400; // The width of the svg is a global variable
var height = 400; // The height of the svg is a global variable
var padding = 20; // padding for ticks, as well as data points
var fdata; // The formatted data is a global variable
var filtered_fdata; // filtered data based on the continent filter
var rendered_year = 0;
var playing = false;
var data_location = "data.json"; //change this if you have a different location


// Setting the Y axis
var yAxis = d3.scaleLinear()
	.domain([0, 90])
	.range([height, 0])

// Setting the X axis
var xAxis = d3.scaleLog()
	.base(10)
	.range([0, width])
	.domain([142, 150000])

var area = d3.scaleLinear()
	.range([25 * Math.PI, 1500 * Math.PI])
	.domain([2000, 1400000000]);

// TODO Ordinal scale for colors for example: d3.scaleOrdinal(d3.schemePastel1)
var continentColor = d3.scaleOrdinal(d3.schemePastel1);


var svg = d3.select("#svg_chart").append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("stroke", "black");

// Reading the input data
d3.json(data_location).then(function (data) {

	// Console log the original data
	// console.log(data);

	// Cleanup data
	fdata = data.map(function (year_data) {
		// retain the countries for which both the income and life_exp is specified
		return year_data["countries"].filter(function (country) {
			var existing_data = (country.income && country.life_exp);
			return existing_data
		}).map(function (country) {
			// convert income and life_exp into integers (everything read from a file defaults to an string)
			country.income = +country.income;
			country.life_exp = +country.life_exp;
			return country;
		})
	});

	// Console log the formatted data
	console.log(fdata);

	// initialize the filtered data
	filtered_fdata = fdata;

	// draw legend and ticks
	draw_legend();
	draw_ticks();


	// invoke the circle that draws the scatterplot
	// the argument corresponds to the year
	draw_circles(0);
})




// setting callback function for continent selector
d3.select("#continentselector").on("change", function(){
	var selectedContinent = d3.select(this).property('value');
	if(selectedContinent=="all") filtered_fdata = fdata; // showing every continent
	else filtered_fdata = fdata.map(function(continent){
		return continent.filter(function(cont){
			var continent_data = (cont.continent == selectedContinent);
			return continent_data
		})
	}) // showing only selected continent
	draw_circles(rendered_year);
})

// setting the callback function when the slider changes
d3.select("#slider").on("input", render);

// callback function to render the scene when the slider changes
function render() {

	// extracting the value of slider
	var slider_val = d3.select("#slider").property("value");

	// rendered_year is the global variable that stores the current year
	// get the rendered_year from the slider (+ converts into integer type)
	rendered_year = +slider_val

	// Call rendering function
	draw_circles(rendered_year)
}

const continents = ["asia", "europe", "africa", "americas"];
const legend_padding = 5;
const legend_width = 100;
const color_block_size = 20;

function draw_legend() {
	var legend_height = continents.length*(color_block_size + 2*legend_padding)

	var legend = svg.append("g")
		.attr("transform", `translate(${width-legend_width-legend_padding}, ${height-legend_height-padding-legend_padding})`)

	legend.append("rect")
		.attr("width", legend_width)
		.attr("height", legend_height)
		.attr("fill", "none")
		.attr("stroke", "black");

	var legend_item = legend.selectAll("g").data(continents);


	legend_item = legend_item.enter().append("g").merge(legend_item) // legend items
		.attr("transform", (d, i) => `translate(0,${i*(legend_height/continents.length)})`);

	legend_item.append("rect") // color blocks
		.attr("x", legend_padding)
		.attr("y", legend_padding)
		.attr("width", color_block_size)
		.attr("height", color_block_size)
		.attr("fill", d => continentColor(d));

	legend_item.append("text") // texts
		.text(d => d)
		.attr("x", color_block_size + 2*legend_padding)
		.attr("y", (legend_height/continents.length)/2+legend_padding);

	legend_item.exit().remove();
}

function draw_ticks() {
	xaxis = d3.axisBottom().scale(xAxis);
	yaxis = d3.axisLeft().scale(yAxis);
	x_axis = svg.append("g")
		.attr("transform", `translate(${padding}, ${height-padding})`)
		.call(xaxis);
	y_axis = svg.append("g")
		.attr("transform", `translate(${padding}, ${-padding})`)
		.call(yaxis);
	x_axis.append("text")
		.attr("x", width-50)
		.attr("y", 15)
		.text("income")
	y_axis.append("text")
		.attr("x", -50)
		.attr("y", 15)
		.attr("transform", "rotate(-90)")
		.text("Life expectancy")
}


var year_flash = svg.append("g")
	.attr("transform", `translate(${width/2}, ${height/2})`)

function draw_yearflash(){
	var year_text = year_flash.selectAll("text").data([rendered_year]);
	year_text.enter().append("text").merge(year_text)
		.style("font-size", "100px")
		.style("fill", "grey")
		.text(d => d+1800);
	year_text.exit().remove();
}

function draw_circles(year) {
	console.log(filtered_fdata);
	console.log(year);
	var circle_update = svg.selectAll("circle")
		.data(filtered_fdata[year]); // using filtered_fdata instead

	// TODO all your rendering D3 code here
	circle_update.enter().append("circle").merge(circle_update)
		.attr("transform", `translate(${padding}, ${-padding})`) //need to match the transform for ticks
		.attr("cx", d => xAxis(d.income))
		.attr("cy", d => yAxis(d.life_exp))
		.attr("r", d => Math.sqrt(area(d.population)/Math.PI)/2)
		.attr("fill", d => continentColor(d.continent));
	circle_update.exit().remove();

	// draw year flash when circles are updated
	draw_yearflash();

  // this variable gets set only through the button
	// therefore step is called in a loop only when play is pressed
	// step is not called when slider is changed
	if (playing)
        setTimeout(step, 50)
}


// callback function when the button is pressed
function play() {

	if (d3.select("button").property("value") == "Play") {
		d3.select("button").text("Pause")
        d3.select("button").property("value", "Pause")
        playing = true
        step()
	}
	else {
		d3.select("button").text("Play")
        d3.select("button").property("value", "Play")
        playing = false
	}
}

// callback function when the button is pressed (to play the scene)
function step() {

	// At the end of our data, loop back
	rendered_year = (rendered_year < 214) ? rendered_year + 1 : 0
	// set the slider value to match the current step
	d3.select("#slider").property("value", rendered_year);
	draw_circles(rendered_year)
}
