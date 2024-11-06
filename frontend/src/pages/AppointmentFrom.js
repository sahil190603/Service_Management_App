import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Card, Form, Input, DatePicker, message } from "antd";
import moment from "moment";
import AppButton from "../components/Generic/AppButton";
import { AuthContext } from "../Context/AuthProvider";
import {
  addDataBySelection,
  updateDataBySelection,
} from "../Services/Services";
import AppDropdown from "../components/Generic/AppDropdown";
import { APPOINTMENT_ADMIN_STATUS_CHOICE } from "../constant";

const AppointmentForm = ({
  appointmentData,
  isViewMode = false,
  isUpdateMode = false,
  closeModal,
  onRefreshAppointments,
}) => {
  const [form] = Form.useForm();
  const { user, role } = useContext(AuthContext);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    if (appointmentData) {
      form.setFieldsValue({
        name: appointmentData.name,
        description: appointmentData.description,
        start_time: moment(appointmentData.start_time),
        end_time: moment(appointmentData.end_time),
      });
      setSelectedStatus(appointmentData.status);
    } else {
      form.resetFields();
      setSelectedStatus(null);
    }
  }, [appointmentData, form]);

  const handleSubmit = async (values) => {
    const start_time = values.start_time.toISOString();
    const end_time = values.end_time.toISOString();

    let formattedValues = {
      ...values,
      start_time,
      end_time,
    };

    if (role === "Admin" && !isUpdateMode) {
      formattedValues = {
        ...formattedValues,
        status: "Accepted",
        admin: user?.user_id,
      };
    }
    if (role === "User" && !isUpdateMode) {
      formattedValues = {
        ...formattedValues,
        status: "Pending",
        creator: user?.user_id,
      };
    }
    if (role === "Admin" && isUpdateMode) {
      formattedValues = {
        ...formattedValues,
        status: selectedStatus,
      };
    } else {
      formattedValues = {
        ...formattedValues,
      };
    }

    try {
      if (isUpdateMode) {
        await updateDataBySelection(
          "appointments",
          appointmentData.id,
          formattedValues
        );
        message.success("Appointment updated successfully");
      } else {
        await addDataBySelection("appointments", formattedValues);
        message.success("Appointment created successfully");
        form.resetFields();
      }
      onRefreshAppointments();
      closeModal();
    } catch (error) {
      message.error(
        error.response?.data?.detail || "Operation failed. Please try again."
      );
    }
  };

  const disablePastDates = (current) => {
    return current && current < moment().startOf("day");
  };

  const timeDisabled = (current) => {
    return disablePastDates(current);
  };

  return (
    <Row justify="center" align="middle" >
      <Col xs={24} sm={20} md={24} lg={24}>
        <Card
          className="scroll-xy-continer"
          style={{ border : "none"}}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: "",
              description: "",
              start_time: null,
              end_time: null,
            }}
          >
            <h2 className="text-center">
              {isViewMode
                ? "View Appointment Details"
                : isUpdateMode
                ? "Update Appointment"
                : "Appointment Creation Form"}
            </h2>

            <Form.Item
              label="Appointment Name"
              name="name"
              rules={[
                {
                  required: !isViewMode,
                  message: "Please enter the appointment name",
                },
              ]}
            >
              <Input placeholder="Appointment Name" disabled={isViewMode} />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                {
                  required: !isViewMode,
                  message: "Please enter the appointment description",
                },
              ]}
            >
              <Input.TextArea
                placeholder="Appointment Description"
                disabled={isViewMode}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Start Time"
                  name="start_time"
                  rules={[
                    {
                      required: !isViewMode,
                      message: "Please select the start time",
                    },
                  ]}
                >
                  <DatePicker
                    showTime={{
                      format: "HH:mm",
                      hideDisabledOptions: true,
                      disabledHours: () =>
                        Array.from({ length: 24 }, (v, k) => k).filter(
                          (h) => h < 9 || h > 19
                        ),
                      disabledMinutes: () => [],
                    }}
                    format="YYYY-MM-DD hh:mm A"
                    disabledDate={disablePastDates}
                    disabled={isViewMode}
                    disabledTime={timeDisabled}
                    onChange={(date) => {
                      form.validateFields(["end_time"]);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="End Time"
                  name="end_time"
                  rules={[
                    {
                      required: !isViewMode,
                      message: "Please select the end time",
                    },
                    {
                      validator: (_, value) => {
                        const startTime = form.getFieldValue("start_time");
                        if (!startTime || !value) {
                          return Promise.resolve(); 
                        }
                        return value.isAfter(startTime)
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("End time must be after start time")
                            );
                      },
                    },
                  ]}
                >
                  <DatePicker
                    showTime={{
                      format: "HH:mm",
                      hideDisabledOptions: true,
                      disabledHours: () =>
                        Array.from({ length: 24 }, (v, k) => k).filter(
                          (h) => h < 9 || h > 19
                        ),
                      disabledMinutes: () => [],
                    }}
                    format="YYYY-MM-DD hh:mm A"
                    disabledDate={disablePastDates}
                    disabled={isViewMode}
                    disabledTime={timeDisabled}
                  />
                </Form.Item>
              </Col>
            </Row>

            {role === "Admin" ? (
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Select Status">
                    <AppDropdown
                      options={APPOINTMENT_ADMIN_STATUS_CHOICE}
                      placeholder="Select Status"
                      labelKey="label"
                      value={selectedStatus}
                      onChange={(value) => setSelectedStatus(value)}
                      disabled={isViewMode}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ): null}

            {!isViewMode ? (
              <Form.Item style={{  textAlign:'right'}}>
                <AppButton
                  htmlType="submit"
                  type="primary"
                  label={
                    isUpdateMode ? "Update Appointment" : "Create Appointment"
                  }
                />
              </Form.Item>
            ): null}
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default AppointmentForm;
