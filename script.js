import AreaChart from './AreaChart.js';
import StackedAreaChart from './StackedAreaChart.js';


let unemploy;
d3.csv('unemployment.csv', d3.autoType).then(data=>{
    unemploy=data;
    for (var i in unemploy){
        var totalval=0;
        for (const [key, value] of Object.entries(unemploy[i])){
            //console.log(`${value}`);
            if (`${key}`!='date'){
                //console.log(`${value}`);
                totalval=totalval+ parseInt(`${value}`);
            }
        }
        unemploy[i].total = totalval;
    }

    //console.log(unemploy);
    const areaChart1 = AreaChart(".chart-container2"); 
    areaChart1.update(unemploy);  
    const stackChart1= StackedAreaChart(".chart-container1");
    stackChart1.update(unemploy);
    areaChart1.on("brushed", (range)=>{
        stackChart1.filterByDate(range);
    })
    stackChart1.on("zoom", (timeRange)=>{
        areaChart1.setBrush(timeRange);
    });
   
})
