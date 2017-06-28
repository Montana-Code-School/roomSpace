function barGraph() {

var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var tooltip = d3.select("body").append("div").attr("class", "toolTip");

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("doc/data.csv", function(d) {
  	d.Total = +d.Total;
  	return d;
	}, function(error, data) {
  	if (error) throw error;


  x.domain(data.map(function(d) { return d.Time; }));
  y.domain([0, d3.max(data, function(d) { return d.Total + 1; })]);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("TOTAL")
  		.attr("fill", "#000");

  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.Time); })
      .attr("y", function(d) { return y(d.Total); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.Total); })
      .on("mousemove", function(d){
                  tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY)
                    .style("display", "inline-block")
                    .html((d.Date) + "<br>" + "total: " + (d.Total));
              })
          		.on("mouseout", function(d){ tooltip.style("display", "none");});
      });
    }
barGraph();
