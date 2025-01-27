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
          .scaleBand()
          .domain(processedData.map((d) => d.language))
          .range([0, width])
          .padding(0.2);

        const y = d3
          .scaleLinear()
          .domain([0, 100])
          .nice()
          .range([height, 0]);

        svg
          .append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end")
          .style("fill", "#C0C0C0")
          .attr("class", "x-axis-label");

        svg.append("g").call(d3.axisLeft(y).ticks(10).tickFormat((d) => `${d}%`));

        const bars = svg
          .selectAll("rect")
          .data(processedData)
          .join("rect")
          .attr("x", (d) => x(d.language))
          .attr("y", (d) => y(d.percentage))
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - y(d.percentage))
          .attr("fill", (d) => (d.percentage == maxPercentage ? "#3FABCF" : "#C0C0C0"))
          .attr("class", "bar");

        const labels = svg
          .selectAll(".label")
          .data(processedData)
          .join("text")
          .attr("class", "label")
          .attr("x", (d) => x(d.language) + x.bandwidth() / 2)
          .attr("y", (d) => y(d.percentage) - 5)
          .attr("text-anchor", "middle")
          .style("fill", (d) =>
            d.percentage == maxPercentage ? "#3FABCF" : "#C0C0C0"
          )
          .text((d) => `${d.percentage}%`);

        bars
          .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "#013243");
            d3.selectAll(".label")
              .filter((label) => label.language === d.language)
              .style("fill", "#013243");
            d3.selectAll(".x-axis-label")
              .filter(function () {
                return d3.select(this).text() === d.language;
              })
              .style("fill", "#013243");
          })
          .on("mouseout", function (event, d) {
            d3.select(this).attr("fill", (d) =>
              d.percentage == maxPercentage ? "#3FABCF" : "#C0C0C0"
            );
            d3.selectAll(".label")
              .filter((label) => label.language === d.language)
              .style("fill", (label) =>
                label.percentage == maxPercentage ? "#3FABCF" : "#C0C0C0"
              );
            d3.selectAll(".x-axis-label")
              .filter(function () {
                return d3.select(this).text() === d.language;
              })
              .style("fill", "#C0C0C0");
          });
      })
      .catch((error) => {
        console.error("Error cargando los datos:", error);
      });
  }, [question]);

  return <div ref={ref} />;
};

export default Barchart;













