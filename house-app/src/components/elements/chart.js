// /* App.js */
// import React, { Component, useEffect, useRef } from 'react';
// import CanvasJSReact from '@canvasjs/react-charts';
// //var CanvasJSReact = require('@canvasjs/react-charts');

// var CanvasJS = CanvasJSReact.CanvasJS;
// var CanvasJSChart = CanvasJSReact.CanvasJSChart;
// export default function SplineChart({ data }) {
//        const chartRef = useRef(null);

//     useEffect(() => {
//         // коли оновлюються дані, примусово перерендерюй графік
//         if (chartRef.current) {
//             chartRef.current.render();
//         }
//     }, [data]);
//     const options = {
//         animationEnabled: true,
//         title: {
//             text: "Monthly Sales - 2017"
//         },
//         toolTip: {
//             shared: true,
//             content: "{x}: {y} °C"
//         },
//         axisX: {
//             valueFormatString: "HH:mm",
//             intervalType: "hour",
//             interval: 4,
//         },
//         axisY: {
//             valueFormatString: "#.##"
//         },
//         data: [{
//             yValueFormatString: "#.##",
//             xValueFormatString: "DD MMMM",
//             type: "spline",
//             dataPoints: data
//             //          [
//             //   { x: new Date(2024, 0, 1), y: 20 },
//             //   { x: new Date(2024, 0, 2), y: 25 },
//             //   { x: new Date(2024, 0, 3), y: 22 }
//             // ]
//             // [
//             //     { x: new Date(2017, 0), y: 25060 },
//             //     { x: new Date(2017, 1), y: 27980 },
//             //     { x: new Date(2017, 2), y: 42800 },
//             //     { x: new Date(2017, 3), y: 32400 },
//             //     { x: new Date(2017, 4), y: 35260 },
//             //     { x: new Date(2017, 5), y: 33900 },
//             //     { x: new Date(2017, 6), y: 40000 },
//             //     { x: new Date(2017, 7), y: 52500 },
//             //     { x: new Date(2017, 8), y: 32300 },
//             //     { x: new Date(2017, 9), y: 42000 },
//             //     { x: new Date(2017, 10), y: 37160 },
//             //     { x: new Date(2017, 11), y: 38400 }
//             // ]
//         }]
//     }
//     return (
//         <div>
//              <CanvasJSChart options={options} onRef={(ref) => (chartRef.current = ref)} />
//             {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
//         </div>
//     );
// }                         

import { useEffect, useMemo, useRef, useState } from "react";
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer, ReferenceLine } from "recharts";
import { colors } from "../../assets/colors";
import styled from "styled-components";
import { Headline2, Headline3 } from "../typography";

export default function SplineChart({ data, chartId, headline }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollLeft = container.scrollWidth; // автоматичний скрол до кінця
    }
  }, [data]);

  const minTickGap = width < 400 ? 60 : width < 600 ? 50 : 30;

  // 🔹 Визначення початку нових днів (для ReferenceLine)
  const dateChangePoints = useMemo(() => {
    const changes = [];
    for (let i = 1; i < data.length; i++) {
      const prevDate = new Date(data[i - 1].x).toDateString();
      const currDate = new Date(data[i].x).toDateString();
      if (prevDate !== currDate) {
        changes.push(data[i].x);
      }
    }
    return changes;
  }, [data]);

  
  const formatXAxis = (tick, index) => {
    const date = new Date(tick);
    const prevDate = new Date(data[index - 1]?.x);
    const currDay = date.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });
    const hour = date.getHours().toString().padStart(2, "0").split(':');
    const prevHour = prevDate.getHours().toString().padStart(2, "0").split(':');

    if (Number.parseInt(hour[0]) === Number.parseInt(prevHour[0])) {
      return "";
    }
    else {
      return `${hour}:00`;
    }
  };

  const formatTooltipLabel = (value) => {
    const date = new Date(value);
    return date.toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleScroll = (e) => {
    const chartRoot = scrollRef.current?.querySelector(`#${chartId}`);
    if (!chartRoot) return;

    const wrapper = chartRoot.querySelector(".recharts-surface");
    const graphWrapper = chartRoot.querySelector(".graph-wrapper");
    const allAxis = chartRoot.querySelectorAll(".recharts-yAxis");
    const xAxis = chartRoot.querySelector(".recharts-xAxis");
    const xAxisHeight = xAxis?.getBoundingClientRect().height ?? 0;

    allAxis?.forEach((axis) => {
      const orientation = axis
        .querySelector(".recharts-cartesian-axis-tick-line")
        ?.getAttribute("orientation");

      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      const yAxisheight = axis.getBoundingClientRect().height;
      const yAxisWidth = axis.getBoundingClientRect().width;

      rect.setAttribute("x", "0");
      rect.setAttribute("y", "0");
      rect.setAttribute("width", yAxisWidth);
      rect.setAttribute("height", yAxisheight + xAxisHeight);
      rect.setAttribute("fill", colors.light);
      rect.setAttribute("class", `y-axis-rect-${orientation}`);
      axis.insertBefore(rect, axis.firstChild);

      const position =
        orientation === "left"
          ? e.target.scrollLeft
          : e.target.scrollLeft -
          wrapper?.clientWidth +
          graphWrapper?.clientWidth;

      axis.style.transform = `translateX(${position}px)`;
    });
  };

  return (
    <ChartBlock>
      <Headline3>{headline}</Headline3>
      <ScrollDiv ref={scrollRef} style={{ overflowX: "auto" }} onScroll={handleScroll}>
        <div id={chartId} style={{ width: `${data.length * 40}px`, minWidth: "50%" }}>
          <ResponsiveContainer width={"100%"} height={300}>
            <LineChart
              key={data.length > 0 ? data[0].x : "empty"}
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              {/* 🔹 Лінія з анімацією */}
              <Line
                type="monotone"
                dataKey="y"
                stroke={colors.main}
                activeDot={{ r: 5 }}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />

              <CartesianGrid strokeDasharray="3 3" stroke={colors["light-green"]} />

              {/* 🔹 Вісь X */}
              <XAxis
                dataKey="x"
                tickFormatter={formatXAxis}
                padding={{ left: 10, right: 10 }}
                interval="preserveStartEnd" // розумна оптимізація від Recharts
                // .recharts-cartesian-axis-tick
                minTickGap={-5} // уникаємо накладання
                fontSize={11} fontFamily={"eUkraine-Regular"}
                stroke={colors.additional}
              />
              <YAxis label={{ fill: colors.light }} tickFormatter={(value) => { return `${value}${chartId.includes("temperature") ? "°C" : "%"}` }} dataKey="y" stroke={colors.additional} position="outsideLeft"
                fontSize={12} fontFamily={"eUkraine-Regular"} fill={`${colors.light}`} />

              <Tooltip labelFormatter={formatTooltipLabel} />
              {/* <Legend /> */}

              {/* 🔹 Вертикальні лінії — нові дні */}
              {dateChangePoints.map((point, index) => (
                <ReferenceLine
                  key={index}
                  x={point}
                  stroke={colors.additional}
                  strokeDasharray="3 3"
                  label={{
                    value: new Date(point).toLocaleDateString("uk-UA", {
                      day: "2-digit",
                      month: "2-digit",
                    }),
                    position: "top",
                    fill: colors.additional,
                    fontSize: 13,
                    fontFamily: "eUkraine-Bold",
                    dy: -5.5
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ScrollDiv>
    </ChartBlock>
  );
}

const ChartBlock = styled.div`
${Headline3} {
  color: ${colors.main};
  padding-left: 16px;
}
border: 1px solid ${colors["light-green"]};
padding: 16px;
padding-top: 24px;
border-radius: 30px;
width: 48%;
`

const ScrollDiv = styled.div`
margin: 16px;
&::-webkit-scrollbar {
  height: 8px;
}

&::-webkit-scrollbar-thumb {
  background: ${colors["light-green"]};
  border: 1px solid ${colors["light-green"]};
  border-radius: 5px;
}

&::-webkit-scrollbar-thumb:hover {
  border-color: ${colors.additional};
}
`