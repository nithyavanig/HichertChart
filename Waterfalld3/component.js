function createChart(){
    let cumulative = 0;
    let all_groupdata = [];
    let result = [];
    let salesdata = data;
    
    for (let i=0; i<salesdata.length;i++){
        all_groupdata.push(salesdata[i]["Group"]);
    }
    let groupdata = [...new Set(all_groupdata)];
    let formattedSalesData = [];

    let index = 0;
    for (let d=0;d<groupdata.length;d++){
        let groupName =  groupdata[d];
        for (let i = 0; i < salesdata.length; i++){
            if(groupName === salesdata[i].Group){
                result[index] = {};
                result[index].start = cumulative;
                result[index].name = salesdata[i].Source;
                cumulative += salesdata[i].value;
                result[index].group = salesdata[i].Group;
                result[index].end = cumulative;
                result[index].class = (salesdata[i].value >= 0) ? 'positive' : 'negative'
                index++;
            }            
        }
        result[index] = {};
        result[index].start = 0;
        result[index].name = groupdata[d];
        result[index].end = cumulative;
        result[index].group = "Total";
        result[index].class = "total";
        index++;
    }

    JSON.stringify(result);
    
    let margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 120
      },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      //barHeight = (height-margin.top-margin.bottom*2)* 0.4/result.length,
      barPadding = (height-margin.top-margin.bottom*2)*0.6/result.length;

    let barHeight = height/(result.length);
    
    let x = d3.scaleLinear()
      .range([0, width]);
    
    //scaleLinear
    let y = d3.scaleBand()
      .range([height, 0]) 
      .padding(0.3);
    
    let svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .style("border", "1px solid black")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    result = result.reverse();
    x.domain([0, d3.max(result, function(d) {
      return d.end;
    })]);
    y.domain(result.map(function(d) {
      return d.name;
    }));
    
    // add the x Axis
    let xaxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .call(g => g.select(".domain").remove())
    
    // add the y Axis
    // let yaxis = d3.axisLeft(y)
    //                 .tickPadding(5);
    let yaxis = svg.append("g")
      .call(d3.axisLeft(y));
      

    //remove y-axis end ticks
    //yaxis.tickSize(0);
    
    //Remove X-axis labels
    xaxis.selectAll("text").remove();

    //remove x-axis ticks.
    //xaxis.ticks(0);
    
    // Create bars     
    let barGroup =  svg.selectAll(".bar")
    .data(result)
    .enter();

    let bar = barGroup.append("rect")
      .attr("class", function(d) { return "bar " + d.class })
      .attr("x", function(d) {
        return x(Math.min(d.start,d.end));
      })
      .attr("width", function(d) {
        return Math.abs(x(d.start) - x(d.end))
      })
      .attr("y", function(d) {
        return y(d.name);
      })
      .attr("height", y.bandwidth());

      // add labels.
      //barGroup.append("text")
    barGroup.filter(function(d) { return d.class != "negative" }).append("text")          
    .attr("class","datalabel")
    .attr("x", function(d) { return x(d.end) + 5; })
    .attr("y", function(d) { return y(d.name)+(y.bandwidth()/2)+3; })
    .text(function(d) { return (d.end - d.start);});

    //datalabels for negative values
    barGroup.filter(function(d) { return d.class === "negative" }).append("text")          
    .attr("class","datalabel")
    .attr("x", function(d) { return x(d.end)-15; })
    .attr("y", function(d) { return y(d.name)+(y.bandwidth()/2)+3; })
    .text(function(d) { return Math.abs(d.end - d.start);});

    //add connector lines between bars - for positive values
    //filter(function(d) { return d.class != "negative" }).
    barGroup.append("line")
      .attr("class", "connector")
      .attr("x1", function(d) { return x(d.end);} )
      .attr("y1", function(d) { return y(d.name)+y.bandwidth();} )
      .attr("x2", function(d) { return x(d.end);} )
      .attr("y2", function(d) { return y(d.name)+barHeight;} );

    /* //add connector lines between bars - for negative values
    barGroup.filter(function(d) { return d.class != "negative" }).append("line")
      .attr("class", "connector")
      .attr("x1", function(d) { return x(d.end);} )
      .attr("y1", function(d) { return y(d.name)+y.bandwidth();} )
      .attr("x2", function(d) { return x(d.end);} )
      .attr("y2", function(d) { return y(d.name)+barHeight;} ); */

    /* barGroup.append("line")
      .attr("class", "connector")
      .attr("x1", function(d) { return x(d.end);})
      .attr("y1", function(d) { return y(d.name)+y.bandwidth();})
      .attr("x2", function(d) { return x(d.end);})
      .attr("y2", function(d) { return y(d.name)+barHeight;}); */
}