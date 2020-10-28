

export default function AreaChart(container){

    // initialization
    var margin = {top: 10, right: 10, bottom: 100, left: 60},
    width = 960 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate('+margin.left+','+margin.top+')')
    
    const xScale = d3.scaleTime()
        .range([0, width])
    
    const yScale = d3.scaleLinear()
        .rangeRound([height,0])


    svg.append('g')
        .attr('class', 'x-axis')
        .attr("transform", `translate(0, ${height})`)
    
    
    svg.append('g')
        .attr('class', 'y-axis')
    
    svg.append('text')
        .attr('x',width-55)
        .attr('y',height+30)
        .attr('class', 'x-axis-title');
    
    svg.append('text')
        .attr('x',-105)
        .attr('y',-50)
        .attr('class', 'y-axis-title')
        .attr("transform", "rotate(-90)");

    svg.selectAll('path')
        .attr('class', 'path')

    const brush = d3.brushX()
        .extent([[0,0], [width,height]])
        .on('brush', brushed)
        .on('end',brushended);
 
    svg.append("g").attr('class', 'brush').call(brush);
  
    const listeners = { brushed: null };

    function brushed(event) {
        if (event.selection) {
          console.log('brushed', event.selection);
          listeners['brushed'](event.selection.map(d=>xScale.invert(d)));
        }
      }

      function brushended(event) {
        if (!event.selection) {
          console.log('brushed', event.selection);
          listeners['brushed']([xScale.invert(0), xScale.invert(width)]);
        }
      }

	function update(data){ 

        // update scales, encodings, axes (use the total count)
        xScale.domain(d3.extent(data, d => d.date))
        yScale.domain([0,d3.max(data,d=>d.total)])

    const xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(10);

    const yAxis = d3.axisLeft()
        .scale(yScale);
    
    svg.select('.x-axis')
        .call(xAxis);
    
    svg.select('.y-axis')
        .call(yAxis);
    
    svg.select('.x-axis-title')
        .text('Date');

    svg.select('.y-axis-title')
        .text('Unemployment');


    const series = d3.stack()
        .keys(data.columns.slice(1))
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone)
        (data);

    var area = d3.area()
        .x(d=>xScale(d.date))
        .y0(d=> yScale(0))
        .y1(d=> yScale(d.total))
        
        
        svg.append("path")
            .datum(data)
            .attr('class','path')
            .attr("fill", 'blue')
            .attr('d',area);


    }
    function setBrush(timeRange){
        timeRange.map(xScale);
        svg.select(".brush");
        brush.move(timeRange)
        
    }
    function on(event, listener) {
        listeners[event] = listener;

  }
	return {
        update, // ES6 shorthand for "update": update
        on
	};
}