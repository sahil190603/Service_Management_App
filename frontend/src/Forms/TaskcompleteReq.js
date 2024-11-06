import React, { useEffect, useState, useContext } from "react";
import {
  Row,
  Col,
  Table,
  message,
  Select,
  Tooltip,
  Tag,
} from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import AppTextbox from "../components/Generic/AppTextbox";
import { AuthContext } from "../Context/AuthProvider";
import { DeleteOutlined } from "@ant-design/icons";
import { Approve_Task, Reject_Task } from "../Services/Services";
import axios from "axios";
import { FaLink } from "react-icons/fa";
import AppModal from "../components/Generic/AppModal";
import AppDropdown from "../components/Generic/AppDropdown";
import { TASK_REQ_STATUS, Task_Transfer_STATUS_COLOR } from "../constant";
import AppButton from "../components/Generic/AppButton";
import { MdDone} from "react-icons/md";

const TaskActivityForm = ({ dataSource, projectData, onTaskApproved }) => {
  const { Option } = Select;
  const { role } = useContext(AuthContext);
  const [filteredTasks, setFilteredTasks] = useState(dataSource);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [pageModalSize, setPageModalSize] = useState(7);

  const columns = [
    {
      title: <span className="tableheader">Date of Request</span>,
      dataIndex: "date_of_request",
      key: "date_of_request",
      align:"center",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: <span className="tableheader">Status</span>,
      dataIndex: "status",
      key: "status",
      align:"center",
      render: (text) => (
        <Tag color={text ? Task_Transfer_STATUS_COLOR[text] : "default"}>
          {text === "null" ? "N/A" : text}
        </Tag>
      ),
    },
    {
      title: <span className="tableheader">User Email</span>,
      dataIndex: "user",
      key: "user",
      align:"center",
    },
    {
      title: <span className="tableheader">Task Name</span>,
      dataIndex: "task_name",
      key: "task",
      align:"center",
    },
    {
      title: <span className="tableheader">Project</span>,
      dataIndex: "project_name",
      key: "project_name",
      align:"center",
    },
    {
      title: <span className="tableheader">Attachment</span>,
      dataIndex: "document_url",
      key: "document_url",
      align:"center",
      render: (url) =>
        url ? (
          <FaLink
            onClick={() => handleLinkClick(url)}
            style={{ cursor: "pointer", color: "#1890ff" }}
          />
        ) : null,
    },
    {
      title: <span className="tableheader">Actions</span>,
      key: "actions",
      align:"center",
      render: (text, record) => {
        if (record.status === "Approved" || record.status === "Rejected") {
          return null;
        }
        if (role === "Admin") {
          return (
            <div>
              <Tooltip title="Accept">
                <AppButton
                className={"ActionButton"}
                  style={{ color: "green" }}
                  icon={<MdDone />}
                  onClick={() => handleApprove(record.id)}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <AppButton
                className={"ActionButton"}
                  danger
                  icon={<RxCross1 />}
                  onClick={() => handleReject(record.id)}
                  style={{ marginLeft: 8 }}
                />
              </Tooltip>
            </div>
          );
        } else if (role === "User") {
          return (
            <Tooltip title="Delete">
              <AppButton
              className={"ActionButton"}
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
                style={{ marginLeft: 8 }}
              />
            </Tooltip>
          );
        }
      },
    },
  ];

  useEffect(() => {
    let tasks = dataSource;
  
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
    
      tasks = tasks.filter((task) => {


        const matchesUserEmail = task.user
          ? task.user.toLowerCase().includes(searchLower)
          : false;
    
        const matchesTaskName =  task.task_name
          ? task.task_name.toLowerCase().includes(searchLower)
          : false;

  
        return (
          matchesUserEmail ||
          matchesTaskName 
        );
      });
    }
    
    if (selectedStatus) {
      tasks = tasks.filter((task) => task.status === selectedStatus);
    }
    
    if (selectedProject) {
      tasks = tasks.filter((task) => task.project_name === selectedProject);
    }
  
    setFilteredTasks(tasks);
  }, [searchQuery, selectedStatus, dataSource, selectedProject]);
  

  const handleApprove = async (taskId) => {
    try {
      await Approve_Task(taskId);
      message.success(`Task ${taskId} approved!`);
      if (onTaskApproved) {
        onTaskApproved(true);
      }
    } catch (error) {
      message.error(error.message || "Failed to approve task.");
    }
  };

  const handleReject = async (taskId) => {
    try {
      await Reject_Task(taskId);
      message.error(`Task ${taskId} rejected!`);
    } catch (error) {
      message.error(error.message || "Failed to reject task.");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`http://localhost:8000/task/Task-request/${taskId}/`);
      message.success(`Task ${taskId} deleted successfully.`);

      setFilteredTasks((prevFiltered) =>
        prevFiltered.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      throw new Error("Failed to Delete Request");
    }
  };

  const handleLinkClick = (url) => {
    setImageUrl(url);

    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);

    setImageUrl("");
  };

  return (
    <>
      <Row justify="center" align="middle">
        <Col span={24} >

            <Row gutter={10} style={{ width: "100%" }}>
              <Col span={6}>
                <AppTextbox
                  placeholder="Search"
                  prefix={<IoSearchOutline />}
                  value={searchQuery}
                  type="text"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "3px",
                    marginBottom: 16,
                  }}
                />
              </Col>
              <Col span={10}></Col>
              <Col span={4}>
                  <Select
                    placeholder="Select project"
                    onChange={setSelectedProject}
                    allowClear
                    style={{ width: "100%"}}
                  >
                    {projectData.map((project) => (
                      <Option key={project.name} value={project.name}>
                        {project.label}
                      </Option>
                    ))}
                  </Select>
              </Col>

              <Col span={4}>
                <AppDropdown
                  // label="Status"
                  name="status"
                  options={TASK_REQ_STATUS}
                  placeholder="Select status"
                  labelKey="name"
                  value="id"
                  onChange={setSelectedStatus}
                  style={{ width: "100%"}}
                />
              </Col>
            </Row>
            <Table
              columns={columns}
              dataSource={filteredTasks}
              rowKey={(record) => record.id}
              pagination={{
                pageSize: pageModalSize,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
                showQuickJumper: true,
                onShowSizeChange: (current, size) => setPageModalSize(size),
              }}
            />
        </Col>
      </Row>

      <AppModal visible={isModalVisible} onCancel={handleCancel} size="medium">
        <img
          src={`http://localhost:8000/${imageUrl}`}
          alt="Document"
          style={{ width: "70%", height: "auto" }}
        />
      </AppModal>
    </>
  );
};

export default TaskActivityForm;
