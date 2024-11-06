import React, { useEffect, useState, useContext } from "react";
import {
  Table,
  message,
  Tooltip,
  Row,
  Col,
  Card,
  Skeleton,
  Modal,
  Tag,
  Progress,
  Select,
  Form,
  Badge,
  Collapse,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { fetchDataBySelection } from "../Services/Services";
import { IoSearchOutline } from "react-icons/io5";
import AppTextbox from "../components/Generic/AppTextbox";
import AppModal from "../components/Generic/AppModal";
import CreateTask from "../Forms/TaskForm";
import { AuthContext } from "../Context/AuthProvider";
import axios from "axios";
import { TASK_PRIORITY_COLOR, TASK_STATUS_COLORS } from "../constant";
import AppDropdown from "../components/Generic/AppDropdown";
import { STATUS_CHOICES } from "../constant";
import AppButton from "../components/Generic/AppButton";
import ExportButton from "../components/Generic/ExportButton";
import { MdOutlineHistory } from "react-icons/md";
import { FaCodePullRequest } from "react-icons/fa6";
import { format } from "date-fns";
import TaskActivityForm from "../Forms/TaskcompleteReq";
import { TbTransferVertical } from "react-icons/tb";

const { Panel } = Collapse;

const TaskList = () => {
  const { Option } = Select;
  const { user, role } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("InProgress");
  const [SelectedAssigned_to, setSelectedAssigned_to] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ photo: null });
  const [photoURL, setPhotoURL] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isModalActivityVisible, setIsModalActivityVisible] = useState(false);
  const [isTaskTransferModelVisible, setIsTaskTransferModelVisible] =
    useState(false);
  const [Employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isTaskReqFormVisible, setIsTaskreqFormVisible] = useState(false);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [pageModalSize, setPageModalSize] = useState(7);
  const [timingFilter, setTimingFilter] = useState("All");

  useEffect(() => {
    const getTasks = async () => {
      try {
        await axios.get(`http://localhost:8000/task/update-task-status/`);
        await axios.get(`http://localhost:8000/helpdesk/update-query-status/`);
        setLoading(true);
        let response;

        if (role === "Admin") {
          response = await fetchDataBySelection("tasks", "", "", timingFilter);
        } else {
          response = await fetchDataBySelection(
            "tasksByEmployee",
            user?.user_id,
            "",
            timingFilter
          );
        }
        setTasks(response);
      } catch (error) {
        message.error("Failed to fetch tasks. Please try again.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    const fetchPendingRequestsCount = async () => {
      try {
        let responseData;
        if (role === "User") {
          responseData = await fetchDataBySelection(
            "taskCompleteRequestsforuser",
            user?.user_id
          );
        } else {
          responseData = await fetchDataBySelection("taskCompleteRequests");
        }

        setDataSource(responseData);

        const pendingRequestsCount = responseData.filter(
          (req) => req.status === "Pending"
        ).length;

        setPendingRequestCount(pendingRequestsCount);
      } catch (error) {
        message.error(error.message || "Failed to fetch pending requests.");
      }
    };

    fetchPendingRequestsCount();
    getTasks();
  }, [user, role, timingFilter]);

  const handleTimingFilterChange = (value) => {
    setTimingFilter(value);
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetchDataBySelection("projects", "", "", "");

        setProjects(response);
      } catch (error) {
        message.error("Failed to fetch projects. Please try again.");
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const searchLower = searchQuery.toLowerCase();

      const matchesQuery =
      (task.name && task.name.toLowerCase().includes(searchLower)) ||
      (task.description && task.description.toLowerCase().includes(searchLower)) ||
      (task.priority && task.priority.toLowerCase().includes(searchLower)) 

      const matchesProject = selectedProjectId
        ? task.project === selectedProjectId
        : true;

      const matchesStatus = selectedStatus
        ? task.status === selectedStatus
        : true;

      const matchesAssignedTo = SelectedAssigned_to
        ? SelectedAssigned_to === "Assigned_task"
          ? task.assigned_to !== null
          : task.assigned_to === null
        : true;

      return (
        matchesQuery && matchesProject && matchesStatus && matchesAssignedTo
      );
    });

    setFilteredTasks(filtered);
  }, [
    tasks,
    searchQuery,
    selectedProjectId,
    selectedStatus,
    SelectedAssigned_to,
  ]);

  const fetchEmployeesForTranfer = async () => {
    try {
      const response = await fetchDataBySelection("allEmployees");
      const filteredEmployees = response.filter(
        (employee) => employee.id !== user?.user_id
      );
      const defaultOption = { id: null, first_name: "Select a Employees" };

      setEmployees([defaultOption, ...filteredEmployees]);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleTransfer = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/task/TaskTransferRequest/",
        {
          created_by: user?.user_id,
          transfer_to: selectedEmployee,
          task: currentTask?.id,
        }
      );
      if (response) {
        message.success("Task Transfer requested Successfully.");
        handleModalClose();
      }
    } catch (error) {
      message.error("Error transferring task");
    }
  };

  const handleView = (record) => {
    setCurrentTask(record);
    setModalMode("view");
    setIsModalVisible(true);
  };

  const handleEdit = (id) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    setCurrentTask(taskToEdit);
    setModalMode("edit");
    setIsModalVisible(true);
  };

  const showDeleteConfirm = (TaskID) => {
    setDeleteTaskId(TaskID);
    setIsDeleteModalVisible(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setDeleteTaskId(null);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/task/tasks/${deleteTaskId}/`);
      message.success("Task deleted successfully");
      setTasks(tasks.filter((task) => task.id !== deleteTaskId));
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Failed to delete task. Please try again.");
    }
  };

  const handleCreate = () => {
    setCurrentTask(null);
    setModalMode("create");
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalActivityVisible(false);
    setIsTaskTransferModelVisible(false);
    setIsModalVisible(false);
    setCurrentTask(null);
    setSelectedEmployee(null);
    setIsTaskreqFormVisible(false);
    setEmployees([]);
  };

  const handleTaskCreated = async () => {
    setIsModalVisible(false);
    try {
      const fetchTasksData =
        user?.role === "Admin"
          ? await fetchDataBySelection("tasks")
          : await fetchDataBySelection("tasksByEmployee", user.user_id);
      setTasks(fetchTasksData);
    } catch (error) {
      message.error("Failed to fetch tasks. Please try again.");
    }
  };

  const handleProjectChange = (value) => {
    setSelectedProjectId(value ? value : null);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value ? value : null);
  };

  const handelAssigned_to_filter = (value) => {
    setSelectedAssigned_to(value ? value : null);
  };

  const handleFinishRequest = (record) => {
    setCurrentTask(record);
    setIsRequestModalVisible(true);
  };

  const handleTransferRequest = (record) => {
    fetchEmployeesForTranfer();
    setCurrentTask(record);
    setModalMode("view");
    setIsTaskTransferModelVisible(true);
  };

  const handleRequestModalClose = () => {
    setIsRequestModalVisible(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
      setPhotoURL(URL.createObjectURL(file));
    } else {
      setForm({ ...form, photo: null });
      setPhotoURL(null);
    }
  };
  const handleFinishRequestSubmit = async () => {
    if (!form.photo) {
      message.error("Please upload an image before submitting the request.");
      return;
    }

    const formData = new FormData();
    formData.append("document_link", form.photo);
    setUploading(true);

    try {
      const uploadResponse = await axios.put(
        `http://localhost:8000/task/tasks/${currentTask?.id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      message.success("Photo submitted successfully!");
      console.log("Upload Response:", uploadResponse.data);

      try {
        await axios.post("http://localhost:8000/task/Task-request/", {
          user: user?.user_id,
          task: currentTask?.id,
        });
        message.success("Finish request submitted successfully.");
      } catch (error) {
        message.error("Failed to submit the request. Please try again.");
      }

      handleRequestModalClose();
    } catch (error) {
      message.error("Failed to upload the photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handelTaskhistory = (record) => {
    setCurrentTask(record);
    setIsModalActivityVisible(true);
    fetchActivityHistory(record.id);
  };

  const columns = [
    {
      title: <span className="tableheader">Task Name</span>,
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: "15%",
    },
    {
      title: <span className="tableheader">Description</span>,
      dataIndex: "description",
      key: "description",
      width: "15%",
      align: "center",
    },
    {
      title: <span className="tableheader">Priority</span>,
      dataIndex: "priority",
      key: "priority",
      align: "center",
      width: "5%",
      render: (priority) => (
        <Tag color={TASK_PRIORITY_COLOR[priority]}>
          {priority === "null" ? "N/A" : priority}
        </Tag>
      ),
    },
    {
      title: <span className="tableheader">Status</span>,
      dataIndex: "status",
      key: "status",
      width: "13%",
      align: "center",
      render: (text) => (
        <Tag color={text ? TASK_STATUS_COLORS[text] : "default"}>
          {text === "null" ? "N/A" : text}
        </Tag>
      ),
    },
    {
      title: <span className="tableheader">Time Completed(%)</span>,
      dataIndex: "percentage_completed",
      key: "percentage_completed",
      width: "17%",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Progress
            type="circle"
            percent={record.percentage_completed}
            width={35}
            strokeColor="#52c41a"
            strokeWidth={11}
            format={(percent) => `${percent}%`}
          />
        </div>
      ),
    },
    {
      title: <span className="tableheader">Actions</span>,
      key: "actions",
      align: "center",
      width: role === "Admin" ? "15%" : "10%",
      render: (text, record) => (
        <span>
          <Tooltip title="View">
            <AppButton
            className={"ActionButton"}
              icon={<EyeOutlined style={{ color: "green" }} />}
              style={{ marginRight: 8 }}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          {role === "Admin" && (
            <>
              <Tooltip title="History">
                <AppButton
                className={"ActionButton"}
                  icon={<MdOutlineHistory />}
                  style={{ marginRight: 8 }}
                  onClick={() => handelTaskhistory(record)}
                />
              </Tooltip>
              <Tooltip title="Edit">
                <AppButton
                className={"ActionButton"}
                  icon={<EditOutlined style={{ color: "blue" }} />}
                  style={{ marginRight: 8 }}
                  onClick={() => handleEdit(record.id)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <AppButton
                className={"ActionButton"}
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => showDeleteConfirm(record.id)}
                />
              </Tooltip>
            </>
          )}
          {role !== "Admin" &&
            record.status !== "Completed" &&
            record.status !== "NotStarted" &&
            record.percentage_completed > 20 && (
              <span>
                <Tooltip title="Request For Task Submission">
                  <AppButton
                  className={"ActionButton"}
                    icon={<FaCodePullRequest />}
                    style={{ marginRight: 8 }}
                    onClick={() => handleFinishRequest(record)}
                  />
                </Tooltip>
                <Tooltip title="Task Transfer">
                  <AppButton
                  className={"ActionButton"}
                    icon={<TbTransferVertical />}
                    style={{ marginRight: 8 }}
                    onClick={() => handleTransferRequest(record)}
                  />
                </Tooltip>
              </span>
            )}
        </span>
      ),
    },
  ];

  const fetchActivityHistory = async (taskId) => {
    setLoadingHistory(true);

    try {
      const response = await fetchDataBySelection("taskAction_history", taskId);

      setActivityHistory(response);
    } catch (error) {
      message.error("Failed to fetch activity history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const TaskActivitycolumns = [
    {
      title: <span className="tableheader">Activity Name</span>,
      dataIndex: "activity_name",
      key: "activity_name",
      align:'center'
    },
    {
      title: <span className="tableheader">Time Spent</span>,
      dataIndex: "time_spent",
      key: "time_spent",
       align:'center'
    },
    {
      title: <span className="tableheader">Created At</span>,
      dataIndex: "created_at",
      key: "created_at",
       align:'center',
      render: (text) => {
        return format(new Date(text), "dd/MM/yyyy HH:mm:ss");
      },
    },
  ];

  const handleEmployeeChange = (value) => {
    setSelectedEmployee(value ? value : null);
  };

  const handleTaskRequest = () => {
    setIsTaskreqFormVisible(true);
  };

  const Null_Assigned_to_task_count = filteredTasks.filter(
    (req) => req.assigned_to === null
  ).length;

  return (
    <>
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
            <Row
              gutter={10}
              style={{ marginBottom: 8 }}
            >
              <Col className="left-content">
                <h2 style={{ margin: 2 }}>Task</h2>
              </Col>

              <Col className="right-content">
                <Badge
                  count={pendingRequestCount}
                  offset={[2, 0]}
                  style={{ backgroundColor: "#f5222d", marginRight: 8  }}
                >
                  <AppButton
                    onClick={handleTaskRequest}
                    label={"Task Complete Request"}
                  />
                </Badge>
              </Col>

              {role === "Admin" && (
                <>
                  <Col className="right-content">
                    <ExportButton
                      endpoint="http://localhost:8000/task/Export-to-excel/"
                      params={{
                        status: selectedStatus,
                        projectId: selectedProjectId,
                        assignedTo: SelectedAssigned_to,
                      }}
                      filename="Tasks.xlsx"
                      buttonLabel="Export Tasks"
                      style={{ width: "100%" }}
                    />
                  </Col>
                  <Col className="right-content">
                    <AppButton
                      icon={<PlusOutlined />}
                      onClick={handleCreate}
                      label="Create Task"
                      type="primary"
                      style={{ width: "100%" }}
                    />
                  </Col>
                </>
              )}
            </Row>

            <Row gutter={10} style={{ width: "100%" }}>
              <Col span={5}>
                <AppTextbox
                  placeholder="Search"
                  prefix={<IoSearchOutline />}
                  value={searchQuery}
                  type="text"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    borderRadius: "3px",
                    marginBottom: 16,
                  }}
                />
              </Col>
              <Col span={11}></Col>
              <Col span={4}>
                <Form.Item name="Time">
                  <Select
                    defaultValue="All"
                    style={{ width: "100%", borderRadius: "3px" }}
                    value={timingFilter}
                    onChange={handleTimingFilterChange}
                    placeholder="Select Time"
                    // allowClear
                  >
                    <Option value="All">All Time</Option>
                    <Option value="Today">Today</Option>
                    <Option value="ThisWeek">This Week</Option>
                    <Option value="ThisMonth">This Month</Option>
                    <Option value="ThisYear">This Year</Option>
                  </Select>
                </Form.Item>
              </Col>
              {role === "User" && (
                <Col span={4}>
                  <Form.Item name="Status">
                    <Select
                      defaultValue="InProgress"
                      placeholder="Select Status"
                      style={{ width: "103%" }}
                      onChange={handleStatusChange}
                      value={selectedStatus}
                      allowClear
                    >
                      {STATUS_CHOICES.map((Status) => (
                        <Option key={Status.id} value={Status.value}>
                          {Status.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}

              {role === "Admin" && (
                <Col span={4}>
                  <Card
                    style={{
                      borderRadius: "4px",
                      position: "absolute",
                      width: "100%",
                      zIndex: 10,
                      border: "1px solid #d9d9d9",
                    }}
                    bodyStyle={{ padding: 4 }}
                  >
                    <Collapse
                      bordered={false}
                      defaultActiveKey={["0"]}
                      className="custom-collapse"
                    >
                      <Panel header="Filters" key="1">
                        <Row gutter={16}>
                          <Col span={24}>
                            <Select
                              placeholder="Select Assigned Status"
                              onChange={handelAssigned_to_filter}
                              style={{ width: "100%" }}
                              allowClear
                            >
                              <Select.Option value="Assigned_task">
                                Assigned
                              </Select.Option>
                              <Select.Option value="Non_Assigned_task">
                                Not Assigned
                              </Select.Option>
                            </Select>
                          </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 8 }}>
                          <Col span={24}>
                            <Select
                              placeholder="Select Project"
                              style={{ width: "100%" }}
                              onChange={handleProjectChange}
                              allowClear
                            >
                              {projects.map((project) => (
                                <Option key={project.id} value={project.id}>
                                  {project.name}
                                </Option>
                              ))}
                            </Select>
                          </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 8 }}>
                          <Col span={24}>
                            <Select
                              placeholder="Select Status"
                              style={{ width: "100%" }}
                              onChange={handleStatusChange}
                              value={selectedStatus}
                              allowClear
                            >
                              {STATUS_CHOICES.map((Status) => (
                                <Option key={Status.id} value={Status.value}>
                                  {Status.label}
                                </Option>
                              ))}
                            </Select>
                          </Col>
                        </Row>
                      </Panel>
                    </Collapse>
                  </Card>
                </Col>
              )}
            </Row>
            {Null_Assigned_to_task_count > 0 && (
              <Row>
                <Col>
                  ( Note: There are some tasks that are still not assigned to
                  any employee. )
                </Col>
              </Row>
            )}
            {loading ? (
              <Skeleton
                active
                paragraph={{ rows: 12 }}
                className="Sketeton_of_table"
              />
            ) : (
              <Table
                columns={columns}
                dataSource={filteredTasks}
                rowKey={(record) => record.id}
                pagination={{
                  pageSize: pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: ["5", "10", "20", "50"],
                  showQuickJumper: true,
                  onShowSizeChange: (current, size) => setPageSize(size),
                }}
                scroll={{ x: 800 }}
              />
            )}
          </Card>
        </Col>
      </Row>
      <AppModal
        visible={isModalVisible}
        onCancel={handleModalClose}
        size="default"
      >
        <CreateTask
          taskData={currentTask}
          isViewMode={modalMode === "view"}
          isUpdateMode={modalMode === "edit"}
          closeModal={handleModalClose}
          onTaskCreated={handleTaskCreated}
        />
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
        <p>Are you sure you want to delete this task?</p>
      </Modal>

      <Modal
        wrapClassName="sharp-edged-modal"
        title="Request to Finish Task"
        visible={isRequestModalVisible}
        onCancel={handleRequestModalClose}
        onOk={handleFinishRequestSubmit}
        okButtonProps={{ disabled: uploading || !form.photo }}
      >
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
        {photoURL && (
          <img
            src={photoURL}
            alt="Uploaded Preview"
            style={{ marginTop: 20, maxWidth: "100%" }}
          />
        )}
      </Modal>

      <AppModal
      title={`Activity History - ${currentTask?.name}(Task)`}
        visible={isModalActivityVisible}
        onCancel={handleModalClose}
        size="medium"
      >
        <Table
          dataSource={activityHistory}
          columns={TaskActivitycolumns}
          loading={loadingHistory}
          rowKey="id"
          pagination={{
            pageSize: pageModalSize,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showQuickJumper: true,
            onShowSizeChange: (current, size) => setPageModalSize(size),
          }}
        />
      </AppModal>
      <AppModal
        visible={isTaskTransferModelVisible}
        onCancel={handleModalClose}
        size="medium"
      >
        <Card>
          <Row>
            <Col span={12}>
              <AppDropdown
                label="Transfer-To"
                name="Transfer"
                options={Employees}
                placeholder="Select Employee"
                labelKey="first_name"
                onChange={handleEmployeeChange}
              />
            </Col>
            <Col span={9}></Col>
            <Col span={3}>
              <AppButton
                type="primary"
                label="Transfer"
                onClick={handleTransfer}
              />
            </Col>
          </Row>
        </Card>
        <CreateTask taskData={currentTask} isViewMode={modalMode === "view"} />
      </AppModal>
      <AppModal
       title="Task Complete Requests"
        visible={isTaskReqFormVisible}
        onCancel={handleModalClose}
        size="large"
      >
        <TaskActivityForm
          dataSource={dataSource}
          projectData={projects}
          onTaskApproved={handleTaskCreated}
        />
      </AppModal>
    </>
  );
};

export default TaskList;
