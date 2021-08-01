
const formatComma = d3.format(".1f");
const legendFormat = d3.timeFormat('%b %d, %Y');

// set the dimensions and margins of the graph
var margin = { top: 50, right: 40, bottom: 110, left: 80 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#third")
    .append("svg")
    .attr("id", "mysvg3")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// text label for the y axis
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 5 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Annual Electricity Consumption (TWh)");

var dataset1;
var dataset2;

const annotation1 = [
    {
        note: {
            label: "The scale of Bitcoin electricity consumption is comparable with countries like Chile and Belgium",
            title: "2019 Bitcoin Electricity Consumption: 69 TWh",
            wrap: 2000,
            align: "left"

        },
        connector: {
            end: "arrow" // 'dot' also available
        },
        x: 220,
        y: 110,
        dy: -10,
        dx: 50
    }
]

const annotation2 = [
    {
        note: {
            label: "The estimated energy consumption of Bitcoin in 2019 is relatively small compared to countries with large population, such as United States",
            title: "2019 Bitcoin Electricity Consumption: 69 TWh",
            wrap: 250,
            align: "left"
        },
        connector: {
            end: "arrow" // 'dot' also available
        },
        x: 555,
        y: 370,
        dy: -120,
        dx: 10
    }
]

d3.csv("./data/BTC_POWER_BY_COUNTRY.csv", function (data) {
    dataset1 = data;
});
setTimeout(function () {
    console.log(dataset1);
}, 200);
d3.csv("./data/BTC_POWER_BY_COUNTRY_ALL.csv", function (data) {
    dataset2 = data;
});
setTimeout(function () {
    console.log(dataset2);
}, 200);


// Initialize the X axis
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.2);
var xAxis = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

// Initialize the Y axis
var y = d3.scaleLinear()
    .range([height, 0]);
var yAxis = svg.append("g")
    .attr("class", "x axis")





// A function that create / update the plot for a given variable:
function update(data, note) {

    // remove annotation if any
    d3.select("#mysvg3").selectAll("g.annotation-connector, g.annotation-note").remove()
    // Update the X axis
    x.domain(data.map(function (d) { return d.country; }))
        .padding(0.2)
    xAxis.call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")

    // Update the Y axis
    y.domain([0, d3.max(data, function (d) { return +d.consumption; })]);
    yAxis.transition().duration(1000).call(d3.axisLeft(y));



    // Create the u variable
    var u = svg.selectAll("rect")
        .data(data)

    u
        .enter()
        .append("rect") // Add a new rect for each new elements
        .merge(u) // get the already existing elements as well
        .transition() // and apply changes to all of them
        .duration(1000)
        .attr("x", function (d) { return x(d.country); })
        .attr("y", function (d) { return y(d.consumption); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.consumption); })
        .attr("fill", function (d) {
            if (d.country == "Bitcoin") {
                return "#FFB71A"
            } else {
                return "#cccccc"
            }
        })

    // If less group in the new dataset, I delete the ones not in use anymore
    u
        .exit()
        .remove()

    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        .annotations(note)
    d3.select("#mysvg3")
        .append("g")
        .attr('class', 'annotation-group')
        .call(makeAnnotations)


}


// Initialize the plot with the first dataset
setTimeout(function () {
    update(dataset2, annotation2);
}, 200);

