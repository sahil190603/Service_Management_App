import React, { useEffect, useState } from "react";
import { Card, Col, message } from "antd";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AppointmentBarChart = ({ timingFilter} ) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    axios.get(`http://localhost:8000/appointment/appointment_time_summary/?timingFilter=${timingFilter}`)
      .then((response) => {
        const data = response.data;
        setChartData({
          labels: data.labels, 
          datasets: [
            {
              label: "Allocated Time (hrs)",
              data: data.allocated_time, 
              backgroundColor: "rgba(54, 162, 235, 0.6)", 
              barThickness: Math.max(15, Math.min(40, 400 / data.labels.length)),
            },
            {
              label: "Time Taken (hrs)",
              data: data.time_taken, 
              backgroundColor: "rgba(255, 99, 132, 0.6)", 
              barThickness: Math.max(15, Math.min(40, 400 / data.labels.length)),
            },
          ],
        });
      })
      .catch((error) => message.error("Error fetching appointment time summary:", error));
  }, [timingFilter]);

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
          text: "hrs",
        },
        ticks: {
          callback: function (value) {
            return `${value} hr`;
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
        text:  "Task Time Comparison",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw} hrs`;
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
        <div style={{ height: "250px", minWidth: `${chartData.labels.length * 100}px` }}>
          <Bar data={chartData} options={options} />
        </div>
      </Card>
    </Col>
  );
};

export default AppointmentBarChart;
