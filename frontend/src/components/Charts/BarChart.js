import React from "react";
import { Card, Col } from "antd";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarChart = ({ data, title }) => {
  const barThickness = Math.max(15, Math.min(40, 400 / data.labels.length));

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Allocated Time (Days)",
        data: data.allocated_time,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        barThickness: barThickness,
      },
      {
        label: "Time Taken (Days)",
        data: data.time_taken,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        barThickness: barThickness,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2,
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Days",
        },
        ticks: {
          callback: function (value) {
            return `${value} days`;
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title || "Project Time Comparison",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw} days`;
          },
        },
      },
    },
  };

  return (
    <Col span={12}>
      <Card className="scroll-x-container"
        style={{
          marginBottom: "8px",
          borderRadius: "3px"
        }}
      >
        <div style={{ height: "250px", minWidth: `${data.labels.length * 100}px` }}> 
          <Bar data={chartData} options={options} />
        </div>
      </Card>
    </Col>
  );
};

export default BarChart;
