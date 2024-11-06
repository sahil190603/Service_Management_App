import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Card, Col, message } from "antd";
import axios from "axios";

const ProjectComplition = ({timingFilter}) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8000/project/project_completion_status_summary/?timingFilter=${timingFilter}`)
      .then(response => {
        const data = response.data;
        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: 'Project Completion Status',
              data: data.counts,
              backgroundColor: [
                'rgba(54, 162, 235, 0.6)', 
                'rgba(75, 192, 192, 0.6)', 
                'rgba(255, 99, 132, 0.6)'
              ],
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(error => {
        message.error("There was an error fetching the project completion data:", error);
      });
  }, [timingFilter]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Projects',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Completion Status',
        },
      },
    },
  };

  return (
    <Col span={6}>
      <Card style={{ marginBottom: "8px", borderRadius: "3px" }}>
        <div style={{ height: "250px" }}>
          {chartData && <Bar data={chartData} options={options} />}
        </div>
      </Card>
    </Col>
  );
};

export default ProjectComplition;
