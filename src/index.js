'use strict';

var LightningVisualization = require('lightning-visualization');
var _ = require('lodash');
var d3 = require('d3');
var utils = require('lightning-client-utils');
var colorbrewer = require('colorbrewer');
var cloud = require('d3-cloud');

var Visualization = LightningVisualization.extend({

  getDefaultOptions: function() {
    return {
      spiral: 'archimedean',
      angle: 'diagonal',
      colormap: 'Lightning'
    }
  },

  init: function() {
    this.render();
  },

  render: function() {
    var fill = d3.scale.category20();
    var data = this.data
    var options = this.options
    var selector = this.selector;
    var height = this.height;
    var width = this.width;

    var cmap
    if (options.colormap == 'Lightning') {
      cmap = utils.getColors(data.length)
    } else {
      cmap = colorbrewer[options.colormap][data.length]
    }

    var rotate
    if (options.angle === 'right') {
      rotate = function() {return ~~(Math.random() * 2) * 90;}
    } else if (options.angle === 'diagonal') {
      rotate = function() {return (~~(Math.random() * 6) - 3) * 30;}
    }

    var layout = cloud()
      .size([width, height])
      .words(data)
     // .padding(5)
      .rotate(rotate)
      .font("Impact")
      .spiral(options.spiral)
      .fontSize(function(d) { return d.size; })
      .on("end", draw);

    layout.start();

    function draw(words) {
      d3.select(selector).append("svg")
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
      .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return cmap[i]; })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
    }
  },

  formatData: function(data) {
    var words = data.words
    var counts = data.counts

    var sum = counts.reduce( function(x, y) {return x + y})
    var fractions = counts.map( function(d) {return d / sum})
    var data = data.words.map( function(d, i) {
      console.log(d)
      return {text: d, size: 10 + fractions[i] * 600};
    })
    console.log(data)
    return data;
  },

  updateData: function(formattedData) {
      this.data = formattedData;
  },

  appendData: function(formattedData) {      
  }

});

module.exports = Visualization;
