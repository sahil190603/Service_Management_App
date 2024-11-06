import { Card, Col, message, Row } from "antd";
import React, { useEffect, useState } from "react";
import BarChart from "../components/Charts/BarChart";
import ProjectComplition from "../components/Charts/ProjectComplition_Bar";
import LineChart from "../components/Charts/LineChart";
import PieChart from "../components/Charts/PieChart";
import axios from "axios";

const ProjectAnalysis = ({ timingFilter }) => {
  const [selectedStatus, setSelectedStatus] = useState("null");
  const [chartData, setChartData] = useState({
    labels: [],
    counts: [],
    ratios: [],
  });
  const [barChartData, setBarChartData] = useState({
    labels: [],
    allocated_time: [],
    time_taken: [],
  });
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Project Start Dates vs Creation Dates",
        data: [],
      },
    ],
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/project/project_status_summary/?timingFilter=${timingFilter}`
        );
        if (response) {
          setChartData({
            labels: response.data.labels,
            counts: response.data.counts,
            ratios: response.data.ratios,
          });
        } else {
          throw new Error("Invalid data structure received");
        }
      } catch (error) {
        message.error("Failed to fetch chart data. Please try again later.");
      }
    };

    const fetchBarChartData = async () => {
      try {
        let url;
        if (selectedStatus === "null") {
          url = `http://localhost:8000/project/project_time_summary/?timingFilter=${timingFilter}`;
        } else {
          // url =
        }
        const response = await axios.get(url);
        if (response) {
          setBarChartData({
            labels: response.data.labels,
            allocated_time: response.data.allocated_time,
            time_taken: response.data.time_taken,
          });
        } else {
          throw new Error("Invalid data structure received");
        }
      } catch (error) {
        message.error(
          "Failed to fetch bar chart data. Please try again later."
        );
      }
    };

    const fetchLineChartData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/project/Line_plot_data/?timingFilter=${timingFilter}`
        );
        if (response) {
          setLineChartData(response.data);
        } else {
          throw new Error("Invalid data structure received");
        }
      } catch (error) {
        message.error(
          "Failed to fetch line chart data. Please try again later."
        );
      }
    };

    fetchChartData();
    fetchBarChartData();
    fetchLineChartData();
  }, [selectedStatus, timingFilter]);

  return (
    <div>
      <Row gutter={10}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            style={{
              marginBottom: "8px",
              borderRadius: "3px",
            }}
          >
            <PieChart data={chartData} title="Project Status Distribution" />
          </Card>
        </Col>

        <BarChart
          data={barChartData}
          title="Project Time Allocation vs Time Taken"
        />
        <ProjectComplition timingFilter={timingFilter} />
      </Row>
      <Row gutter={10}>
        <LineChart
          data={lineChartData}
          title="Project Start Dates vs Creation Dates"
        />
      </Row>
    </div>
  );
};

export default ProjectAnalysis;

// For static analysis

// useEffect(() =>{
//   const fetchChartData = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/project/project_status_summary/`
//       );
//       if (response) {
//         setChartData({
//           labels: response.data.labels,
//           counts: response.data.counts,
//           ratios: response.data.ratios,
//         });
//       } else {
//         throw new Error("Invalid data structure received");
//       }
//     } catch (error) {
//       message.error("Failed to fetch chart data. Please try again later.");
//     }
//   };
//   const fetchBarChartData = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/project/project_time_summary/?status=${selectedStatus}`
//       );
//       if (response) {
//         setBarChartData({
//           labels: response.data.labels,
//           allocated_time: response.data.allocated_time,
//           time_taken: response.data.time_taken,
//         });
//       } else {
//         throw new Error("Invalid data structure received");
//       }
//     } catch (error) {
//       message.error(
//         "Failed to fetch bar chart data. Please try again later."
//       );
//     }
//   };
//   const fetchLineChartData = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/project/Line_plot_data/`
//       );
//       if (response) {
//         setLineChartData(response.data);
//       } else {
//         throw new Error("Invalid data structure received");
//       }
//     } catch (error) {
//       message.error(
//         "Failed to fetch line chart data. Please try again later."
//       );
//     }
//   };
//   fetchChartData();
//   fetchBarChartData();
//   fetchLineChartData();
// },[selectedStatus])
