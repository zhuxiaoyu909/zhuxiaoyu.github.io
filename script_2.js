var svg2 = d3.select("#second")
    .append("svg")
    .attr("id", "mysvg2")
    .attr("width", 960)
    .attr("height", 500),
    margin_sec = { top: 50, right: 40, bottom: 110, left: 80 },
    margin_sec2 = { top: 430, right: 40, bottom: 30, left: 80 },
    width_sec = +svg2.attr("width") - margin_sec.left - margin_sec.right,
    height_sec = +svg2.attr("height") - margin_sec.top - margin_sec.bottom,
    height_sec2 = +svg2.attr("height") - margin_sec2.top - margin_sec2.bottom;

const formatComma = d3.format(".1f");
const legendFormat = d3.timeFormat('%b %d, %Y');



//Read the second data
d3.csv("./data/BTC_POWER.csv",

    // When reading the csv, I must format variables:
    function (d) {
        return { date: d3.timeParse("%Y-%m-%d")(d.Date), max: d.MAX, min: d.MIN, guess: d.GUESS }
    },

    // Now I can use this dataset:
    function (data) {

        var context = svg2.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin_sec.left + "," + margin_sec.top + ")");

        // Add X axis --> it is a date format
        var x = d3.scaleTime()
            .domain(d3.extent(data, function (d) { return d.date; }))
            .range([0, width_sec]);
        context.append("g")
            .attr("class", "x axis focus__axis--context")
            .attr("transform", "translate(0," + (height_sec) + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return +d.max; })])
            .range([height_sec, 0]);
        //svg.append("g")
        //    .call(d3.axisLeft(y).tickSizeOuter(0));


        // add the Y gridlines
        context.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-width_sec)
                //.tickFormat("")
            )

        // text label for the y axis
        context.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 5 - margin_sec.left)
            .attr("x", 0 - (height_sec / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Annual Electricity Consumption (TWh)");

        // Show confidence interval
        context.append("path")
            .datum(data)
            .attr("fill", "#FFB71A")
            .attr("stroke", "none")
            .attr("opacity", ".4")
            .attr("d", d3.area()
                .x(function (d) { return x(d.date) })
                .y0(function (d) { return y(d.min) })
                .y1(function (d) { return y(d.max) })
            )

        // Add the line
        context
            .append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#FFB71A")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) { return x(d.date) })
                .y(function (d) { return y(d.guess) })
            )

        // This allows to find the closest X index of the mouse:
        var bisect = d3.bisector(function (d) { return d.date; }).left;


        // Create the circle that travels along the curve of chart
        var focus = context
            .append('g')
            .append('circle')
            .style("fill", "none")
            .attr("stroke", "black")
            .attr('r', 3)
            .style("opacity", 0)

        var focus_h = context
            .append('g')
            .append('circle')
            .style("fill", "none")
            .attr("stroke", "black")
            .attr('r', 3)
            .style("opacity", 0.6)

        var focus_l = context
            .append('g')
            .append('circle')
            .style("fill", "none")
            .attr("stroke", "black")
            .attr('r', 3)
            .style("opacity", 0.6)

        // Create the text that travels along the curve of chart
        var focusText = context
            .append('g')
            .append('text')
            .style("opacity", 0)
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle")
            .attr('transform', 'translate(' + (width_sec - 810) + ', -10)');




        // Create a rect on top of the svg area: this rectangle recovers mouse position
        context
            .append('rect')
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('width', width_sec)
            .attr('height', height_sec)
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);


        // What happens when the mouse move -> show the annotations at the right positions.
        function mouseover() {
            focus.style("opacity", 1)
            focus_h.style("opacity", 0.5)
            focus_l.style("opacity", 0.5)
            focusText.style("opacity", 1)
        }

        function mousemove() {
            // recover coordinate we need
            var x0 = x.invert(d3.mouse(this)[0]);
            var i = bisect(data, x0, 1);
            selectedData = data[i]
            focus
                .attr("cx", x(selectedData.date))
                .attr("cy", y(selectedData.guess))
            focus_h
                .attr("cx", x(selectedData.date))
                .attr("cy", y(selectedData.max))
            focus_l
                .attr("cx", x(selectedData.date))
                .attr("cy", y(selectedData.min))
            focusText
                .text("Date: " + legendFormat(new Date(selectedData.date)))
                .append('tspan')
                .attr('x', 0)
                .attr('dy', 25)
                .text('Estimated Energy Consumption (TWh): ' + formatComma(selectedData.guess))
                .append('tspan')
                .attr('x', 0)
                .attr('dy', 25)
                .text('Range (TWh): ' + formatComma(selectedData.min) + ' - ' + formatComma(selectedData.max))

        }

        function mouseout() {
            focus.style("opacity", 0)
            focus_h.style("opacity", 0)
            focus_l.style("opacity", 0)
            focusText.style("opacity", 0)
        }


    })