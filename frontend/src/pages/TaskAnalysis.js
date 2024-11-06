import { Card, Col, message, Row } from "antd";
import React, { useContext, useEffect, useState } from "react";
import TaskpieChart from "../components/Charts/TaskpieChart";
import TaskTimeBarchart from "../components/Charts/TasktimeBarchart";
import TaskComplelitionBar from "../components/Charts/TaskComplelitionBar";
import TasklineChart from "../components/Charts/TasklineChart";
import axios from "axios";
import { AuthContext } from "../Context/AuthProvider";

const TaskAnalysis = ({ timingFilter }) => {
  const [topPerformers, setTopPerformers] = useState([]);
  const { user, role } = useContext(AuthContext) ?? {};

  const [taskLineChartData, settaskLineChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Task Start Dates vs Creation Dates",
        data: [],
      },
    ],
  });

  const [TaskpieData, setTaskpieData] = useState({
    labels: [],
    counts: [],
    ratios: [],
  });

  useEffect(() => {
    const fetchTopPerformers = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8000/task/top_performers/?timingFilter=${timingFilter}`
          );
          if (response && response.data.top_performers) {
            setTopPerformers(response.data.top_performers);
          } else {
            throw new Error("Invalid data structure received");
          }
        } catch (error) {
          message.error("Failed to fetch top performers data.");
        }
      };
    
      const fetchTaskLineChartData = async () => {
        try {
          let url =`http://localhost:8000/task/Task_line_plot_data/?timingFilter=${timingFilter}`;
          if (role !== "Admin") {
            url += `&user=${user.user_id}`; 
          }
          const response = await axios.get(url);
          
          if (response) {
            settaskLineChartData(response.data);
          } else {
            throw new Error("Invalid data structure received");
          }
        } catch (error) {
          message.error(
            "Failed to fetch line chart data. Please try again later."
          );
        }
      };
      const fetchPietaskData = async () => {
        try {
  
          let url = `http://localhost:8000/task/task_status_summary/?timingFilter=${timingFilter}`;
      
          if (role !== "Admin") {
            url += `&user=${user.user_id}`; 
          }
          const response = await axios.get(url);
          
          if (response && response.data) {
            setTaskpieData({
              labels: response.data.labels,
              counts: response.data.counts,
              ratios: response.data.ratios,
            });
          } else {
            throw new Error("Invalid data structure received");
          }
        } catch (error) {
          message.error("Failed to fetch Task Ratio data. Please try again later.");
        }
      };
      

      fetchPietaskData();
      fetchTaskLineChartData();
      fetchTopPerformers();
  }, [role, user , timingFilter]);

  return (
<div>
          <Row gutter={10}>
            <Col span={6}>
              <Card
                style={{
                  marginBottom: "8px",
                  borderRadius: "3px",

                }}
              >
                <TaskpieChart
                  data={TaskpieData}
                  title="Task Status Distribution"
           
                />
              </Card>
            </Col>
            <TaskTimeBarchart timingFilter={timingFilter}/>
            <Col span={6}>
            <TaskComplelitionBar timingFilter={timingFilter}/>
            </Col>
          </Row>
          <Row gutter={10}>
            <TasklineChart data={taskLineChartData} />
            <Col span={6}>
              <Card
                style={{
                  height: "300px",
                  overflowY: "auto",
                  overflowX: "hidden",
                  borderRadius: "3px",
                  padding: "8px",
                }}
              >
                <Row
                  style={{
                    fontWeight: "bold",
                    borderBottom: "1px solid black",
                    marginBottom: "15px",
                  }}
                >
                  <Col span={11}>Name</Col>
                  <Col span={13}>Performance (%)</Col>
                </Row>
                {topPerformers.length > 0 ? (
                  topPerformers.map((performer, index) => (
                    <Row
                      key={index}
                      gutter={16}
                      style={{
                        marginBottom: "10px",
                        borderBottom: "1px solid white",
                        paddingBottom: "8px",
                      }}
                    >
                      <Col span={12}>
                        <strong>
                          {performer.employee_first_name}{" "}
                          {performer.employee_last_name}
                        </strong>
                      </Col>
                      <Col span={12}>{performer.performance_percentage}%</Col>
                    </Row>
                  ))
                ) : (
                  <Row style={{ textAlign: "center", width: "100%" }}>
                    <Col span={24}>
                      <p>No data available</p>
                    </Col>
                  </Row>
                )}
              </Card>
            </Col>
          </Row>
          </div>
  );
};

export default TaskAnalysis;
