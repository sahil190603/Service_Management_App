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

const Querybarchart = ({ data, title }) => {

  if (!data || !data.labels || !Array.isArray(data.solved_by_date) || !Array.isArray(data.solved_time)) {
    return (
      <Col span={12}>
        <Card style={{ marginBottom: "8px", borderRadius: "3px" }}>
          <div>No data available</div>
        </Card>
      </Col>
    );
  }

  const allocatedHours = data.solved_by_date.map(date => {
    return date ? 24 : 0; 
  });

  const timeTakenHours = data.solved_time.map((time, index) => {
    if (time) {
      const solvedByDate = new Date(data.solved_by_date[index]);
      const solvedTime = new Date(time);
      const difference = (solvedTime - solvedByDate) / (1000 * 60 * 60); 
      return difference >= 0 ? difference : 0; 
    }
    return 0; 
  });

  const barThickness = Math.max(15, Math.min(40, 400 / data.labels.length));

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Allocated Time (Hours)",
        data: allocatedHours,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        barThickness: barThickness,
      },
      {
        label: "Time Taken (Hours)",
        data: timeTakenHours,
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
          text: "Hours",
        },
        ticks: {
          callback: function (value) {
            return `${value} hour${value !== 1 ? 's' : ''}`;
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
        text: title || "Query Solved Time Comparison",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw} hour${tooltipItem.raw !== 1 ? 's' : ''}`;
          },
        },
      },
    },
  };

  return (
    <Col span={12}>
      <Card
        className="scroll-x-container"
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

export default Querybarchart;
