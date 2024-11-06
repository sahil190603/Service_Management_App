import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import { Card, Col, message } from 'antd';

const Appointmentpie = ({ timingFilter }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8000/appointment/Appintment_status_summary/?timingFilter=${timingFilter}`)
      .then(response => {
        const data = response.data;
        if (data.labels.length === 0 || data.counts.length === 0) {
          setChartData({
            labels: ['No Data'], 
            datasets: [{
              data: [1], 
              backgroundColor: ['#D3D3D3'], 
              hoverBackgroundColor: ['#D3D3D3'],
            }]
          });
        } else {
        setChartData({
          labels: data.labels,
          datasets: [{
            data: data.counts,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], 
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
          }]
        });
      }
      })
      .catch(error => {
       message.error("Error fetching the pie chart data", error);
      });
  }, [timingFilter]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2, 
  };

  return (
    <Col span={6}>
      <Card
        style={{
          marginBottom: "8px",
          borderRadius: "3px"
        }}
      >
        <div style={{ height: "250px", position: "relative" }}>
          {chartData ? <Pie data={chartData} options={options} /> : <h4>No data available</h4>} 
        </div>
      </Card>
    </Col>
  );
};

export default Appointmentpie;
