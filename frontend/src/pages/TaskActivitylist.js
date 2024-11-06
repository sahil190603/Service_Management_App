import React, { useContext, useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Tooltip,
  Tag,
  message,
  Form,
  Input,
  Table,
  Skeleton,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { fetchDataBySelection, addDataBySelection } from "../Services/Services";
import AppButton from "../components/Generic/AppButton";
import { AuthContext } from "../Context/AuthProvider";
import AppModal from "../components/Generic/AppModal";
import {
  TASK_STATUS_COLORS,
  TASK_PRIORITY_COLOR,
  STATUS_CHOICES,
} from "../constant";
import { VscDebugStart } from "react-icons/vsc";
import { PiStopCircleBold } from "react-icons/pi";
import { format } from "date-fns";
import AppDropdown from "../components/Generic/AppDropdown";
import { Pagination } from "antd";
import AppTextbox from "../components/Generic/AppTextbox";
import { IoSearchOutline } from "react-icons/io5";

const TaskActivitylist = () => {
  const { user, role } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalActivityVisible, setIsModalActivityVisible] = useState(false);
  const [timers, setTimers] = useState({});
  const [currentTask, setCurrentTask] = useState(null);
  const [form] = Form.useForm();
  const [activityHistory, setActivityHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedTask, setselectedTask] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("InProgress");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let response;

        if (role === "Admin") {
          response = await fetchDataBySelection("taskswithoutstatusComplete");
        } else {
          response = await fetchDataBySelection(
            "tasksByEmployee",
            user?.user_id
          );
        }
        setTasks(response);
      } catch (error) {
        message.error("Failed to fetch tasks.");
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };
    fetchTasks();
  }, [role, user?.user_id]);

  const handleToggleTimer = (taskId) => {
    setTimers((prevTimers) => {
      const isRunning = prevTimers[taskId]?.isRunning;
      if (isRunning) {
        setCurrentTask({ id: taskId, time: prevTimers[taskId].time });
        setIsModalActivityVisible(true);
      }

      const newTimer = {
        isRunning: !isRunning,
        time: isRunning ? prevTimers[taskId].time : 0,
        startTime: isRunning ? null : Date.now(),
      };

      return {
        ...prevTimers,
        [taskId]: newTimer,
      };
    });
  };

  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const searchLower = searchQuery.toLowerCase();

      const matchesQuery =
        task.name.toLowerCase().includes(searchLower) ||
        task.priority?.toLowerCase().includes(searchLower);

      const matchesStatus = selectedStatus
        ? task.status === selectedStatus
        : true;

      return matchesQuery && matchesStatus;
    });
    setFilteredTasks(filtered);
  }, [tasks, searchQuery, selectedStatus]);

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };
  const columns = [
    {
      title: "Activity Name",
      dataIndex: "activity_name",
      key: "activity_name",
    },
    {
      title: "Time Spent",
      dataIndex: "time_spent",
      key: "time_spent",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => {
        return format(new Date(text), "dd/MM/yyyy HH:mm:ss");
      },
    },
  ];
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };
        for (const taskId in updatedTimers) {
          if (updatedTimers[taskId].isRunning) {
            const timeElapsed =
              (Date.now() - updatedTimers[taskId].startTime) / 1000;
            updatedTimers[taskId].time = timeElapsed;
          }
        }
        return updatedTimers;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(Math.floor(seconds % 60)).padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

  const handleViewTaskActivity = (task) => {
    setselectedTask(task);
    setIsModalVisible(true);
    fetchActivityHistory(task.id);
  };

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
  const handleCancel = () => {
    setIsModalVisible(false);

    setIsModalActivityVisible(false);
    setselectedTask(null);
    setCurrentTask(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values) => {
    try {
      const formattedTime = currentTask
        ? formatTime(currentTask.time)
        : "00:00:00";
      const taskActivityData = {
        Activty_name: values.activityName,
        time_spent: formattedTime,
        task_id: currentTask ? currentTask.id : null,
      };
      await addDataBySelection("TaskActivity", taskActivityData);
      message.success("Activity added successfully!");

      await fetchDataBySelection("taskAction_history", currentTask.id);
      setTasks((prevTasks) => {
        return prevTasks.map((task) => {
          if (task.id === currentTask.id) {
            return {
              ...task,
              time_taken: concatenateTime(task.time_taken, formattedTime),
            };
          }
          return task;
        });
      });
    } catch (error) {
      message.error(
        error.response?.data?.detail || "Operation failed. Please try again."
      );
    }
    setIsModalActivityVisible(false);
    form.resetFields();
  };

  const concatenateTime = (oldTime, newTime) => {
    const [oldHours, oldMinutes, oldSeconds] = oldTime.split(":").map(Number);
    const [newHours, newMinutes, newSeconds] = newTime.split(":").map(Number);

    const totalSeconds = oldSeconds + newSeconds;
    const totalMinutes =
      oldMinutes + newMinutes + Math.floor(totalSeconds / 60);
    const totalHours = oldHours + newHours + Math.floor(totalMinutes / 60);

    return `${String(totalHours).padStart(2, "0")}:${String(
      totalMinutes % 60
    ).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
  };

  const taskColumns = [
    {
      title: <span className="tableheader">Task Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span>{text}</span>,
    },
    {
      title: <span className="tableheader">Status</span>,
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={TASK_STATUS_COLORS[status]}>
          {status === "null" ? "N/A" : status}
        </Tag>
      ),
    },
    {
      title: <span className="tableheader">Time Taken</span>,
      dataIndex: "time_taken",
      key: "time_taken",
      align: "center",
      render: (time) => <span>{time || "N/A"}</span>,
    },
    {
      title: <span className="tableheader">Priority</span>,
      dataIndex: "priority",
      key: "priority",
      align: "center",
      render: (priority) => (
        <Tag color={TASK_PRIORITY_COLOR[priority]}>
          {priority === "null" ? "N/A" : priority}
        </Tag>
      ),
    },
    {
      title: <span className="tableheader">Actions</span>,
      key: "actions",
      align: "center",
      render: (text, task) => {
        const timerState = timers[task.id] || {
          isRunning: false,
          time: 0,
        };
        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Tooltip title="View Activity On Task">
              <AppButton
                className={"ActionButton"}
                icon={<EyeOutlined style={{ color: "green" }} />}
                onClick={() => handleViewTaskActivity(task)}
                style={{ marginRight: 8 }}
              />
            </Tooltip>
            <Tooltip
              title={timerState.isRunning ? "Stop Timer" : "Start Timer"}
            >
              {role === "User" && (
                <AppButton
                  className={"ActionButton"}
                  icon={
                    timerState.isRunning ? (
                      <PiStopCircleBold style={{ color: "red" }} />
                    ) : (
                      <VscDebugStart style={{ color: "blue" }} />
                    )
                  }
                  onClick={() => handleToggleTimer(task.id)}
                  style={{ marginRight: 8 }}
                />
              )}
            </Tooltip>
            {timerState.isRunning && formatTime(timerState.time)}
          </div>
        );
      },
    },
  ];

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
              overflowY: "auto",
            }}
          >
            <Row style={{ marginBottom: 8 }}>
              <Col className="right-content">
                <h2 style={{ margin: 2 }}>Task Activity</h2>
              </Col>
            </Row>
            <Row gutter={6} style={{ width: "100%" }}>
              <Col span={5}>
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
              <Col span={15}></Col>
              <Col span={4}>
                <AppDropdown
                  // label="Status"
                  options={STATUS_CHOICES}
                  placeholder="Select Status"
                  labelKey="label"
                  value={selectedStatus}
                  onChange={(value) => setSelectedStatus(value)}
                />
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
                dataSource={paginatedTasks.filter((task) =>
                  selectedStatus ? task.status === selectedStatus : true
                )}
                columns={taskColumns}
                rowKey="id"
                pagination={false}
              />
            )}

            <Row justify="end" style={{ marginTop: "17px" }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={tasks.length}
                onChange={handlePageChange}
                pageSizeOptions={["1", "4", "7", "10", "20", "50"]}
                showSizeChanger
              />
            </Row>
          </Card>
        </Col>
      </Row>

      <AppModal visible={isModalVisible} onCancel={handleCancel} size="medium">
        <h2>Activity History - {selectedTask?.name}(Task)</h2>

        <Table
          dataSource={activityHistory}
          columns={columns}
          loading={loadingHistory}
          rowKey="id"
        />
      </AppModal>
      <AppModal
        visible={isModalActivityVisible}
        onCancel={handleCancel}
        size="medium"
      >
        <Form form={form} onFinish={handleFormSubmit}>
          <Row>
            <Col xs={24}>
              <h2>Add Activity</h2>
            </Col>
          </Row>

          <Form.Item
            label="Activity Name"
            name="activityName"
            rules={[{ required: true, message: "Please enter activity name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Time Taken">
            <Input
              value={currentTask ? formatTime(currentTask.time) : ""}
              disabled
            />
          </Form.Item>

          <Form.Item>
            <AppButton type="primary" htmlType="submit" label={"Save"} />
          </Form.Item>
        </Form>
      </AppModal>
    </>
  );
};

export default TaskActivitylist;
