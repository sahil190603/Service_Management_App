import React, { useContext, useEffect } from "react";
import { Row, Col, Card, message, Form, Input, DatePicker } from "antd";
import moment from "moment";
import AppButton from "../components/Generic/AppButton";
import { AuthContext } from "../Context/AuthProvider";
import {
  updateDataBySelection,
  addDataBySelection,
} from "../Services/Services";
import { PROJECT_STATUS } from "../constant";
import AppDropdown from "../components/Generic/AppDropdown";

const CreateProject = ({
  projectData,
  isViewMode = false,
  isUpdateMode = false,
  closeModal,
}) => {
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);
  const [selectedStatus, setSelectedStatus] = React.useState(null);
  const [timeTaken, setTimeTaken] = React.useState(null);

  useEffect(() => {
    if (projectData) {
      form.setFieldsValue({
        name: projectData.name,
        description: projectData.description,
        start_date: moment(projectData.start_date),
        end_date: moment(projectData.end_date),
        status: projectData.status,
      });
      setSelectedStatus(projectData.status);
      setTimeTaken(projectData.time_taken);
    }
  }, [projectData, form]);

  const disablePastDates = (current) => {
    return current && current < moment().startOf("day");
  };

  const handleSubmit = async (values) => {
    const start_date = values.start_date.toISOString();
    const end_date = values.end_date.toISOString();
    const formattedValues = {
      ...values,
      start_date,
      end_date,
      status: selectedStatus ? selectedStatus : "Started",
      created_by: user?.user_id,
    };

    try {
      if (isUpdateMode) {
        await updateDataBySelection("project", projectData.id, formattedValues);
        message.success("Project updated successfully");
      } else {
        await addDataBySelection("project", formattedValues);
        message.success("Project created successfully");
        form.resetFields();
      }
      closeModal();
    } catch (error) {
      message.error(
        error.response?.data?.detail || "Operation failed. Please try again."
      );
    }
  };

  return (
    <Row justify="center" align="middle" >
      <Col xs={24} sm={20} md={24} lg={24}>
        <Card
          className="scroll-xy-continer"
          style={{ border: "none"}}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: "",
              description: "",
              start_date: null,
              end_date: null,
            }}
          >
            <h2 className="text-center">
              {isViewMode
                ? "View Project Details"
                : isUpdateMode
                ? "Update Project"
                : "Project Creation Form"}
            </h2>

            <Form.Item
              label="Project Name"
              name="name"
              rules={[
                {
                  required: !isViewMode,
                  message: "Please enter the project name",
                },
              ]}
            >
              <Input placeholder="Project Name" disabled={isViewMode} />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                {
                  required: !isViewMode,
                  message: "Please enter the project description",
                },
              ]}
            >
              <Input.TextArea
                placeholder="Project Description"
                disabled={isViewMode}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Start Date"
                  name="start_date"
                  style={{ display: "flex" }}
                  rules={[
                    {
                      required: !isViewMode,
                      message: "Please select the start date",
                    },
                  ]}
                >
                  <DatePicker
                    format="YYYY-MM-DD"
                    disabledDate={disablePastDates}
                    disabled={isViewMode}
                    onChange={() => {
                      form.validateFields(["end_date"]);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="End Date"
                  name="end_date"
                  style={{ display: "flex" }}
                  rules={[
                    {
                      required: !isViewMode,
                      message: "Please select the end date",
                    },
                    {
                      validator: (_, value) => {
                        const startDate = form.getFieldValue("start_date");
                        if (!value || !startDate) {
                          return Promise.resolve();
                        }
                        return value.isBefore(startDate)
                          ? Promise.reject(
                              new Error("End date must be after start date")
                            )
                          : Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker
                    format="YYYY-MM-DD"
                    disabled={isViewMode}
                    disabledDate={disablePastDates}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              {isViewMode | isUpdateMode ? (
                <Col xs={24} sm={12}>
                  <Form.Item label="Status">
                    <AppDropdown
                      options={PROJECT_STATUS}
                      placeholder="Select Status"
                      labelKey="label"
                      value={selectedStatus}
                      onChange={(value) => setSelectedStatus(value)}
                      disabled={isViewMode}
                    />
                  </Form.Item>
                </Col>
              ) : null}

              {isViewMode ? (
                <Col xs={24} sm={12}>
                  <Form.Item label="Time Taken">
                    <Input
                      value={timeTaken ? `${timeTaken} hr` : "N/A"}
                      disabled
                    />
                  </Form.Item>
                </Col>
              ): null}
            </Row>

            {!isViewMode ? (
              <Form.Item style={{ textAlign: "right" ,marginTop:'20px'}}>
                <AppButton
                  htmlType="submit"
                  type="primary"
                  label={isUpdateMode ? "Update Project" : "Create Project"}
                />
              </Form.Item>
            ) : null}
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default CreateProject;
