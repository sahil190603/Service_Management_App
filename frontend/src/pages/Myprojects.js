import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  message,
  Modal,
  Tooltip,
  Tag,
  Table,
  Skeleton,
  Pagination,
  Form,
  Select,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { fetchDataBySelection } from "../Services/Services";
import AppButton from "../components/Generic/AppButton";
import CreateProject from "../Forms/CreateProject";
import AppModal from "../components/Generic/AppModal";
import { SiGoogleanalytics } from "react-icons/si";
import { PROJECT_STATUS, PROJECT_STATUS_COLORS } from "../constant";
import { PutStarted } from "../Services/Services";
import axios from "axios";
import { IoSearchOutline } from "react-icons/io5";
import AppTextbox from "../components/Generic/AppTextbox";
import ExportButton from "../components/Generic/ExportButton";
import TaskpieChart from "../components/Charts/TaskpieChart";
import TaskComplelitionBar from "../components/Charts/TaskComplelitionBar";
import AppDropdown from "../components/Generic/AppDropdown";

const { Option } = Select;

const Myprojects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateViewModalVisible, setIsUpdateViewModalVisible] =
    useState(false);
  const [isAnalyticalModalVisible, setIsAnalyticalModalVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [pieChartData, setpieChartData] = useState({
    labels: [],
    counts: [],
    ratios: [],
  });
  const [pageSize, setPageSize] = useState(7);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectpageSize, setprojectPageSize] = useState(5);
  const [timingFilter, setTimingFilter] = useState("ThisWeek");

  useEffect(() => {
    const getProjects = async () => {
      try {
        await axios.get(`http://127.0.0.1:8000/project/update-project-status/`);
        await axios.get(
          `http://127.0.0.1:8000/LeaveManagement/RejectExpiredLeaveRequestsView/`
        );
        const projectsData = await fetchDataBySelection(
          "projects",
          "",
          "",
          timingFilter
        );
        setProjects(projectsData);
      } catch (error) {
        message.error(error.message);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    getProjects();
  }, [timingFilter]);

  const paginatedProjects = projects
    .filter((project) =>
      selectedStatus ? project.status === selectedStatus : true
    )
    .filter((project) =>
      searchQuery
        ? project.name.toLowerCase().includes(searchQuery.toLowerCase()) 
        : true
    )
    .slice((currentPage - 1) * projectpageSize, currentPage * projectpageSize);

  const handlePageChange = (page, projectpageSize) => {
    setCurrentPage(page);
    setprojectPageSize(projectpageSize);
  };

  const fetchPietaskData = async (id) => {
    try {
      let url = `http://localhost:8000/task/task_status_summary/?project=${id}`;

      const response = await axios.get(url);

      if (response && response.data) {
        setpieChartData({
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

  useEffect(() => {
    const updateStatus = async () => {
      try {
        await PutStarted();
      } catch (error) {
        message.error(error.message);
      }
    };
    updateStatus();
  }, [projects]);

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/project/projects/${deleteProjectId}/`
      );
      message.success("Project deleted successfully");
      const updatedProjects = projects.filter(
        (project) => project.id !== deleteProjectId
      );
      setProjects(updatedProjects);
      setIsDeleteModalVisible(false);

      const remainingProjectsOnPage = updatedProjects.slice(
        (currentPage - 1) * projectpageSize,
        currentPage * projectpageSize
      );

      if (remainingProjectsOnPage.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const showDeleteConfirm = (projectId) => {
    setDeleteProjectId(projectId);
    setIsDeleteModalVisible(true);
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setIsViewModalVisible(true);
  };

  const fetchAnalytics = (project) => {
    fetchPietaskData(project.id);
    setSelectedProject(project);
    setIsAnalyticalModalVisible(true);
  };

  const handleUpdateProject = (project) => {
    setSelectedProject(project);
    setIsUpdateViewModalVisible(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
  };

  const handleCancelView = () => {
    setIsViewModalVisible(false);
    setIsUpdateViewModalVisible(false);
    setSelectedProject(null);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsCreateModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsViewModalVisible(false);
    setIsUpdateViewModalVisible(false);
    setIsCreateModalVisible(false);
    setSelectedProject(null);
    fetchProjects();
  };

  const fetchProjects = async () => {
    try {
      const projectsData = await fetchDataBySelection(
        "projects",
        "",
        "",
        timingFilter
      );
      setProjects(projectsData);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleTaskProject = async (project) => {
    setSelectedProject(project);
    setIsTaskModalVisible(true);
    setIsTasksLoading(true);
    try {
      const tasksData = await fetchDataBySelection(
        "tasksByProject",
        project.id
      );
      setTasks(tasksData);
    } catch (error) {
      message.error(error.message);
    } finally {
      setTimeout(() => {
        setIsTasksLoading(false);
      }, 1000);
    }
  };

  const handleTaskModalClose = () => {
    setIsTaskModalVisible(false);
    setIsAnalyticalModalVisible(false);
    setSelectedProject(null);
    setTasks([]);
  };

  const columns = [
    {
      title: <span className="tableheader">Task Name</span>,
      dataIndex: "name",
      key: "name",
    },
    {
      title: <span className="tableheader">Description</span>,
      dataIndex: "description",
      key: "description",
    },
    {
      title: <span className="tableheader">Priority</span>,
      dataIndex: "priority",
      key: "priority",
      render: (priority) => (priority === "null" ? "N/A" : priority),
    },
    {
      title: <span className="tableheader">Status</span>,
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (text) => (
        <Tag color={PROJECT_STATUS_COLORS[text]}>
          {text === "null" ? "N/A" : text}
        </Tag>
      ),
    },
    {
      title: <span className="tableheader">Assigned To</span>,
      dataIndex: "assigned_to",
      key: "assigned_to",
    },
    {
      title: <span className="tableheader">Time Taken</span>,
      dataIndex: "time_taken",
      key: "time_taken",
    },
  ];

  const handleTimingFilterChange = (value) => {
    setTimingFilter(value ? value : null);
  };

  const ProjectColums = [
    {
      title: <span className="tableheader">Project Name</span>,
      dataIndex: "name",
      key: "name",
    },
    {
      title: <span className="tableheader">Status</span>,
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={PROJECT_STATUS_COLORS[status]}>
          {status === "null" ? "N/A" : status}
        </Tag>
      ),
    },
    {
      title: <span className="tableheader">Start Date</span>,
      dataIndex: "start_date",
      key: "start_date",
      align: "center",
      render: (start_date) => new Date(start_date).toLocaleDateString(),
    },
    {
      title: <span className="tableheader">End Date</span>,
      dataIndex: "end_date",
      key: "end_date",
      align: "center",
      render: (end_date) =>
        end_date ? new Date(end_date).toLocaleDateString() : "N/A",
    },
    {
      title: <span className="tableheader">Actions</span>,
      key: "actions",
      align: "center",
      render: (_, project) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Tooltip title="Tasks">
            <AppButton
              className={"ActionButton"}
              onClick={() => handleTaskProject(project)}
              style={{ marginRight: "8px" }}
              label="Tasks"
            />
          </Tooltip>
          <Tooltip title="Analytics">
            <AppButton
              className={"ActionButton"}
              icon={<SiGoogleanalytics style={{ color: "orange" }} />}
              style={{ marginRight: "8px" }}
              onClick={() => fetchAnalytics(project)}
            />
          </Tooltip>
          <Tooltip title="View Project">
            <AppButton
              className={"ActionButton"}
              icon={<EyeOutlined style={{ color: "green" }} />}
              onClick={() => handleViewProject(project)}
              style={{ marginRight: "8px" }}
            />
          </Tooltip>
          <Tooltip title="Edit Project">
            <AppButton
              className={"ActionButton"}
              icon={<EditOutlined style={{ color: "blue" }} />}
              onClick={() => handleUpdateProject(project)}
              style={{ marginRight: "8px" }}
            />
          </Tooltip>
          <Tooltip title="Delete Project">
            <AppButton
              className={"ActionButton"}
              icon={<DeleteOutlined />}
              danger
              onClick={() => showDeleteConfirm(project.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Row justify="center" align="middle" style={{ marginTop: "10px" }}>
      <Col xs={24} sm={20} md={24} lg={24}>
        <Card
          className="scroll-xy-continer"
          style={{
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            borderRadius: "3px",
            height: "86.8vh",
          }}
        >
          <Row gutter={10} style={{ marginBottom: 8 }}>
            <Col className="left-content">
              <h2 style={{ margin: 2 }}>Project</h2>
            </Col>
            <Col className="right-content ">
              <ExportButton
                endpoint="http://localhost:8000/project/export-projects/"
                params={{ status: selectedStatus }}
                filename="Projects.xlsx"
                buttonLabel="Export Projects"
              />
            </Col>
            <Col className="right-content ">
              <AppButton
                icon={<PlusOutlined />}
                onClick={handleCreateProject}
                label="Create Project"
                type={"primary"}
              />
            </Col>
          </Row>
          <Row gutter={10} style={{ width: "100%" }}>
            <Col span={5}>
              <AppTextbox
                placeholder="Search "
                prefix={<IoSearchOutline />}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                type="text"
              />
            </Col>
            <Col span={11}></Col>
            <Col span={4}>
              <AppDropdown
                style={{ width: "100%" }}
                name="status"
                options={PROJECT_STATUS}
                placeholder="Select Status"
                labelKey="label"
                valueKey="value"
                onChange={(value) => setSelectedStatus(value)}
              />
            </Col>

            <Col span={4}>
              <Form.Item name="Time">
                <Select
                  defaultValue="ThisWeek"
                  style={{ width: "105%" }}
                  value="value"
                  onChange={handleTimingFilterChange}
                  placeholder="Select Time"
                >
                  <Option value="All">All Time</Option>
                  <Option value="Today">Today</Option>
                  <Option value="ThisWeek">This Week</Option>
                  <Option value="ThisMonth">This Month</Option>
                  <Option value="ThisYear">This Year</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {isLoading ? (
            <Skeleton
              active
              paragraph={{ rows: 11 }}
              className="Sketeton_of_table"
            />
          ) : (
            <Table
              dataSource={paginatedProjects.filter((project) =>
                selectedStatus ? project.status === selectedStatus : true
              )}
              columns={ProjectColums}
              rowKey="id"
              pagination={false}
            />
          )}

          <Row justify="end" style={{ marginTop: "17px" }}>
            <Pagination
              current={currentPage}
              pageSize={projectpageSize}
              total={projects.length}
              onChange={handlePageChange}
              pageSizeOptions={["5", "7", "10", "20", "50"]}
              showSizeChanger
            />
          </Row>
        </Card>
      </Col>

      <AppModal
        visible={isViewModalVisible}
        onCancel={handleCancelView}
        size="default"
      >
        <CreateProject
          projectData={selectedProject}
          isViewMode={true}
          closeModal={handleCloseModal}
        />
      </AppModal>

      <AppModal
        visible={isUpdateViewModalVisible}
        onCancel={handleCancelView}
        size="default"
      >
        <CreateProject
          projectData={selectedProject}
          isUpdateMode={true}
          closeModal={handleCloseModal}
        />
      </AppModal>

      <AppModal
        visible={isCreateModalVisible}
        onCancel={handleCloseModal}
        size="default"
      >
        <CreateProject closeModal={handleCloseModal} />
      </AppModal>

      <Modal
        wrapClassName="sharp-edged-modal"
        title="Confirm Deletion"
        visible={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this project?</p>
      </Modal>

      <AppModal
        title={
          <span>
            Tasks For -{" "}
            {selectedProject ? selectedProject.name : "Project Name"}
          </span>
        }
        visible={isTaskModalVisible}
        onCancel={handleTaskModalClose}
        size="medium"
      >
        {isTasksLoading ? (
          <Skeleton
            active
            paragraph={{ rows: 5 }}
            className="Sketeton_of_table"
          />
        ) : (
          <Table
            dataSource={tasks}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["5", "7", "10", "20", "50"],
              showQuickJumper: true,
              onShowSizeChange: (current, size) => setPageSize(size),
            }}
          />
        )}
      </AppModal>
      <AppModal
        visible={isAnalyticalModalVisible}
        onCancel={handleTaskModalClose}
      >
        <h3> {selectedProject?.name} -- (Summary)</h3>
        <Row>
          <Col span={12}>
            <Card
              style={{
                marginBottom: "8px",
                borderRadius: "3px",
              }}
            >
              <TaskpieChart data={pieChartData} />
            </Card>
          </Col>
          <Col span={12}>
            <TaskComplelitionBar project={selectedProject} />
          </Col>
        </Row>
      </AppModal>
    </Row>
  );
};

export default Myprojects;
