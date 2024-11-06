import React, { useContext, useEffect, useState } from "react";
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
import { AuthContext } from "../../Context/AuthProvider";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TaskTimeBarchart = ({ title, timingFilter }) => {
  const { user, role } = useContext(AuthContext) ?? {};
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    let url = `http://localhost:8000/task/task_time_summary/?timingFilter=${timingFilter}`;
      
    if (role !== "Admin") {
      url += `&user=${user.user_id}`; 
    }
    axios.get(url)
      .then((response) => {
        const data = response.data;
        setChartData({
          labels: data.labels, 
          datasets: [
            {
              label: "Allocated Time (Days)",
              data: data.allocated_time, 
              backgroundColor: "rgba(54, 162, 235, 0.6)", 
              barThickness: Math.max(15, Math.min(40, 400 / data.labels.length)),
            },
            {
              label: "Time Taken (Days)",
              data: data.time_taken, 
              backgroundColor: "rgba(255, 99, 132, 0.6)", 
              barThickness: Math.max(15, Math.min(40, 400 / data.labels.length)),
            },
          ],
        });
      })
      .catch((error) => message.error("Error fetching task time summary:", error));
  }, [role, user,timingFilter]);

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
        text: title || "Task Time Comparison",
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
      <Card
        className="scroll-x-container"
        style={{
          marginBottom: "8px",
          borderRadius: "3px",
        }}
      >
        <div style={{ height: "250px", minWidth: `${chartData.labels.length * 100}px` }}>
          <Bar data={chartData} options={options} />
        </div>
      </Card>
    </Col>
  );
};

export default TaskTimeBarchart;
