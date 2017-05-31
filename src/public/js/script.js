//
var chartData = [10,20,30,40,50,60,70,80];

var height = 200,
  width = 720,
  barWidth = 40,
  barOffset = 20;

var chart = d3.select('#bar-chart');
var group = chart.append('svg').attr('width', width).attr('height', height).selectAll('rect').data(chartData).enter().append("rect")
  group.each(function(data, index) {
    d3.select(this).attr('height', data);
    d3.select(this).attr('width', barWidth);

    d3.select(this).attr("fill", "red");
    d3.select(this).attr('x', index * (barWidth + barOffset));
    d3.select(this).attr('y', height - data);
  })

    // .attr('height', function(chartData) {
    //   console.log(chartData);
    //   return chartData;
    // })
    // .attr(
    // .attr('y', function(chartData) {
    //   return height - chartData;
    // });
