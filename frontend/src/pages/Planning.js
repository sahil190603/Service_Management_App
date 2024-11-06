import { Card, Col, message, Row, Select, Collapse } from "antd";
import React, { useEffect, useState } from "react";
import TaskGanttChart from "../components/Charts/TaskGanttChart";
import axios from "axios";

const { Option } = Select;
const { Panel } = Collapse;

const Planning = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [timingFilter, setTimingFilter] = useState("All");

  useEffect(() => {
    const getProjects = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/project/projects-exclude-complete/`
        );
        const formattedProjects = response.data.map((project) => ({
          ...project,
          fullName: `${project.name}`,
        }));
        setProjects(formattedProjects);
      } catch (error) {
        message.error(error.message);
      }
    };
    getProjects();
  }, []);

  const handleTimingFilterChange = (value) => {
    setTimingFilter(value);
  };

  return (
    <Row justify="center" align="middle" style={{ marginTop: "10px" }}>
      <Col xs={24} sm={20} md={24} lg={24}>
        <Card
          className="scroll-xy-continer"
          style={{
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            borderRadius: "3px",
            height: "86.8vh",
            position: "relative",
          }}
        >
          <Row span={24} gutter={20} style={{ marginBottom: 8 }}>
            <Col span={2}>
              <h2 style={{ margin: 2 }}>Planning</h2>
            </Col>
            <Col span={18}></Col>
            <Col span={4}>
            <Card
                style={{
                  borderRadius: "4px",
                  position: "absolute",  
                  right: "10px", 
                  width: "100%", 
                  zIndex: 10,
                  border: "1px solid #d9d9d9",
                }}
                bodyStyle={{ padding: 4 }}
              >
                <Collapse bordered={false} defaultActiveKey={["0"]} className="custom-collapse">
                  <Panel header="Filters" key="1">
                    <Row gutter={16}>
                      <Col span={24}>
                        <Select
                          placeholder="Select Project"
                          style={{ width: "100%" }}
                          value={selectedProject}
                          onChange={(value) => setSelectedProject(value)}
                          allowClear
                        >
                          {projects.map((project) => (
                            <Option key={project.id} value={project.id}>
                              {project.fullName}
                            </Option>
                          ))}
                        </Select>
                      </Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Select
                          defaultValue="ThisMonth"
                          style={{ width: "100%" }}
                          value={timingFilter}
                          onChange={handleTimingFilterChange}
                          placeholder="Select Time"
                          allowClear
                        >
                          <Option value="All">All Time</Option>
                          <Option value="Today">Today</Option>
                          <Option value="ThisWeek">This Week</Option>
                          <Option value="ThisMonth">This Month</Option>
                          <Option value="ThisYear">This Year</Option>
                        </Select>
                      </Col>
                    </Row>
                  </Panel>
                </Collapse>
              </Card>
            </Col>
          </Row>

          <Row>
            <TaskGanttChart selectedproject={selectedProject} timingFilter={timingFilter} />
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default Planning;
