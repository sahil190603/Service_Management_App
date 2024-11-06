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

const TasklineChart = ({ data }) => {
  const hasData = data && data.labels.length > 0;

  const chartData = hasData
    ? {
        labels: data.labels,
        datasets: [
          {
            label: 'Task Creation Dates',
            data: data.datasets[0].data.map(point => ({
              x: point.y, 
              y: new Date(point.x).getTime()
            })),
            borderColor: 'rgba(75, 192, 192, 1)', 
            backgroundColor: 'rgba(75, 192, 192, 0.2)', 
          },
          {
            label: 'Task Start Dates',
            data: data.datasets[1].data.map(point => ({
              x: point.y, 
              y: new Date(point.x).getTime() 
            })),
            borderColor: 'rgba(255, 99, 132, 1)', 
            backgroundColor: 'rgba(255, 99, 132, 0.2)', 
          },
        ],
      }
    : {
        labels: ['No data'], 
        datasets: [
          {
            label: 'No data available',
            data: [{ x: 'No data', y: 0 }],
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
          padding: 20,
        },
        // title: {
        //   display: true,
        //   text: 'Tasks',
        // },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Dates',
        },
        ticks: {
          callback: function(value) {
            return value === 0 ? 'No data' : new Date(value).toLocaleDateString(); // Show 'No data' when there's no data
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function(tooltipItem) {
            if (tooltipItem.raw.y === 0) {
              return 'No data';
            }
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
          marginBottom: '8px',
          borderRadius: '3px',
        }}
      >
        <div style={{ height: '250px', width: '100%', minWidth: `${hasData ? data.labels.length * 120 : 300}px` }}>
          <Line data={chartData} options={options} />
        </div>
      </Card>
    </Col>
  );
};

export default TasklineChart;
