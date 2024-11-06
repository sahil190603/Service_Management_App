import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskpieChart = ({ data ,title }) => {

  const hasData = data && data.labels.length > 0 && data.counts.length > 0;

  const chartData = {
    labels: hasData ? data.labels : ['No Data'],
    datasets: [{
      label: 'Task Status',
      data: hasData ? data.counts : [1], 
      backgroundColor: hasData
        ? ['#36a2eb', '#ffcd56', '#4bc0c0', '#ff6384']
        : ['#d3d3d3'],
      hoverOffset: 6,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    devicePixelRatio: 2,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            let label = tooltipItem.label || '';
            let count = hasData ? data.counts[tooltipItem.dataIndex] : 0; 
            let percentage = hasData ? data.ratios[tooltipItem.dataIndex] : 0; 
            return `${label}: ${count} (${percentage}%)`;
          }
        }
      },   
         title: { 
        display: true,  
        text: title,  
        font: {
          size: 20,  
        }
      }
    }
  };

  return (
    <div style={{ height:"250px"}}> 
      <Pie data={chartData} options={options}/>
    </div>
  );
};

export default TaskpieChart;
