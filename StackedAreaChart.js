

export default function StackedAreaChart(container) {
	// initialization
    var margin = {top: 20, right: 10, bottom: 100, left: 60},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

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

    
    const tooltip = svg
       .append("text")

    //let xDomain, data; // -- (1)
    let selected = null, xDomain, data;

    
    const zoom = d3.zoom()
        .extent([[0,0], [width,height]])
        .on('zoom', zoomed);

    svg.append("g").attr('class', 'zoom').call(zoom);

    function zoomed({transform}){
        const copy = xScale.copy().domain(
            d3.extent(data, d => d.date)
        );
        console.log(copy);
        const rescaled = transform.rescaleX(copy);
        xDomain = rescaled.domain();
        update(xDomain);
    }

	function update(_data){

        data = _data; // -- (2)

        const keys= selected? [selected]: data.columns.slice(1);

        //xDomain
          //  ? xScale.domain(xDomain)
            //: xScale.domain(d3.extent(data, d => new Date(d.date))) ;

        xScale.domain(xDomain? xDomain: d3.extent(data, d => new Date(d.date)));
        
        var category = new Set();
        for(const [key, value] of Object.entries(data[0])){
            if (`${key}`!='date' && `${key}`!='total'){
                category.add(key);
            }
        };
        var categoryStack = Array.from(category);

        colorScale.domain(categoryStack)
        //colorScale.domain(data.columns.slice(1));

        const stackedData = d3.stack()
            .keys(data.columns.slice(1))
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone)
            (data);

        yScale.domain([0,d3.max(stackedData, d=>d3.max(d,d=>d[1]))])

        var area = d3.area()
            .x(d=>xScale(d.data.date))
            .y0(function(d) {
                return yScale(d[0]);
            })
            .y1(function(d) {
                return yScale(d[1]);
            })
            
        const areas = svg.selectAll("area")
            .data(stackedData, d => d.key);
        console.log(stackedData);
        
        
        areas.enter() // or you could use join()
            .append("path")
            .attr("clip-path", "url(#clip)")
            .merge(areas)
            .attr('d',area)
            .attr('fill',function(d){
                return colorScale(d.key);
            })
            .on("mouseover", (event, d, i) => tooltip.text(d.key))
            .on("mouseout", (event, d, i) => tooltip.text(" "))
            .on("click", (event, d) => {
                // toggle selected based on d.key
                if (selected === d.key) {
              selected = null;
            } else {
                selected = d.key;
            }
            update(data); // simply update the chart again
        });

        //FIX THE areas.enter!! 
        
        areas.exit().remove();



        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)// the size of clip-path is the same as
            .attr("height", height); // the chart area

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
    }

    function filterByDate(range){
		xDomain = range;  // -- (3)
		update(data); // -- (4)
	}
	return {
        update,
        filterByDate
	}
}