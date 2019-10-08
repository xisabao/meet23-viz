
d3.json("data/match_data.json",function(data) {
    console.log(data);

    createChordChart(data);
});

var survey_data;

d3.json("data/survey_data.json", function(data) {
    console.log(data);

    survey_data = data;

    createDonutCharts(data);
});

d3.select("#dorm-select").on("change", updateDonutCharts);

d3.json("data/bio_data.json", function(data) {
    console.log(data);

    createBarChart(data);
});

var createChordChart = function(data) {
    var matrix = data["match_edge_array"];

    var dorms = ["Greenough", "Hurlbut", "Pennypacker", "Wigglesworth", "Grays",
        "Matthews", "Weld", "Apley Court", "Hollis", "Holworthy", "Lionel", "Mass Hall",
        "Mower", "Stoughton", "Straus", "Canaday", "Thayer"];
    // Margin object with properties for the four directions
    var margin = {top: 20, right: 10, bottom: 20, left: 40};

// Width and height as the inner dimensions of the chart area
    var width = 840 - margin.left - margin.right,
        height = 840 - margin.top - margin.bottom;

    var svg = d3.select("#chord-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var colors = ["#ec4e55", "#b6deef", "#5fd2fa", "#EF7674", "#a05d56",
        '#BFC0C0', '#CEE7E6', '#F3C969', '#EDFF86', '#FFC914',
        '#43AA8B', '#9197AE', '#EF7674', '#CE84AD', '#F8C0C8',
        '#33658A', '#17BEBB']

    var res = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        (matrix);

    // add the groups on the outer part of the circle
    var arcGroup = svg
        .datum(res)
        .append("g");

    var arc = d3.arc()
        .innerRadius(300)
        .outerRadius(310)

    var outerArcGroups = arcGroup
        .selectAll("g")
        .data(function(d) { return d.groups; })
        .enter()
        .append("path")
        .attr("class", "outerArc")
        .attr("id", function(d, i) { return "outerArc" + i; })
        .style("fill", function(d,i){ return colors[i] })
        .style("stroke", "black")
        .attr("d", arc)
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

    arcGroup.selectAll(".arcLabel")
        .data(res.groups)
        .enter()
        .append("text")
        .attr("class", "arcLabel")
        .attr('x', function (d) { return arc.centroid(d)[0] })
        .attr('y', function (d) { return arc.centroid(d)[1] })
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
        .attr('dx', function(d) {
            if (dorms[d.index] === "Wigglesworth") {
                return 50;
            }
            else if (arc.centroid(d)[0] < 0 ) {
                return -35;
            } else {
                return 35;
            }
        })
        .attr('dy', function (d) {
            if (arc.centroid(d)[1] < 0 ) {
                return -30;
            } else {
                return 30;
            }
        })
        .attr('text-anchor', 'middle')
        // .attr("x", 0)
        // .attr("dy", -30)
        // .append("textPath")
        // .attr("xlink:href", function(d, i) { return "#outerArc" + i; })
        .text(function(d) {
            return dorms[d.index]; })
        .style("font-size", "0.8em")
        .style("fill", "black");

    var tooltip = d3.select('#chord-chart')
        .append("div")
        .style("opacity", 0)
        .attr("class", "chord-tooltip")
        .style("background-color", "white")
        .style("position", "absolute")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    // A function that change this tooltip when the user hover a point.
// Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    var showTooltip = function(d) {
        tooltip
            .style("opacity", 1)
            .html("Source: " + dorms[d.source.index] + "<br>Target: " + dorms[d.target.index]
                + "<br>Matches: " + (d.source.value + d.target.value))
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
    }
    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var hideTooltip = function(d) {
        tooltip
            .transition()
            .delay(1000)
            .duration(2000)
            .style("opacity", 0)
    }

// Add the links between groups
    svg.datum(res)
        .append("g")
        .selectAll("path")
        .data(function(d) { return d; })
        .enter()
        .append("path")
        .attr("d", d3.ribbon()
            .radius(300)
        )
        .style("fill", function(d){ return(colors[d.source.index]) }) // colors depend on the source group. Change to target otherwise.
        .style("stroke", "black")
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);
};

function createDonutCharts(data) {
// Margin object with properties for the four directions
    var margin = {top: 60, right: 10, bottom: 20, left: 60};

// Width and height as the inner dimensions of the chart area
    var width = 1000 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

    for (var i = 0; i < data.length; i++) {
        var group = d3.select("#donut-charts")
            .append("div")
            .attr("id", "donut-chart-" + i.toString())
            .attr("class", "col")
            .append("svg")
            .attr("width", 200)
            .attr("height", 200)
            .append("g")
            .attr("transform", "translate(" + 80 + "," + 80 + ")");

        createDonutChart(data[i], group);
    }


};

function updateDonutCharts() {
    for (var i = 0; i < survey_data.length; i++) {
        var group = d3.select("#donut-chart-" + i.toString());
        updateDonutChart(survey_data[i], group);
    }
};

function createDonutChart(data, svg) {
    var tooltip = d3.select("#donut-chart-" +  data["index"].toString())
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");


    svg.append('text')
        .attr("id", "question-" + data["index"].toString())
        .style("text-anchor", "middle")
        .attr("dy", 5)
        .text("Q" + data["index"].toString())
        .on("mouseover", function() {
            tooltip.html(data["text"])
                .style("left", 0 + "px")
                .style("top", 0 + "px")
                .style("display", null)
                .style("opacity", 1); })
        .on("mouseout", function() { tooltip
            .style("display", "none")
            .style("opacity", 0); });

    updateDonutChart(data, svg);

}

function updateDonutChart(data, svg) {

    var dorm = d3.select("#dorm-select").property("value");

    var answer_data = data["answers"];

    var width = 100,
        height = 100
    margin = 10;

    var radius = Math.min(width, height) / 2 - margin;

    var color = d3.scaleOrdinal()
        .domain(answer_data)
        .range(["#ec4e55", "#b6deef", "#5fd2fa", "#6b486b", "#a05d56"])

    var pie = d3.pie()
        .value(function(d) {
            return d["value"]["response_hash"][dorm]; })

    var data_ready = pie(d3.entries(answer_data));


    var arc = d3.arc()
        .innerRadius(80)         // This is the size of the donut hole
        .outerRadius(radius);

    var tooltip = svg.select(".tooltip");

    var slices = svg.selectAll('path.slices')
        .data(data_ready);

    slices.enter()
        .append('path')
        .attr('class', 'slices')
        .merge(slices)
        .attr('d', arc)
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "black")
        .attr('pointer-events', 'all')
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function(d, i) {
        console.log("ANSWER: " + d.data.value.text);
        tooltip.html(d.data.value.text)
            .style("left", 0 + "px")
            .style("top", 0 + "px")
            .style("display", null)
            .style("opacity", 1);
    })
        .on("mouseout", function() {
            tooltip.style("display", "none")
                .style("opacity", 0); });

    slices.exit()
        .remove();

    var textLabels = svg.selectAll("text.data-label")
        .data(data_ready);

    textLabels.enter()
        .append('text')
        .merge(textLabels)
        .attr('class', 'data-label')
        .text(function(d) {
            var num = d.data.value.response_hash[dorm];
            if (num > 0) {
                return num;
            } else {
                return "";
            }
        }).attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr('dx', 0)
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold");

    textLabels
        .transition()
        .duration(1000);

    textLabels.exit()
        .transition()
        .duration(1000)
        .remove();
}

function createBarChart(data) {
    var margin =  {top: 20, right: 10, bottom: 20, left: 40};
    var marginOverview = {top: 30, right: 10, bottom: 20, left: 40};
    var selectorHeight = 40;
    var width = 600 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom - selectorHeight;
    var heightOverview = 80 - marginOverview.top - marginOverview.bottom;

    var maxLength = d3.max(data.map(function(d){ return d.word.length}));
    var barWidth = maxLength * 4;
    var numBars = Math.round(width/barWidth);
    var isScrollDisplayed = barWidth * data.length > width;

    var xscale = d3.scaleBand()
        .domain(data.slice(0,numBars).map(function (d) { return d.word; }))
        .range([0, width])
        .paddingInner(0.1)
        .paddingOuter(0.1);

    var yscale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d.occurrences; }) + 10])
        .range([height, 0]);

    var xAxis  = d3.axisBottom().scale(xscale);
    var yAxis  = d3.axisLeft().scale(yscale);

    var svg = d3.select("#bar-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + selectorHeight);

    var diagram = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    diagram.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis);

    diagram.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    var bars = diagram.append("g");

    bars.selectAll("rect")
        .data(data.slice(0, numBars))
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return xscale(d.word); })
        .attr("y", function (d) { return yscale(d.occurrences); })
        .attr("width", xscale.bandwidth())
        .attr("height", function (d) { return height - yscale(d.occurrences); })
        .attr("fill", function(d, i) {
            if (i % 2 == 0) {
                return "#5fd2fa";
            } else {
                return "#b6deef";
            }
        });

    var textLabels = svg.selectAll("text.occurrences-label")
        .data(data.slice(0, numBars))
        .enter()
        .append("text")
        .attr("x", function(d) {
            return xscale(d.word) + 1.2*xscale.bandwidth();
        })
        .attr("y", function(d) {
            return yscale(d.occurrences) + 5;
        })
        .attr("class", "occurrences-label")
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text(function(d) {
            return d.occurrences;
        });


    if (isScrollDisplayed)
    {
        var xOverview = d3.scaleBand()
            .domain(data.map(function (d) { return d.word; }))
            .range([0, width])
            .paddingInner(0.1);
        yOverview = d3.scaleLinear().range([heightOverview, 0]);
        yOverview.domain(yscale.domain());

        var subBars = diagram.selectAll('.subBar')
            .data(data);

        subBars.enter().append("rect")
            .classed('subBar', true)
            .attr("height", function(d) {
                    return heightOverview - yOverview(d.occurrences);
                })
            .attr("width", function(d) {
                    return xOverview.bandwidth()
                })
            .attr("x", function(d) {
                return xOverview(d.word);
            })
            .attr("y", function(d) {
                    return height + heightOverview + yOverview(d.occurrences)
            })
            .attr("fill", "#b6deef");

        var displayed = d3.scaleQuantize()
            .domain([0, width])
            .range(d3.range(data.length));

        diagram.append("rect")
            .attr("transform", "translate(0, " + (height + margin.bottom) + ")")
            .attr("class", "mover")
            .attr("x", 0)
            .attr("y", 0)
            .attr("fill", "#ec4e55")
            .attr("height", selectorHeight)
            .attr("width", Math.round(numBars * width/data.length))
            .attr("pointer-events", "all")
            .attr("cursor", "ew-resize")
            .call(d3.drag().on("drag", display));
        // TODO: make scroller look more like a scroller

    }
    function display () {
        var x = parseInt(d3.select(".mover").attr("x")),
            nx = x + d3.event.dx,
            w = parseInt(d3.select(".mover").attr("width")),
            f, nf, new_data, rects;

        if ( nx < 0 || nx + w > width ) return;

        d3.select(".mover").attr("x", nx);

        f = displayed(x);
        nf = displayed(nx);


        if ( f === nf ) return;

        new_data = data.slice(nf, nf + numBars);


        xscale.domain(new_data.map(function (d) { return d.word; }));
        diagram.select(".x-axis").call(xAxis);

        rects = bars.selectAll("rect")
            .data(new_data);

        rects.enter().append("rect")
            .attr("class", "bar")
            .merge(rects)
            .attr("x", function (d) { return xscale(d.word); })
            .attr("y", function (d) { return yscale(d.occurrences); })
            .attr("width", xscale.bandwidth())
            .attr("height", function (d) { return height - yscale(d.occurrences); })
            .attr("fill", function(d, i) {
                if (i % 2 == 0) {
                    return "#5fd2fa";
                } else {
                    return "#b6deef";
                }
            });

        rects.exit().remove();


        textLabels = svg.selectAll("text.occurrences-label")
            .data(new_data)
            .enter()
            .append("text")
            .merge(textLabels)
            .attr("x", function(d) {
                return xscale(d.word) + 1.2*xscale.bandwidth();
            })
            .attr("y", function(d) {
                return yscale(d.occurrences) + 5;
            })
            .attr("class", "occurrences-label")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .text(function(d) {
                return d.occurrences;
            });

        textLabels.exit().remove();
    };

}