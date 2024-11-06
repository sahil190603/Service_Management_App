import React, { useEffect, useContext, useState } from "react";
import {
  Row,
  Col,
  Card,
  message,
  Form,
  Input,
  DatePicker,
  Select,
  Tooltip,
} from "antd";
import moment from "moment";
import AppButton from "../components/Generic/AppButton";
import { AuthContext } from "../Context/AuthProvider";
import {
  addDataBySelection,
  fetchDataBySelection,
  updateDataBySelection,
} from "../Services/Services";
import axios from "axios";

const CreateTask = (
  {
    taskData,
    isViewMode = false,
    isUpdateMode = false,
    closeModal,
    onTaskCreated,
  },
  ref
) => {
  const [form] = Form.useForm();

  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployess] = useState([]);
  const [selectedAssign, setSelectedAssign] = useState(null);
  const [timeTaken, setTimeTaken] = useState(null);
  const [UserApproveleave, setUserApproveleave] = useState([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetchDataBySelection("projectswithoutcompelete");
        setProjects(response);
      } catch (error) {
        message.error("Failed to fetch projects. Please try again.");
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    const loademployee = async () => {
      try {
        const response = await fetchDataBySelection("allEmployees");
        setEmployess(response);
      } catch (error) {
        message.error("Failed to fetch employees. Please try again.");
      }
    };
    loademployee();
  }, []);

  useEffect(() => {
    if (taskData) {
      form.setFieldsValue({
        name: taskData.name,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        percentage_completed: taskData.percentage_completed,
        start_time: taskData.start_time ? moment(taskData.start_time) : null,
        end_time: taskData.end_time ? moment(taskData.end_time) : null,
        project: taskData.project,
        assigned_to: taskData.assigned_to,
      });

      setSelectedAssign(taskData.assigned_to ?? null);
      setTimeTaken(taskData.time_taken);
    } else {
      form.resetFields();
    }
  }, [taskData, form]);

  const fetchaprrovedLeaveOfUser = async () => {
    if (selectedAssign !== null && selectedAssign !== undefined) {
      const response = await axios.get(
        `http://localhost:8000/LeaveManagement/approved_leave_requests_by_user/?userId=${selectedAssign}`
      );
      setUserApproveleave(response.data);
    }
  };
  useEffect(() => {
    fetchaprrovedLeaveOfUser();
  }, [selectedAssign]);

  const disableDates = (current) => {
    if (current.isBefore(moment().startOf("day"))) {
      return true;
    }

    if (!UserApproveleave || UserApproveleave.length === 0) {
      return false;
    }
    const disabledDates = [];

    UserApproveleave.forEach((request) => {
      const start = moment(request.start_date);
      const end = moment(request.end_date);
      let date = start.clone();

      while (date.isSameOrBefore(end)) {
        disabledDates.push(date.format("YYYY-MM-DD"));
        date.add(1, "days");
      }
    });

    return disabledDates.includes(current.format("YYYY-MM-DD"));
  };

  const handleSubmit = async (values) => {
    const formattedValues = {
      ...values,
      created_by: user?.user_id,
    };

    const updatePayload = {
      ...formattedValues,
      start_time: values.start_time ? values.start_time.toISOString() : null,
      end_time: values.end_time ? values.end_time.toISOString() : null,
      assigned_to: selectedAssign,
    };
    try {
      if (isUpdateMode && taskData?.id) {
        await updateDataBySelection("task", taskData.id, updatePayload);
        message.success("Task updated successfully");
      } else {
        await addDataBySelection("task", formattedValues);
        message.success("Task created successfully");
      }
      form.resetFields();
      closeModal();
      if (onTaskCreated) onTaskCreated();
    } catch (error) {
      message.error(
        error.response?.data?.detail || "Operation failed. Please try again."
      );
    }
  };

  return (
    <Row justify="center" align="middle">
      <Col xs={24} sm={20} md={24} lg={24}>
        <Card className="scroll-xy-continer" style={{ border: "none" }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: "",
              description: "",
              priority: "",
              status: "",
              percentage_completed: "",
              start_time: "",
              end_time: "",
              project: null,
            }}
          >
            <h2 className="text-center">
              {isViewMode
                ? "View Task Details"
                : isUpdateMode
                ? "Update Task"
                : "Task Creation Form"}
            </h2>

            <Form.Item
              label="Task Name"
              name="name"
              rules={[
                { required: true, message: "Please enter the task name" },
              ]}
            >
              <Input placeholder="Task Name" disabled={isViewMode} />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea
                placeholder="Task Description"
                disabled={isViewMode}
              />
            </Form.Item>

            {(isUpdateMode || isViewMode) && (
              <>
                {isUpdateMode || isViewMode ? (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Priority" name="priority">
                        <Select
                          placeholder="Select Priority"
                          disabled={isViewMode}
                          allowClear
                        >
                          <Select.Option value="High">High</Select.Option>
                          <Select.Option value="Urgent">Urgent</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Status" name="status">
                        <Select
                          placeholder="Select Status"
                          disabled={isViewMode}
                          allowClear
                        >
                          <Select.Option value="NotStarted">
                            Not Started
                          </Select.Option>
                          <Select.Option value="InProgress">
                            In Progress
                          </Select.Option>
                          <Select.Option value="Completed">
                            Completed
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                ) : null}
              </>
            )}

            {isViewMode ? (
              <Form.Item
                label="Percentage Completed"
                name="percentage_completed"
                rules={[
                  {
                    required: true,
                    message: "Please enter the percentage completed",
                  },
                ]}
              >
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Percentage Completed"
                  disabled={isViewMode}
                />
              </Form.Item>
            ) : null}
            <Row gutter={16}>
              <Col span={!isUpdateMode & !isViewMode ? 24 : 12}>
                <Form.Item
                  label="Project"
                  name="project"
                  rules={[
                    {
                      required: !isViewMode,
                      message: "Please select a project",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select Project"
                    disabled={isViewMode}
                    allowClear
                    showSearch
                  >
                    {projects.map((project) => (
                      <Select.Option key={project.id} value={project.id}>
                        {project.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              {isViewMode | isUpdateMode ? (
                <Col span={12}>
                  <Form.Item
                    label="Assigned To"
                    name="assigned_to"
                    rules={[
                      {
                        required: true,
                        message: "Please select the Assigned To filed.",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Assigned To"
                      value={selectedAssign}
                      onChange={(value) => setSelectedAssign(value)}
                      disabled={isViewMode}
                      allowClear
                    >
                      {employees.map((employee) => (
                        <Select.Option key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              ) : null}
            </Row>

            {isViewMode || isUpdateMode ? (
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Tooltip
                    title={
                      !selectedAssign
                        ? "Please select an assigned user first."
                        : ""
                    }
                  >
                    <Form.Item
                      label="Start Date"
                      name="start_time"
                      style={{ display: "flex" }}
                      rules={[
                        {
                          required: true,
                          message: "Please select the start date",
                        },
                      ]}
                    >
                      <DatePicker
                        format="YYYY-MM-DD"
                        disabledDate={disableDates}
                        disabled={
                          isViewMode || (isUpdateMode && !selectedAssign)
                        }
                        onChange={() => {
                          form.validateFields(["end_time"]);
                        }}
                      />
                    </Form.Item>
                  </Tooltip>
                </Col>
                <Col xs={24} sm={12}>
                  <Tooltip
                    title={
                      !selectedAssign
                        ? "Please select an assigned user first."
                        : ""
                    }
                  >
                    <Form.Item
                      label="End Date"
                      name="end_time"
                      style={{ display: "flex" }}
                      rules={[
                        {
                          required: true,
                          message: "Please select the end date",
                        },
                        {
                          validator: (_, value) => {
                            const startDate = form.getFieldValue("start_time");
                            if (!value || !startDate) {
                              return Promise.resolve();
                            }
                            return value.isAfter(startDate)
                              ? Promise.resolve()
                              : Promise.reject(
                                  new Error("End date must be after start date")
                                );
                          },
                        },
                      ]}
                    >
                      <DatePicker
                        format="YYYY-MM-DD"
                        disabled={
                          isViewMode || (isUpdateMode && !selectedAssign)
                        }
                        disabledDate={disableDates}
                        onChange={() => {
                          form.validateFields(["end_time"]);
                        }}
                      />
                    </Form.Item>
                  </Tooltip>
                </Col>
              </Row>
            ) : null}

            {isViewMode && (
              <Col xs={24} sm={12}>
                <Form.Item label="Time Taken">
                  <Input
                    value={timeTaken ? `${timeTaken} hr` : "N/A"}
                    disabled
                  />
                </Form.Item>
              </Col>
            )}
            {/* </Row>
            ) : null} */}
            {!isViewMode && (
              <Form.Item style={{ marginTop: "25px", textAlign: "right" }}>
                <AppButton
                  htmlType="submit"
                  type="primary"
                  label={isUpdateMode ? "Update Task" : "Create Task"}
                />
              </Form.Item>
            )}
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default CreateTask;
