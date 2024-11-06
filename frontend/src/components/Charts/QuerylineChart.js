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

const QuerylineChart = ({ data }) => {
  const hasData = data && data.labels.length > 0;

  const chartData = {
    labels: hasData ? data.labels : ['No Data'], 
    datasets: hasData
      ? [
          {
            label: 'Query Creation Dates',
            data: data.datasets[0].data.map(point => ({
              x: point.y,
              y: point.x * 1000,
            })),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          },
          {
            label: 'Query Start Dates',
            data: data.datasets[1].data.map(point => ({
              x: point.y,
              y: point.x * 1000,
            })),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
          },
        ]
      : [
          {
            label: 'No Data',
            data: [],
            borderColor: 'rgba(200, 200, 200, 1)',
            backgroundColor: 'rgba(200, 200, 200, 0.2)',
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
  };

  return (
    <Col span={12}>
      <Card
        className="scroll-x-container"
        style={{
          marginBottom: '8px',
          borderRadius: '3px'
        }}
      >
        <div
          style={{
            height: '250px',
            width: '100%',
            minWidth: `${hasData ? data.labels.length * 120 : 120}px`,
          }}
        >
          <Line data={chartData} options={options} />
        </div>
      </Card>
    </Col>
  );
};

export default QuerylineChart;
