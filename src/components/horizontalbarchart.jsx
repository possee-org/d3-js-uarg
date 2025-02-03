import * as d3 from "d3";
import { useEffect, useRef } from "react";

const HorizontalBarchartRTL = ({ question }) => {
  const ref = useRef();

  useEffect(() => {
    const margin = { top: 30, right: 600, bottom: 30, left: 30 },
      width = 1200 - margin.left - margin.right,
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
        const filteredData = data.slice(2);

        const counts = d3.rollup(
          filteredData,
          (v) => v.length,
          (d) => d[question]
        );

        const totalResponses = d3.sum(Array.from(counts.values()));

        const processedData = Array.from(counts, ([key, value]) => ({
          language: key,
          percentage: ((value / totalResponses) * 100).toFixed(1),
        }))
          .filter(
            (d) =>
              d.language &&
              !d.language.includes("ImportId") &&
              d.language !== question
          )
          .sort((a, b) => b.percentage - a.percentage);

        const maxPercentage = Math.max(...processedData.map((d) => d.percentage));

        const x = d3
          .scaleLinear()
          .domain([0, 100])
          .nice()
          .range([width, 0]);

        const y = d3
          .scaleBand()
          .domain(processedData.map((d) => d.language))
          .range([0, height])
          .padding(0.2);

        const bars = svg
          .selectAll("rect")
          .data(processedData)
          .join("rect")
          .attr("y", (d) => y(d.language))
          .attr("x", (d) => x(d.percentage))
          .attr("height", y.bandwidth())
          .attr("width", (d) => width - x(d.percentage))
          .attr("fill", (d) =>
            d.percentage === maxPercentage ? "#3FABCF" : "#C0C0C0"
          );

        svg
          .selectAll(".percentage-label")
          .data(processedData)
          .join("text")
          .attr("class", "percentage-label")
          .attr("x", (d) => x(d.percentage) - 10)
          .attr("y", (d) => y(d.language) + y.bandwidth() / 2 + 4)
          .style("text-anchor", "end")
          .style("fill", "#000")
          .text((d) => `${d.percentage}%`);

        svg
          .selectAll(".category-label")
          .data(processedData)
          .join("text")
          .attr("class", "category-label")
          .attr("x", width + 40)
          .attr("y", (d) => y(d.language) + y.bandwidth() / 2 + 4)
          .style("text-anchor", "start")
          .style("fill", "#000")
          .text((d) => d.language);

        svg
          .append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x).ticks(10).tickFormat((d) => `${d}%`));

        svg
          .append("g")
          .call(d3.axisLeft(y).tickSize(0))
          .selectAll("text")
          .remove();

        bars
          .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "#013243");
            d3.selectAll(".percentage-label")
              .filter((label) => label.language === d.language)
              .style("fill", "#013243");
            d3.selectAll(".category-label")
              .filter((label) => label.textContent === d.language)
              .style("fill", "#013243");
          })
          .on("mouseout", function (event, d) {
            d3.select(this).attr("fill", (d) =>
              d.percentage === maxPercentage ? "#3FABCF" : "#C0C0C0"
            );
            d3.selectAll(".percentage-label")
              .filter((label) => label.language === d.language)
              .style("fill", "#000");
            d3.selectAll(".category-label")
              .filter((label) => label.textContent === d.language)
              .style("fill", "#000");
          });
      })
      .catch((error) => {
        console.error("Error cargando los datos:", error);
      });
  }, [question]);

  return <div ref={ref} />;
};

export default HorizontalBarchartRTL;




