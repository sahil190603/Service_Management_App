import { Form, Input,  message, DatePicker, Card, Col, Row } from "antd";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Leave_type } from "../constant";
import { AuthContext } from "../Context/AuthProvider";
import { format } from "date-fns";
import AppDropdown from "../components/Generic/AppDropdown";
import moment from "moment";
import AppButton from "../components/Generic/AppButton";

const LeaveRequestForm = ({ onFormSubmit, initialValues, mode}) => {
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);


  useEffect(() => {
    if (initialValues) {
      setStartDate(new Date(initialValues.start_date));
      setEndDate(new Date(initialValues.end_date));
      form.setFieldsValue({
        leave_type: initialValues.leave_type,
        start_date: moment(initialValues.start_date), 
        end_date: moment(initialValues.end_date), 
        reason: initialValues.reason,
        status: initialValues.status,
      });
    } else {
      form.resetFields();
      setStartDate(null);
      setEndDate(null);
    }
  }, [initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        start_date: format(values.start_date, "yyyy-MM-dd"),
        end_date: format(values.end_date, "yyyy-MM-dd"),
        user: user?.user_id,
      };

      if (initialValues) {
        await axios.put(
          `http://localhost:8000/LeaveManagement/leave-request/${initialValues.id}/`,
          formattedValues
        );
        message.success("Leave request updated successfully");
      } else {
        await axios.post(
          `http://localhost:8000/LeaveManagement/leave-request/`,
          formattedValues
        );
        message.success("Leave request created successfully");
      }

      onFormSubmit(formattedValues);
      form.resetFields();
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          message.error(errorData.detail);
        } else {
          message.error("Failed to submit the leave request");
        }
      } else {
        message.error("Failed to submit the leave request");
      }
    }
  };

  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };


  const validateDates = (_, value) => {
    if (!value || !startDate || !endDate) {
      return Promise.resolve();
    }
    if (startDate && endDate && startDate > endDate) {
      return Promise.reject(new Error('Start date must be before end date'));
    }
    return Promise.resolve();
  };

  return (
    <Row justify="center" align="middle" >
    <Col xs={24} sm={20} md={24} lg={24}>
      <Card
        className="scroll-xy-continer"
        style={{ border : "none"}}
      >
     <h2>{mode === "create" ? "Create Leave Request" : "Update Leave Request"}</h2>
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <AppDropdown
        label="Leave Type"
        name="leave_type"
        options={Leave_type}
        placeholder="Select Leave Type"
        labelKey="label"
        valueKey="value"
        rules={[{ required: true, message: "Please select a leave type" }]}
      />

      <Form.Item
        label="Start Date"
        name="start_date"
        rules={[
          { required: true, message: "Please select a start date" },
          { validator: validateDates }
        ]}
      >
        <DatePicker
          selected={startDate}
          onChange={(date) => {
            setStartDate(date);
            form.setFieldsValue({ start_date: date });
          }}
          disabledDate={disabledDate}
          format="YYYY-MM-DD"
          placeholder="Select Start Date"
        />
      </Form.Item>

      <Form.Item
        label="End Date"
        name="end_date"
        rules={[
          { required: true, message: "Please select an end date" },
          { validator: validateDates }
        ]}
      >
        <DatePicker
          selected={endDate}
          onChange={(date) => {
            setEndDate(date);
            form.setFieldsValue({ end_date: date });
          }}
          disabledDate={disabledDate}
          format="YYYY-MM-DD"
          placeholder="Select End Date"
        />
      </Form.Item>

      <Form.Item
        label="Reason"
        name="reason"
        rules={[{ required: true, message: "Please provide a reason" }]}
      >
        <Input.TextArea rows={3} placeholder="Enter reason" />
      </Form.Item>

      <Form.Item style={{ marginTop: "20px" , textAlign:"right"}}>
        <AppButton type="primary" htmlType="submit" style={{borderRadius:0}} label={initialValues ? "Update Leave Request" : "Submit Leave Request"}/>
      </Form.Item>
    </Form>
    </Card>
    </Col>
    </Row>
  );
};

export default LeaveRequestForm;
