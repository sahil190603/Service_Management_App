import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, Col } from 'antd';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const LineChart = ({ data }) => {
  if (!data || data.labels.length === 0) {
    const blankChartData = {
      labels: ['No Data'],
      datasets: [
        {
          label: 'No data available',
          data: [0],
          borderColor: 'rgba(128, 128, 128, 0.5)', 
          backgroundColor: 'rgba(128, 128, 128, 0.1)',
        },
      ],
    };

    const blankOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'category',
          ticks: {
            display: true, 
          },
          grid: {
            display: true, 
          },
        },
        y: {
          type: 'linear',
          ticks: {
            display: true, 
          },
          grid: {
            display: true, 
          },
        },
      },
    };

    return (
      <Col span={12}>
        <Card
          style={{
            marginBottom: "8px",
            borderRadius: "3px",
          }}
        >
          <div style={{ height: "250px", width: "100%" }}>
            <Line data={blankChartData} options={blankOptions} />
          </div>
        </Card>
      </Col>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Project Creation Dates',
        data: data.datasets[0].data.map(point => ({
          x: point.y,
          y: point.x * 1000,
        })),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Project Start Dates',
        data: data.datasets[1].data.map(point => ({
          x: point.y,
          y: point.x * 1000, 
        })),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2,
    scales: {
      x: {
        type: 'category',
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          padding: 20,
        },
      },
      y: {
        type: 'linear',
        ticks: {
          callback: function (value) {
            return new Date(value).toLocaleDateString(); 
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const date = new Date(tooltipItem.raw.y); 
            return `Date: ${date.toLocaleString()}`;
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
        <div style={{ height: "250px", width: "100%", minWidth: `${data.labels.length * 120}px` }}>
          <Line data={chartData} options={options} />
        </div>
      </Card>
    </Col>
  );
};

export default LineChart;
