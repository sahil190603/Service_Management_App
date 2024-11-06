import React, { useEffect } from "react";
import { Row, Col, Card, message, Form, Input } from "antd";
import AppButton from "../components/Generic/AppButton";
import {
  updateDataBySelection,
  addDataBySelection,
} from "../Services/Services";

const Register = ({ employee, mode, onSuccess }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if ((mode === "edit" || mode === "view") && employee) {
      form.setFieldsValue({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        contact_no: employee.contact_no,
        password: employee.password,
      });
    } else {
      form.resetFields();
    }
  }, [employee, mode, form]);

  const handleSubmit = async (values) => {
    try {
      if (mode === "edit" && employee) {
        await updateDataBySelection("employee", employee.id, values);
        message.success("Employee updated successfully");
      } else {
        await addDataBySelection("employee", values);
        message.success("Employee registered successfully");
      }

      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      let errorMessage;
      if (error.response && error.response.data) {
        if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data.join(", ");
        } else if (typeof error.response.data === "object") {
          errorMessage = Object.values(error.response.data).join(", ");
        } else {
          errorMessage = error.response.data;
        }
      } else {
        errorMessage = "Operation failed. Please try again.";
      }

      message.error(errorMessage);
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
              first_name: "",
              last_name: "",
              email: "",
              contact_no: "",
              password: "",
            }}
          >
            <h2 className="text-center">
              {mode === "view"
                ? "View Employee Details"
                : mode === "edit"
                ? "Update Employee"
                : "Employee Registration Form"}
            </h2>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="first_name"
                  rules={[
                    { required: true, message: "Please enter the first name" },
                    {
                      pattern: /^[A-Za-z]+$/,
                      message:
                        "First name must contain only letters and no spaces",
                    },
                  ]}
                >
                  <Input placeholder="First Name" disabled={mode === "view"} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="last_name"
                  rules={[
                    { required: true, message: "Please enter the last name" },
                    {
                      pattern: /^[A-Za-z]+$/,
                      message:
                        "Last name must contain only letters and no spaces",
                    },
                  ]}
                >
                  <Input placeholder="Last Name" disabled={mode === "view"} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter a valid email",
                },
              ]}
            >
              <Input placeholder="Email" disabled={mode === "view"} />
            </Form.Item>

            <Form.Item
              label="Contact Number"
              name="contact_no"
              rules={[
                { required: true, message: "Please enter the contact number" },
                {
                  pattern: /^\d{10}$/,
                  message:
                    "Contact number must be exactly 10 digits and contain no spaces or letters",
                },
              ]}
            >
              <Input
                placeholder="Contact Number"
                disabled={mode === "view"}
                maxLength={10}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter a password" },
                {
                  min: 6,
                  message: "Password must be at least 6 characters",
                },
                {
                  pattern: /^(?=.*[A-Z])(?=.*[@#$%^&+=]).{6,}$/,
                  message:
                    "Password must contain at least one capital letter and one special character",
                },
              ]}
            >
              <Input.Password
                placeholder="Password"
                disabled={mode === "view"}
              />
            </Form.Item>

            {mode !== "view" && (
              <Form.Item style={{ textAlign:"right"  , marginTop:'20px'}}>
                <AppButton
                  htmlType="submit"
                  type="primary"
                  label={
                    mode === "edit" ? "Update Employee" : "Register Employee"
                  }
                />
              </Form.Item>
            )}
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default Register;
