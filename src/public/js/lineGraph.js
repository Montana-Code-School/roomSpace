function lineGraph() {
  // set the dimensions and margins of the graph
  var margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 50
    },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // parse the time
  var parseTime = d3.timeParse("%-I:%M:%S %p");
  var formatTime = d3.timeFormat("%H:%M %p");

  // set the ranges
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  //define the area
  var area = d3.area()
      .x(function(d) {
        return x(d.Time);
      })
      .y0(height)
      .y1(function(d) {
        return y(d.Total);
      });

  // define the lines
  var valueline = d3.line()
    .curve(d3.curveCardinal)
    .x(function(d) {
      return x(d.Time);
    })
    .y(function(d) {
      return y(d.Total);
    });

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#lineGraph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Get the data
  d3.csv("doc/data.csv", function(error, data) {
    if (error) throw error;

    // format the data
    data.forEach(function(d) {
      d.Time = parseTime(d.Time);
      d.Total = +d.Total;
    });
    // Scale the range of the data
    x.domain(d3.extent(data, function(d) {
      return d.Time
    }));
    y.domain([0, d3.max(data, function(d) {
      return d.Total;
    })]);
    svg.append("path")
      .data([data])
      .attr("class", "area")
      .attr("d", area);

    //nest the entries by date
    var dataNest = d3.nest()
      .key(function(d) {return d.Date;})
      .entries(data);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    //Loop through each date
    dataNest.forEach(function(d) {
        svg.append("path")
          .attr("class", "line")
          .style("fill", "none")
          .style("stroke", function() {
            return d.color = color(d.key); })
          .attr("d", valueline(d.values));
    });

    //add the dots with tooltip
      svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .style("fill", "blue")
        .attr("r", 4)
        .attr("cx", function(d) {
          return x(d.Time);
        })
        .attr("cy", function(d) {
          return y(d.Total);
        })
        .on("mouseover", function(d) {
          div.transition()
            .duration(1)
            .style("opacity", .8)
          div.html(
              d.Date + "<br/>" + formatTime(d.Time) + "<br/>" + "Total: " + d.Total)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d){
          div.transition()
          .duration(1)
          .style("display", "none")});


    // Add the X Axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
      .call(d3.axisLeft(y));

    //Add the text label for the X axis
    svg.append("text")
      .attr("transform",
        "translate("+(width/2)+" ," + (height + margin.bottom) + ")")
      .style("text-anchor", "middle")
      .text("TIME");

    //text label for the y axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height/2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("TOTAL PEOPLE");
  });
}

lineGraph();
