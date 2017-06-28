

var data = [
  {
    className: 'germany', // optional can be used for styling
    axes: [
      {axis: "strength", value: 13},
      {axis: "intelligence", value: 6},
      {axis: "charisma", value: 5},
      {axis: "dexterity", value: 9},
      {axis: "luck", value: 2}
    ]
  },
  {
    className: 'argentina',
    axes: [
      {axis: "strength", value: 6},
      {axis: "intelligence", value: 7},
      {axis: "charisma", value: 10},
      {axis: "dexterity", value: 13},
      {axis: "luck", value: 9}
    ]
  }
];
function randomDataset() {
  return data.map(function(d) {
    return {
      className: d.className,
      axes: d.axes.map(function(axis) {
        return {axis: axis.axis, value: Math.ceil(Math.random() * 10)};
      })
    };
  });
}

var chart = RadarChart;
var cfg = chart.cfg; // retrieve default config
var svg = d3.select('body').append('svg')

svg.append('g').classed('single', 1).datum(randomDataset()).call(chart);

// many radars
chart.config({w: cfg.w / 4, h: cfg.h / 4, axisText: false, levels: 0, circles: false});
cfg = chart.config();
function render() {
  var game = svg.selectAll('g.game').data(
    [
      randomDataset(),
      randomDataset(),
      randomDataset(),
      randomDataset()
    ]
  );
  game.enter().append('g').classed('game', 1);
  game
    .attr('transform', function(d, i) { return 'translate('+((cfg.w * 4) + 50 + (i * cfg.w))+','+ (cfg.h * 1.3) +')'; })
    .call(chart);

  setTimeout(render, 1000);
}
render();
