
///////////// Chapter 1. Data Loading //////////////
var data_location = 'iris.data'
var iris_data;
d3.csv(data_location).then(function(data){
  data.forEach(function(d){
    // convert string to number
    d.sepal_length = +d.sepal_length;
    d.sepal_width = +d.sepal_width;
    d.petal_length = +d.petal_length;
    d.petal_width = +d.petal_width;
  });
  iris_data = data;
  // console.log(iris_data);
  // perform initialization after data is loaded.
  draw_scatterpoints();
});

///////////// Chapter 1. End /////////////

///////////// Chapter 2. Scatter Plot Initialization //////////////
const padding = 25
const scatterplot_size = 400
const scatterpoint_radius = 5
const svg_width = scatterplot_size * 2 + padding * 4
const svg_height = scatterplot_size + padding * 2

// draw svg canvas
var svg = d3.select('#svg_chart').append('svg')
  .attr('width', svg_width)
  .attr('height', svg_height);

// draw scatterplot borders
svg.append('rect')
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('x', padding)
  .attr('y', padding)
  .attr('width', scatterplot_size)
  .attr('height', scatterplot_size);
svg.append('rect')
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('x', scatterplot_size + padding * 3)
  .attr('y', padding)
  .attr('width', scatterplot_size)
  .attr('height', scatterplot_size);

// useful scales for mapping cx and cy for scatter points
var sepal_length_scale = d3.scaleLinear()
  .range([scatterpoint_radius, scatterplot_size-scatterpoint_radius])
  .domain([4.3, 7.9]);

var sepal_width_scale = d3.scaleLinear()
  .range([scatterpoint_radius, scatterplot_size-scatterpoint_radius])
  .domain([4.4, 2.0]);

var petal_length_scale = d3.scaleLinear()
  .range([scatterpoint_radius, scatterplot_size-scatterpoint_radius])
  .domain([1.0, 6.9]);

var petal_width_scale = d3.scaleLinear()
  .range([scatterpoint_radius, scatterplot_size-scatterpoint_radius])
  .domain([2.5, 0.1]);

var class_color = d3.scaleOrdinal(d3.schemePastel1)

// make scatterplot point groups
var sepal_scatterplot = svg.append('g')
  .attr('class', 'sepal_group')
  .attr('transform', `translate(${padding},${padding})`);

sepal_scatterplot.append('text')
  .attr('x', scatterplot_size - 80)
  .attr('y', scatterplot_size-5)
  .text('sepal length');

sepal_scatterplot.append('text')
  .attr('transform', "rotate(90)")
  .attr('x', 10)
  .attr('y', -10)
  .text('sepal width');

var petal_scatterplot = svg.append('g')
  .attr('class', 'petal_group')
  .attr('transform', `translate(${scatterplot_size + padding * 3},${padding})`);

petal_scatterplot.append('text')
  .attr('x', scatterplot_size - 80)
  .attr('y', scatterplot_size-5)
  .text('petal length');

petal_scatterplot.append('text')
  .attr('transform', "rotate(90)")
  .attr('x', 10)
  .attr('y', -10)
  .text('petal width');

function draw_scatterpoints(){
  //TODO: Finish drawing scatterplots by adding legends and axis.
  sepal_xAxis = d3.axisBottom().scale(sepal_length_scale);
  sepal_yAxis = d3.axisLeft().scale(sepal_width_scale);
  svg.append('g')
    .attr('transform', `translate(${padding},${padding+scatterplot_size})`)
    .call(sepal_xAxis);
  svg.append('g')
    .attr('transform', `translate(${padding},${padding})`)
    .call(sepal_yAxis);

  petal_xAxis = d3.axisBottom().scale(petal_length_scale);
  petal_yAxis = d3.axisLeft().scale(petal_width_scale);
  svg.append('g')
    .attr('transform', `translate(${scatterplot_size + padding * 3},${padding+scatterplot_size})`)
    .call(petal_xAxis);
  svg.append('g')
    .attr('transform', `translate(${scatterplot_size + padding * 3},${padding})`)
    .call(petal_yAxis);

  //TODO: append points to the scatterplot.
  var sepal_points = sepal_scatterplot.selectAll('circle').data(iris_data);
  var petal_points = petal_scatterplot.selectAll('circle').data(iris_data);

  sepal_points.enter().append('circle').merge(sepal_points)
    .attr('cx', d => sepal_length_scale(d.sepal_length))
    .attr('cy', d => sepal_width_scale(d.sepal_width))
    .attr('r', scatterpoint_radius)
    .attr('fill', d => class_color(d.class))
    .on("mouseover", hoverOver_sepal)
    .on("mouseout", hoverOut);

  petal_points.enter().append('circle').merge(petal_points)
    .attr('cx', d => petal_length_scale(d.petal_length))
    .attr('cy', d => petal_width_scale(d.petal_width))
    .attr('r', scatterpoint_radius)
    .attr('fill', d => class_color(d.class))
    .on("mouseover", hoverOver_petal)
    .on("mouseout", hoverOut);


}
function hoverOver_sepal(d, i) {
    d3.select(this)
      .attr('r' , scatterpoint_radius*1.5)
    x = d.sepal_length;
    y = d.sepal_width;

    d3.select('.sepal_group').append('text')
      .attr('id', 'p_coor')
      .text('(' + x + ', ' + y + ')')
      .attr('x', sepal_length_scale(x) + 10)
      .attr('y', sepal_width_scale(y) + 10);
    // console.log([sepal_length_scale(x) - 30, sepal_width_scale(y) + 50]);
}

function hoverOut(d, i) {
  d3.select(this)
    .attr('r' , scatterpoint_radius);
  d3.select('#p_coor').remove();
}

function hoverOver_petal(d, i) {
    d3.select(this)
      .attr('r' , scatterpoint_radius*1.5)
    x = d.petal_length;
    y = d.petal_width;

    d3.select('.petal_group').append('text')
      .attr('id', 'p_coor')
      .text('(' + x + ', ' + y + ')')
      .attr('x', petal_length_scale(x) + 10)
      .attr('y', petal_width_scale(y) + 10);
}

///////////// Chapter 2. End /////////////
