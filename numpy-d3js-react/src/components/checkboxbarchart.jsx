import * as d3 from "d3";
import { useEffect, useRef } from "react";

const CheckboxBarchart = ({ question }) => {
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
        // Ignorar las primeras dos respuestas
        const filteredData = data.slice(2);

        // Paso 1: Contar selecciones por categoría
        const counts = {};

        filteredData.forEach((entry) => {
          const responses = entry[question];
          if (responses) {
            const categories = responses.split(",").map((item) => item.trim());
            categories.forEach((category) => {
              if (category && category !== "ImportId") {
                counts[category] = (counts[category] || 0) + 1;
              }
            });
          }
        });

        // Paso 2: Convertir a un array procesado
        const processedData = Object.entries(counts)
          .map(([key, value]) => ({ category: key, count: value }))
          .sort((a, b) => b.count - a.count);

        // Escalas
        const x = d3
          .scaleBand()
          .domain(processedData.map((d) => d.category))
          .range([0, width])
          .padding(0.2);

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(processedData, (d) => d.count)])
          .nice()
          .range([height, 0]);

        // Ejes
        svg
          .append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");

        svg.append("g").call(d3.axisLeft(y));

        // Barras
        const bars = svg
          .selectAll("rect")
          .data(processedData)
          .join("rect")
          .attr("x", (d) => x(d.category))
          .attr("y", (d) => y(d.count))
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - y(d.count))
          .attr("fill", "#5f0f40");

        // Etiquetas
        const labels = svg
          .selectAll(".label")
          .data(processedData)
          .join("text")
          .attr("class", "label")
          .attr("x", (d) => x(d.category) + x.bandwidth() / 2)
          .attr("y", (d) => y(d.count) - 5)
          .attr("text-anchor", "middle")
          .style("fill", "black")
          .style("opacity", 0)
          .text((d) => d.count);

        // Interacciones
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

export default CheckboxBarchart;

