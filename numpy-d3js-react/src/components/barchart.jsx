import * as d3 from "d3";
import { useEffect, useRef } from "react";

const Barchart = ({ question }) => {
  const ref = useRef();

  useEffect(() => {
    const margin = { top: 30, right: 30, bottom: 70, left: 60 },
      width = 800 - margin.left - margin.right,
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
          (d) => d[question]
        );

        const processedData = Array.from(counts, ([key, value]) => ({
          language: key,
          count: value,
        }))
          .filter(
            (d) =>
              d.language &&
              !d.language.includes("ImportId") &&
              d.language !== question
          )
          .sort((a, b) => b.count - a.count);

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

        const bars = svg
          .selectAll("rect")
          .data(processedData)
          .join("rect")
          .attr("x", (d) => x(d.language))
          .attr("y", (d) => y(d.count))
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - y(d.count))
          .attr("fill", "#5f0f40");

        const labels = svg
          .selectAll(".label")
          .data(processedData)
          .join("text")
          .attr("class", "label")
          .attr("x", (d) => x(d.language) + x.bandwidth() / 2)
          .attr("y", (d) => y(d.count) - 5)
          .attr("text-anchor", "middle")
          .style("fill", "black")
          .style("opacity", 0)
          .text((d) => d.count);

        bars
          .on("mouseover", () => {
            bars.attr("fill", "#ff6f61");
            labels.style("opacity", 1);
          })
          .on("mouseout", () => {
            bars.attr("fill", "#5f0f40");
            labels.style("opacity", 0);
          });
      })
      .catch((error) => {
        console.error("Error cargando los datos:", error);
      });
  }, [question]);

  return <div ref={ref} />;
};

export default Barchart;








