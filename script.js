const url = 'data.json'

//Test that the data displays correctly
/*
d3.json(url).then(data => {
    console.log(data);
    
    data.forEach(d => {
        console.log(d);
    });
}).catch(error => {
    console.error('An error ocurred when loading the JSON file: ', error);
})
*/

//Filtering and mapping relevant information
d3.json(url).then(data => {
    const ages = data.map(d => +d["Q2.2"]).filter(d => !isNaN(d));
    const genders = data.map(d => d["Q2.3"]).filter(d => d && d !== "What is your gender?" && d !== '{"ImportId":"QID97"}');
    const educationLevels = data
    .map(d => d["Q2.7"])
    .filter(d => d && d !== "What is the highest degree or level of education you have completed? - Selected Choice" && d !== '{"ImportId":"QID128"}');
    const experienceLevels = data.map(d => d["Q2.13"]).filter(d => d);
    const frequencyLevels = data.map(d => d["Q2.14"]).filter(d => d && d !== "How often do you use NumPy?" && !d.includes("ImportId"));

    //Calling functions to visualize data
    createBarChartAges(ages, "#chart1");
    createPieChartGenders(genders, "#chart2");
    createBarChartEducation(educationLevels, "#chart3");
    createPieChartExperience(experienceLevels, "#chart4");
    createBarChartFrequency(frequencyLevels, "#chart5");
}).catch(error => console.error('An error ocurred when loading the JSON file: ', error));

function createBarChartAges(ages, container) {
    const width = 500;
    const height = 300;
    const margin = { top: 40, right: 20, bottom: 30, left: 40 };

    const ageCounts = d3.rollups(ages, v => v.length, d => {
        if (d < 20) return 'Below 20';
        else if (d < 30) return '20-29';
        else if (d < 40) return '30-39';
        else if (d < 50) return '40-49';
        else return '50+';
    }).sort((a, b) => {
        const ageOrder = ['Below 20', '20-29', '30-39', '40-49', '50+'];
        return ageOrder.indexOf(a[0]) - ageOrder.indexOf(b[0]);
    });

    const svg = d3.select(container).append("svg")
                  .attr("width", width)
                  .attr("height", height);

    svg.append("text")
       .attr("x", width / 2)
       .attr("y", margin.top / 2)
       .attr("text-anchor", "middle")
       .style("font-size", "16px")
       .style("font-weight", "bold")
       .text("Age");

    const x = d3.scaleBand()
                .domain(ageCounts.map(d => d[0]))
                .range([margin.left, width - margin.right])
                .padding(0.1);

    const y = d3.scaleLinear()
                .domain([0, d3.max(ageCounts, d => d[1])]).nice()
                .range([height - margin.bottom, margin.top]);

    svg.append("g")
       .selectAll("rect")
       .data(ageCounts)
       .enter()
       .append("rect")
       .attr("x", d => x(d[0]))
       .attr("y", y(0))
       .attr("height", 0)
       .attr("width", x.bandwidth())
       .attr("fill", "steelblue")
       .transition()
       .duration(1000)
       .attr("y", d => y(d[1]))
       .attr("height", d => y(0) - y(d[1]));

    svg.append("g")
       .attr("transform", `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(x));

    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(y));
}


function createPieChartGenders(genders, container) {
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const genderCounts = d3.rollups(genders, v => v.length, d => d);

    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height + 50)  // Espacio extra solo para la leyenda
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2 + 20})`);

    d3.select(container).select("svg").append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Gender");

    const color = d3.scaleOrdinal()
        .domain(genderCounts.map(d => d[0]))
        .range(d3.schemeCategory10);

    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const outerArc = d3.arc().innerRadius(radius * 1.1).outerRadius(radius * 1.1);

    const arcs = svg.selectAll("arc")
        .data(pie(genderCounts))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data[0]));

    arcs.append("text")
        .attr("transform", d => {
            const pos = outerArc.centroid(d);
            const scale = genderCounts.length > 5 ? 1.3 : 1.2;
            pos[0] *= scale;
            pos[1] *= scale;
            return `translate(${pos})`;
        })
        .attr("text-anchor", d => d.endAngle > Math.PI ? 'end' : 'start')
        .style("font-size", "12px")
        .text(d => `${d.data[0]}: ${d.data[1]}`);

    const legend = d3.select(container).append('div')
        .style('position', 'relative')
        .style('font-size', '12px')
        .style('font-family', 'Arial, sans-serif')
        .style('margin-top', '20px');

    genderCounts.forEach(d => {
        legend.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('margin-bottom', '5px')
            .html(`
                <div style="width: 12px; height: 12px; background-color: ${color(d[0])}; margin-right: 8px;"></div>
                <div>${d[0]}: ${d[1]}</div>
            `);
    });
}


function createBarChartEducation(educationLevels, container) {
    const width = 800;
    const height = 500;
    const margin = {top: 20, right: 20, bottom: 200, left: 50};

    const educationCounts = d3.rollups(educationLevels, v => v.length, d => d);

    const normalizedEducationCounts = educationCounts.map(([label, count]) => {
        const normalizedLabel = label.replace(/\(.*\)/, '').trim();
        return [normalizedLabel, count];
    });

    const educationOrder = [
        "Less than a high school diploma",
        "High school degree or equivalent",
        "Bachelor's degree or equivalent",
        "Master's degree",
        "Doctorate",
        "Other"
    ];

    const sortedEducationCounts = normalizedEducationCounts.sort((a, b) => {
        return educationOrder.indexOf(a[0]) - educationOrder.indexOf(b[0]);
    });

    console.log("Sorted Education Counts:", sortedEducationCounts);

    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .domain(sortedEducationCounts.map(d => d[0]))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(sortedEducationCounts, d => d[1])]).nice()
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .selectAll("rect")
        .data(sortedEducationCounts)
        .join("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(0) - y(d[1]))
        .attr("width", x.bandwidth())
        .attr("fill", "teal");

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}




function createPieChartExperience(experienceLevels, container) {
    const experienceCounts = {};
    experienceLevels.forEach(level => {
        experienceCounts[level] = (experienceCounts[level] || 0) + 1;
    });

    const pieData = Object.entries(experienceCounts).map(([key, value]) => ({ label: key, count: value }));

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select(container)
                  .append('svg')
                  .attr('width', width)
                  .attr('height', height)
                  .append('g')
                  .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie()
                  .value(d => d.count);

    const arc = d3.arc()
                  .innerRadius(0)
                  .outerRadius(radius);

    const arcs = svg.selectAll('.arc')
                    .data(pie(pieData))
                    .enter()
                    .append('g')
                    .attr('class', 'arc');

    arcs.append('path')
        .attr('fill', d => color(d.data.label))
        .transition()
        .duration(1000)
        .attrTween('d', function(d) {
            const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function(t) {
                return arc(i(t));
            };
        });

    arcs.append('text')
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'black')
        .transition()
        .delay(1000)
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .text(d => `${d.data.label}: ${d.data.count}`);
}


function createBarChartFrequency(frequencyLevels, container) {
    const frequencyCounts = {};
    frequencyLevels.forEach(level => {
        frequencyCounts[level] = (frequencyCounts[level] || 0) + 1;
    });

    const barData = Object.entries(frequencyCounts)
        .map(([key, value]) => ({ label: key, count: value }))
        .filter(d => d.label !== "Yearly");

    const frequencyOrder = ["Daily", "Weekly", "Monthly", "Less frequently"];
    barData.sort((a, b) => frequencyOrder.indexOf(a.label) - frequencyOrder.indexOf(b.label));

    const width = 500;
    const height = 300;
    const margin = { top: 40, right: 20, bottom: 30, left: 40 };

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append("text")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("How often do you use NumPy?");

    const x = d3.scaleBand()
        .domain(barData.map(d => d.label))
        .range([0, width - margin.left - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.count)])
        .nice()
        .range([height - margin.top - margin.bottom, 0]);

    svg.selectAll('.bar')
        .data(barData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.label))
        .attr('y', height - margin.top - margin.bottom)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', 'steelblue')
        .transition()
        .duration(1000)
        .attr('y', d => y(d.count))
        .attr('height', d => y(0) - y(d.count));

    svg.selectAll('.label')
        .data(barData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.label) + x.bandwidth() / 2)
        .attr('y', height - margin.top - margin.bottom)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'black')
        .text(d => d.count)
        .transition() 
        .duration(1000)
        .attr('y', d => y(d.count) - 5);

    svg.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y));
}
