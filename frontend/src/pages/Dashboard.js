import { Card, Col, Row, Select } from "antd";
import React, { useContext, useEffect, useState } from "react";
import AppointmentAnalysis from "../Forms/AppointmentAnalysis";
import TaskAnalysis from "../Forms/TaskAnalysis";
import HelpdeskAnalysis from "../Forms/HelpdeskAnalysis";
import ProjectAnalysis from "../Forms/ProjectAnalysis";
import "../Style/Dashboard.css";
import { AuthContext } from "../Context/AuthProvider";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AppButton from "../components/Generic/AppButton";

const { Option } = Select;

const Dashboard = () => {
  const { role } = useContext(AuthContext) ?? {};
  const [selectedOption, setSelectedOption] = useState("ProjectAnalysis");
  const [timingFilter, setTimingFilter] = useState("All");

  useEffect(() => {
    if (role === "User") {
      setSelectedOption("TaskAnalysis");
    }
  }, [role]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleTimingFilterChange = (value) => {
    setTimingFilter(value);
  };

  const downloadPDF = async () => {
    const input = document.getElementById("pdf-content");
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    pdf.save(`${selectedOption}-Analysis.pdf`);
  };

  return (
    <div>
      <Card
        style={{
          marginTop: "10px",
          height: "86.8vh",
          overflow: "hidden",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          borderRadius: "3px",
        }}
      >
        <Row
          gutter={10}
          style={{ marginBottom: 8 }}
        >
          <Col className="left-content">
            <h2 style={{ margin: 2 }}>Dashboard</h2>
          </Col>

          <Col className="right-content" span={5}>
            <Select
              defaultValue="All"
              style={{ width: "100%", textAlign: "center" }}
              value={timingFilter}
              onChange={handleTimingFilterChange}
              placeholder="Select Time"
            >
              <Option value="All">All Time</Option>
              <Option value="Today">Today</Option>
              <Option value="ThisWeek">This Week</Option>
              <Option value="ThisMonth">This Month</Option>
              <Option value="ThisYear">This Year</Option>
            </Select>

            <AppButton
              type="primary"
              onClick={downloadPDF}
              style={{ borderRadius: 0 }}
              label={"Download PDF"}
            />
          </Col>
        </Row>
        <Row gutter={5} className="options-container">
          <Col className="right-content">
            {role === "Admin" && (
              <div
                className={`option-item ${
                  selectedOption === "ProjectAnalysis" ? "selected" : ""
                }`}
                onClick={() => handleOptionClick("ProjectAnalysis")}
              >
                <div className="option-label">Project Analysis</div>
              </div>
            )}

            <div
              className={`option-item ${
                selectedOption === "TaskAnalysis" ? "selected" : ""
              }`}
              onClick={() => handleOptionClick("TaskAnalysis")}
            >
              <div className="option-label">Task Analysis</div>
            </div>

            {role === "Admin" && (
              <div
                className={`option-item ${
                  selectedOption === "HelpdeskAnalysis" ? "selected" : ""
                }`}
                onClick={() => handleOptionClick("HelpdeskAnalysis")}
              >
                <div className="option-label">Helpdesk Analysis</div>
              </div>
            )}

            {role === "Admin" && (
              <div
                className={`option-item ${
                  selectedOption === "AppointmentAnalysis" ? "selected" : ""
                }`}
                onClick={() => handleOptionClick("AppointmentAnalysis")}
              >
                <div className="option-label">Appointment Analysis</div>
              </div>
            )}
          </Col>

        </Row>
        <Row justify="center" align="middle" style={{ marginTop: "10px" }}>
          <Col xs={24} sm={20} md={24} lg={24}>
            <Card
              className="scroll-xy-continer"
              style={{
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                borderRadius: "3px",
                height: "62.8vh",
              }}
            >
              <div id="pdf-content">
                {selectedOption === "ProjectAnalysis" && (
                  <ProjectAnalysis timingFilter={timingFilter} />
                )}
                {selectedOption === "TaskAnalysis" && (
                  <TaskAnalysis timingFilter={timingFilter} />
                )}
                {selectedOption === "HelpdeskAnalysis" && (
                  <HelpdeskAnalysis timingFilter={timingFilter} />
                )}
                {selectedOption === "AppointmentAnalysis" && (
                  <AppointmentAnalysis timingFilter={timingFilter} />
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
