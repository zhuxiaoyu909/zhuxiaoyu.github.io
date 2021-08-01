

var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", 960)
    .attr("height", 500),
    margin = { top: 50, right: 100, bottom: 110, left: 80 },
    margin2 = { top: 430, right: 100, bottom: 30, left: 80 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);



const formatComma = d3.format(",.0f");
const legendFormat = d3.timeFormat('%b %d, %Y');

d3.csv("./data/BTC_USD.csv", type, function (error, data) {
    if (error) throw error;

    var x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]);

    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);

    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    var line = d3.line()
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d.price); });

    var line2 = d3.line()
        .x(function (d) { return x2(d.date); })
        .y(function (d) { return y2(d.price); });

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    x.domain(d3.extent(data, function (d) { return d.date; }));
    y.domain([0, d3.max(data, function (d) { return +d.price; })]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    //add line plot
    focus.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    //add x axis
    focus.append("g")
        .attr("class", "axis focus__axis--context")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    //focus.append("g")
    //    .attr("class", "axis axis--y")
    //    .call(yAxis);

    //add grid
    focus.append("g")
        .attr("class", "grid")
        .call(yAxis
            .ticks(5)
            .tickSize(-width)
            .tickFormat(d3.format("$,"))
        )

    // text label for the y axis
    focus.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Bitcoin Price ($)");

    context.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line2);

    context.append("g")
        .attr("class", "axis focus__axis--context")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    //context.append("g")
    //    .attr("class", "brush")
    //    .call(brush)
    //    .call(brush.move, x.range());

    var gBrush = context.append("g")
        .attr("class", "brush")
        .call(brush);

    // style brush resize handle
    var brushResizePath = function (d) {
        var e = +(d.type == "e"),
            x = e ? 1 : -1,
            y = height2 / 2;
        return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
    }

    var handle = gBrush.selectAll(".handle--custom")
        .data([{ type: "w" }, { type: "e" }])
        .enter().append("path")
        .attr("class", "handle--custom")
        .attr("stroke", "#000")
        .attr("cursor", "ew-resize")
        .attr("d", brushResizePath);

    gBrush
        .call(brush.move, x.range());


    // This allows to find the closest X index of the mouse:
    var bisect = d3.bisector(function (d) { return d.date; }).left;

    // Create the circle that travels along the curve of chart
    var cursor = focus
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 3)
        .style("opacity", 0)

    // Create the text that travels along the curve of chart
    var cursorText = focus
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")
    //    .attr('transform', 'translate(' + (width - 220) + ', -10)');


    // Create a rect on top of the svg area: this rectangle recovers mouse position
    focus
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);


    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
        cursor.style("opacity", 1)
        cursorText.style("opacity", 1)
    }

    function mousemove() {
        // recover coordinate we need
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisect(data, x0, 1);
        selectedData = data[i]
        cursor
            .attr("cx", x(selectedData.date))
            .attr("cy", y(selectedData.price))

        cursorText
            .text(legendFormat(new Date(selectedData.date)))
            
            .attr("x", x(selectedData.date) + 15)
            .attr("y", y(selectedData.price) - 35)
            .append('tspan')
            .attr('x', 0)
            .attr('dy', 25)
            .text("Price: $" + formatComma(selectedData.price))
            .attr("x", x(selectedData.date) + 15)
            .attr("y", y(selectedData.price) - 35)
        

    }
    function mouseout() {
        cursor.style("opacity", 0)
        cursorText.style("opacity", 0)
    }

    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));
        focus.select(".line").attr("d", line);
        focus.select(".focus__axis--context").call(xAxis);
        svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            .scale(width / (s[1] - s[0]))
            .translate(-s[0], 0));
        handle.attr("display", null).attr("transform", function (d, i) { return "translate(" + [s[i], - height2 / 4] + ")"; });
    }

    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        x.domain(t.rescaleX(x2).domain());
        focus.select(".line").attr("d", line);
        focus.select(".focus__axis--context").call(xAxis);
        context.select(".brush").call(brush.move, x.range().map(t.invertX, t));

    }

    //function brushed() {
    //    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    //    var s = d3.event.selection || x2.range();
    //    x.domain(s.map(x2.invert, x2));
    //    focus.select(".area").attr("d", area);
    //    focus.select(".axis--x").call(xAxis);
    //    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
    //        .scale(width / (s[1] - s[0]))
    //        .translate(-s[0], 0));
    //}

    //function zoomed() {
    //    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    //    var t = d3.event.transform;
    //    x.domain(t.rescaleX(x2).domain());
    //    focus.select(".area").attr("d", area);
    //    focus.select(".axis--x").call(xAxis);
    //    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    //}


});

function type(d) {
    return { date: d3.timeParse("%Y-%m-%d")(d.Date), price: d.Close, vol: d.Volume }
}

