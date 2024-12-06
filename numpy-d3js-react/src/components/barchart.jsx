import * as d3 from "d3";
import { useEffect, useRef } from "react";

const Barchart = () => {
  const ref = useRef();

  useEffect(() => {
    const margin = { top: 30, right: 30, bottom: 70, left: 60 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const url = "/data.json";

    d3.json(url)
      .then((data) => {
        const counts = d3.rollup(
          data,
          (v) => v.length,
          (d) => d["Q2.4"]
        );

        const excludeCategories = [
          "What language do you prefer to use?",
          "ImportId:QID98",
        ];

        const processedData = Array.from(counts, ([key, value]) => ({
          language: key,
          count: value,
        })).filter((d) => !excludeCategories.includes(d.language));

        console.log(processedData);

        const x = d3
          .scaleBand()
          .domain(processedData.map((d) => d.language))
          .range([0, width])
          .padding(0.2);

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(processedData, (d) => d.count)])
          .nice()
          .range([height, 0]);

        svg
          .append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");

        svg.append("g").call(d3.axisLeft(y));

        svg
          .selectAll("rect")
          .data(processedData)
          .join("rect")
          .attr("x", (d) => x(d.language))
          .attr("y", (d) => y(d.count))
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - y(d.count))
          .attr("fill", "#5f0f40");
      })
      .catch((error) => {
        console.error("Error cargando los datos:", error);
      });
  }, []);

  return <div ref={ref} />;
};

export default Barchart;


