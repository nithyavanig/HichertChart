function createChart(){
    let result1 = [];
    let result2 = [];
    let salesdata1 = data;
    let salesdata2 = data2;
    result1 = getResult(salesdata1);
    result2 = getResult(salesdata2);
    
    let chartType = "bar";
    //drawBarChart(result1);
    if(chartType === "waterfall"){
      
      drawWaterfallChart(result1,true);
      drawWaterfallChart(result2,false);
    }
    else if(chartType === "bar"){
      drawBarChart(result1,result2);
    }
    
    drawVarianceBar(result1,result2);
    drawVariancePercentage(result1,result2);
}

function getResult(salesdata){
  let result = [];
  let cumulative = 0;
  let all_groupdata = [];
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
                result[index].measure = salesdata[i].Measure;

                index++;
                
            }            
        }
        result[index] = {};
        result[index].start = 0;
        result[index].name = groupName;
        result[index].end = cumulative;
        result[index].group = "Total";
        result[index].class = "total";

        if(index === (salesdata.length + groupdata.length)-1){
          result[index].class = result[index].class + " end";
        }
        index++;
    }
    return result;
}

function drawBarChart(result1,result2) {

  let data = getBarData(result1,result2);
  //let data = barpositive;
  let margin = {
    top: 20,
    right: 30,
    bottom: 30,
    left: 120
  },
  width = 600 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom,
  //barHeight = (height-margin.top-margin.bottom*2)* 0.4/result.length,
  barPadding = (height-margin.top-margin.bottom*2)*0.6/data[0].length;
  
  let x = d3.scaleLinear().range([0, width]);

  //scaleLinear
  let y = d3.scaleBand()
    .range([height, 0]) 
    .padding(0.4);

  let svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  const barAxisPadding = 3;
  const datalabelPadding = 3;
  const max1 = Math.max(...data[0].map(o => o.value), 0);
  const max2 = Math.max(...data[1].map(o => o.value), 0);
  data[0] = data[0].reverse();
  data[1] = data[1].reverse();

  const xAxisMax = Math.max(max1,max2);

  x.domain([-400, 1200]);

  y.domain(data[0].map(function(d) {
        return d.name;
      }));
  let xaxis = svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .call(g => g.select(".domain").remove());

  /* let yaxis = svg.append("g")
      .call(d3.axisLeft(y)); */

  //xaxis.selectAll("text").remove();

  let barGroup1 =  svg.selectAll(".bar").data(data[0]).enter();
  let barGroup2 =  svg.selectAll(".bar").data(data[1]).enter();

  let bar1_bordercolor = "#000000";
  let bar1_fillcolor = "none";
  let bar1_borderwidth = "1px";

  let bar2_bordercolor = "#000000";
  let bar2_fillcolor = "#000000";
  let bar2_borderwidth = "1px";

  let bar1 = barGroup1.append("rect")
            .attr("class", function(d) { return "bar1_" + d.class })
            .attr("x", d=>{
              return x(Math.min(0,d.value));
            })
            .attr("width", d=> {
              return Math.abs(x(d.value) - x(0));
            })
            .attr("y", d=> {
              return y(d.name) - barAxisPadding;
            })
            .attr("height", y.bandwidth())
            .style("stroke", bar1_bordercolor)
            .style("fill", bar1_fillcolor)
            .style("stroke-width", bar1_borderwidth);

  let bar2 = barGroup2.append("rect")
            .attr("class", function(d) { return "bar2_" + d.class })
            .attr("x", d=>{
              return x(Math.min(0,d.value));
            })
            .attr("width", d=> {
              return Math.abs(x(d.value)-x(0));
            })
            .attr("y", d=> {
              return y(d.name);
            })
            .attr("height", y.bandwidth())
            .style("stroke", bar2_bordercolor)
            .style("fill", bar2_fillcolor)
            .style("stroke-width", bar2_borderwidth);

  let tickNeg1 = svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + x(0) + ",0)")
          .call(d3.axisLeft(y))
          .selectAll(".tick")
          .filter(function(d, i) { return data[0][i].value < 0; });
        
  let tickNeg2 = svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + x(0) + ",0)")
          .call(d3.axisLeft(y))
          .selectAll(".tick")
          .filter(function(d, i) { return data[1][i].value < 0; });

      //y-axis line in the middle to accomodate negative values on left
		  tickNeg1.select("line")
      .attr("x2", 6);
      
      //Remove y-axis ticks and labels
      svg.selectAll(".tick")
      .remove();

      //Add datalabels - positive values
    barGroup2.filter(function(d) {
              return d.class != "negative";
            })
            .append("text")
            .attr("class", "datalabel")
            .attr("x", function(d) {
              return x(d.value) + datalabelPadding;
            })
            .attr("y", function(d) {
              return y(d.name) + y.bandwidth()/2;
            })
            .text(function(d,i) {
              return "+"+ d.value;
            });

    barGroup2.filter(function(d) {
              return d.class === "negative";
            })
            .append("text")
            .attr("class", "datalabel")
            .attr("x", function(d) {
              return x(d.value) - 25;
            })
            .attr("y", function(d) {
              return y(d.name) + y.bandwidth()/2;
            })
            .text(function(d,i) {
              return d.value;
            });
}

function drawWaterfallChart(result,hasTicks){
      let margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 120
      },
      width = 400 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      //barHeight = (height-margin.top-margin.bottom*2)* 0.4/result.length,
      barPadding = (height-margin.top-margin.bottom*2)*0.6/result.length;

    let barHeight = height/(result.length);

    let x = d3.scaleLinear()
      .range([0, width]);

    //scaleLinear
    let y = d3.scaleBand()
      .range([height, 0]) 
      .padding(0.4);

    let svg = d3.select("#chart").append("svg")
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
      // barGroup.append("text")
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
    //filter(function(d) { return d.class != "negative" }). barGroup.append("line")
    barGroup.filter(function(d) { return !d.class.includes("end") }).append("line")
      .attr("class", "connector")
      .attr("x1", function(d) { return x(d.end);} )
      .attr("y1", function(d) { return y(d.name);} )
      .attr("x2", function(d) { return x(d.end);} )
      .attr("y2", function(d) { return y(d.name)+(barHeight*2)-barPadding;} );

      if(!hasTicks){
        svg.selectAll(".tick").remove();
      }

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

function drawVarianceBar(result1,result2){
      let margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 40
      },
      width = 100 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom,
      //barHeight = (height-margin.top-margin.bottom*2)* 0.4/result.length,
      barPadding = (height-margin.top-margin.bottom*2)*0.6/result1.length;

      let xScale = d3.scaleLinear().range([0, width]);
      let yScale = d3.scaleBand().range([height, 0]).padding(0.3);
      
      let varianceBarData = [];
      varianceBarData = getVarianceData(result1,result2);
      
      let svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .style("border", "1px solid black")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

      xScale.domain(d3.extent(varianceBarData, function(d) { return d.value; })).nice();
      yScale.domain(varianceBarData.map(function(d) { return d.name; }));

      let xaxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom().scale(xScale)).call(g => g.select(".domain").remove());

      // remove x-axis labels.
      xaxis.selectAll("text").remove();

      //draw bars

      let barGroup =  svg.selectAll(".bar").data(varianceBarData).enter();

      let bar = barGroup.append("rect")
				.attr("class", function(d) { return "bar bar--" + (d.value < 0 ? "negative" : "positive"); })
				.attr("x", function(d) { return xScale(Math.min(0, d.value)); })
				.attr("y", function(d) { return yScale(d.name); })
				.attr("width", function(d) { return Math.abs(xScale(d.value) - xScale(0)); })
        .attr("height", yScale.bandwidth());
        
      let tickNeg = svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + xScale(0) + ",0)")
				.call(d3.axisLeft(yScale))
			  .selectAll(".tick")
			  .filter(function(d, i) { return varianceBarData[i].value < 0; });

      //y-axis line in the middle to accomodate negative values on left
		  tickNeg.select("line")
      .attr("x2", 6);
      
      //Remove y-axis ticks and labels
      svg.selectAll(".tick")
      .remove();
      
      //Add datalabels - positive values
      barGroup.filter(function(d) { return d.class != "negative" }).append("text")          
      .attr("class","datalabel")
      .attr("x", function(d) { return xScale(d.value) + 5; })
      .attr("y", function(d) { return yScale(d.name)+(yScale.bandwidth()/2)+3; })
      .text(function(d) { return ("+"+d.value);});

      //Add datalabels - negative values
      barGroup.filter(function(d) { return d.class === "negative" }).append("text")          
      .attr("class","datalabel")
      .attr("x", function(d) { return xScale(d.value) - 15; })
      .attr("y", function(d) { return yScale(d.name)+(yScale.bandwidth()/2)+3; })
      .text(function(d) { return (d.value);});
}

function drawVariancePercentage(result1,result2){
  let margin = {
    top: 20,
    right: 30,
    bottom: 30,
    left: 40
  },
  width = 200 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom,
  //barHeight = (height-margin.top-margin.bottom*2)* 0.4/result.length,
  barPadding = (height-margin.top-margin.bottom*2)*0.6/result1.length;

  let barRatio = 50;
  //let datalabelPadding  = 2;
  let varianceBarData = [];

  let xScale = d3.scaleLinear().range([0, width]);
  let yScale = d3.scaleBand().range([height, 0]).padding(0.3);
  
  varianceBarData = getVariancePercentageData(result1,result2);

  // let minVal = getMinY(varianceBarData);
  
  // updateClassForLongerBars(minVal,barRatio, varianceBarData);
  
  let svg = d3.select("#chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .style("border", "1px solid black")
  .attr("class","svg_variance")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

  xScale.domain([-50,100]).nice();
  yScale.domain(varianceBarData.map(function(d) { return d.name; }));

  let xaxis = svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom().scale(xScale)).call(g => g.select(".domain").remove());

  // remove x-axis labels.
  xaxis.selectAll("text").remove();

  //draw bars
  let barGroup =  svg.selectAll(".bar").data(varianceBarData).enter();

  let barHeight = yScale.bandwidth()/4;
  let squareWidthHeight = 8; //Calculate Square width & height according to the bar height. Hard coded for now.
  squareWidthHeight = barHeight.toFixed(0)*2;
  // Draw Square Tip of the Bar first, so that the bar overlays on top of this.
  let squareTip = barGroup.append("rect")
    .attr("x", function(d) { return xScale(d.value)-(squareWidthHeight/2); })
    .attr("y", function(d){ return yScale(d.name)-(squareWidthHeight/4);})
    .attr("width", 8)
    .attr("height", 8)
    .style("fill", "black");

  //draw circle at the tip of the bar.
  /* let circle1 = barGroup.append("circle")
                .attr("cx", function(d) { return xScale(d.value); })
                .attr("cy", function(d){ return yScale(d.name)+(yScale.bandwidth()/8);})
                .attr("r", 3)
                .style("fill", "black"); */

  //barGroup.filter(function(d) { return d.class != "longerBar" }).append("rect") 
  let bar = barGroup.append("rect")      
    .attr("class", function(d) { return "bar bar--" + (d.value < 0 ? "negative" : "positive"); })
    .attr("x", function(d) { return xScale(Math.min(0, d.value)); })
    .attr("y", function(d) { return yScale(d.name); })
    .attr("width", function(d) { return Math.abs(xScale(d.value) - xScale(0)); })
    .attr("height", yScale.bandwidth()/4);

    // barGroup.filter(function(d) { return d.class === "longerBar" }).append("rect")      
    // .attr("class", function(d) { return "bar bar--" + (d.value < 0 ? "negative" : "positive"); })
    // .attr("x", function(d) { return xScale(Math.min(0, d.value)); })
    // .attr("y", function(d) { return yScale(d.name); })
    // .attr("width", function(d) { return Math.abs(xScale(minVal*barRatio) - xScale(0)); })
    // .attr("height", yScale.bandwidth()/4);
    
  let tickNeg = svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + xScale(0) + ",0)")
    .call(d3.axisLeft(yScale))
    .selectAll(".tick")
    .filter(function(d, i) { return varianceBarData[i].value < 0; });

  //y-axis line in the middle to accomodate negative values on left
  tickNeg.select("line")
  .attr("x2", 6);
  
  //Remove y-axis ticks and labels
  svg.selectAll(".tick")
  .remove();
  
  //let posPercentFormat = d3.format("+,%");
  //Add datalabels - positive values
  barGroup.filter(function(d) { return d.class != "negative" }).append("text")          
  .attr("class","datalabel-pos")
  .attr("x", function(d) {
        let xsc = xScale(d.value);
        console.log("x("+d.value+") = "+xsc);
        return xsc;
      })
  .attr("y", function(d) { 
            return yScale(d.name) + yScale.bandwidth()/4; })
            //.attr("dy", ".35em")  
  .text(function(d) {
            console.log("text length : " +this.getComputedTextLength());
            return ("+"+d.value+"%");});
  //.text(function(d) { return (posPercentFormat(d.value));});

  //Add datalabels - negative values
  barGroup.filter(function(d) { return d.class === "negative" }).append("text")          
  .attr("class","datalabel-neg")
  .attr("x", function(d) { return xScale(d.value) - 15; })
  .attr("y", function(d) { return yScale(d.name) + yScale.bandwidth()/4; })
  .text(function(d) { return (d.value);});

  
}

function getBarData(res1,res2){
  let barData = [];
  barData[0] = [];
  barData[1] = [];
  res1.forEach((elem,i)=>{
    let barObj = {};
      barObj.name = elem.name;
      barObj.measure = elem.measure;
      barObj.value = elem.end - elem.start;
      barObj.class = elem.class;
      barData[0].push(barObj);
  });
  res2.forEach((elem,i)=>{
    let barObj = {};
      barObj.name = elem.name;
      barObj.measure = elem.measure;
      barObj.value = elem.end - elem.start;
      barObj.class = elem.class;
      barData[1].push(barObj);
});
return barData;
}

function getVarianceData(result1,result2){
  let varianceBarData = [];
  result1.forEach((element,index) => {
    varianceBarData[index] = {};
    varianceBarData[index].value = Math.abs(result2[index].start-result2[index].end) - Math.abs(result1[index].start-result1[index].end);
    varianceBarData[index].name = result1[index].name;
    varianceBarData[index].class = varianceBarData[index].value > 0 ? "positive" : "negative";
  });

  return varianceBarData;
}

function getVariancePercentageData(result1,result2){
  let varianceBarData = [];
  // Relative Variance = ((V2/V1)-1)*100
  result1.forEach((element,index) => {
    varianceBarData[index] = {};
    let percentageValue = 0;
    percentageValue = (Math.abs(result2[index].start-result2[index].end) / Math.abs(result1[index].start-result1[index].end))-1;
    varianceBarData[index].value = (percentageValue*100).toFixed(0);
    //varianceBarData[index].value = (Math.abs(result2[index].start-result2[index].end) / Math.abs(result1[index].start-result1[index].end))-1;
    varianceBarData[index].name = result1[index].name;
    varianceBarData[index].class = varianceBarData[index].value > 0 ? "positive" : "negative";
  });

  return varianceBarData;
}

function getMinY(data) {
  return data.reduce((min, p) => Math.abs(p.value) < Math.abs(min) ? Math.abs(p.value) : Math.abs(min), Math.abs(data[0].value));
}
function getMaxY() {
  return data.reduce((max, p) => p.y > max ? p.y : max, data[0].y);
}

function updateClassForLongerBars(minVal , barRatio , barData){
  barData.forEach(data=>{
      if((data.value/minVal)>barRatio){
        barData.class  = barData.class + "  longerBar";
      }
  });
  return barData;
}