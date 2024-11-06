import React, { useContext, useEffect, useState } from "react";
import { Card, message } from "antd";
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

const TaskComplelitionBar = ({ project, timingFilter}) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const { user, role } = useContext(AuthContext) ?? {};

  useEffect(() => {
    let url = `http://localhost:8000/task/task_completion_status_summary/?timingFilter=${timingFilter}`;

    if (project) {
      const projectId = project?.id;
      url += `&project=${projectId}`
    }
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
              label: "Task Completion Status",
              data: data.counts,
              backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
            },
          ],
        });
      })
      .catch((error) => message.error("Error fetching task completion status:", error));
  }, [role , user,project ,timingFilter]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Completion Status",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Tasks",
        },
      },
    },
  };

  return ( 
      <Card style={{ marginBottom: "8px", borderRadius: "3px" }}>
      <div style={{ height: "250px" }}>
        <Bar data={chartData} options={options} />
        </div>
      </Card>
  );
};

export default TaskComplelitionBar;
