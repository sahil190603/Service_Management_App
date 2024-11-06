import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../Context/AuthProvider";
import { Form, Card, Row, Col, message, Alert } from "antd";
import AppButton from "../components/Generic/AppButton";
import AppTextbox from "../components/Generic/AppTextbox";
import { useNavigate } from "react-router-dom";
import '../Style/login.css';
import { FaRegUser } from "react-icons/fa";
import { IoLockClosedOutline } from "react-icons/io5";

const Login = () => {
  const { setUser, setToken, setIsAuth, setRole } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/authapp/login/",
        values
      );
      const { access } = response.data;
      const tokenPayload = JSON.parse(atob(access.split(".")[1]));

      setUser(tokenPayload);
      setToken(access);
      setIsAuth(true);
      setRole(tokenPayload.role);

      localStorage.setItem("authTokens", access);
      localStorage.setItem("userDetails", JSON.stringify(tokenPayload));

      if (tokenPayload.role === "Admin") {
        message.success("Admin logged in successfully!");
        navigate("/project");
      } else {
        message.success("Employee logged in successfully!");
        navigate("/task");
      }
    } catch (error) {
      setErrorMessage("Wrong email or password. Please try again.");
      form.resetFields();
    }
  };

  return (
    <div style={{ marginTop: "100px" }}>
      <Row justify="space-around" align="middle">
        <Col xs={24} sm={10} lg={8}>
          <Card className="login-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="my-4"
            >
              <h2 className="gradient-text">Welcome back, User!</h2>
              {errorMessage && (
                <Alert
                  message={errorMessage}
                  type="error"
                  showIcon
                  style={{ marginBottom: "20px" }}
                />
              )}
              <AppTextbox
                prefix={<FaRegUser style={{ color:'black'}}/>}
                label="Email"
                name="email"
                placeholder="Enter Your Email"
                type="text"
                rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
              
              />
              <AppTextbox
                prefix={<IoLockClosedOutline style={{ color:'black' , fontSize:"16px"}}/>}
                label="Password"
                name="password"
                placeholder="Password"
                type="password"
                rules={[{ required: true, message: "Please enter your password" }]}
                onPaste={(e) => e.preventDefault()}
              />
              <Form.Item>
                <AppButton
                  type="primary"
                  htmlType="submit"
                  label="Login"
                  block
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
