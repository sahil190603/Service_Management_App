import React, { useContext, useEffect, useState } from "react";
import { HomeOutlined } from "@ant-design/icons";
import { Layout, Menu, message, Modal, Row, Col, Button } from "antd";
import { AuthContext } from "../../Context/AuthProvider";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import MainRoute from "../../Route/MainRoute";
import { IoPersonOutline } from "react-icons/io5";
import { GrTask } from "react-icons/gr";
import { SiHelpdesk } from "react-icons/si";
import { RxActivityLog } from "react-icons/rx";
import { LuCalendarX2 } from "react-icons/lu";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { IoIosTimer } from "react-icons/io";
import { BiTransferAlt } from "react-icons/bi";

const { Header, Content, Sider } = Layout;

const Layouts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser, role } = useContext(AuthContext) ?? {};
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const showLogoutModal = () => {
    setIsLogoutModalVisible(true);
  };

  const handleLogoutConfirm = () => {
    setIsLogoutModalVisible(false);
    logoutUser();
    message.success("You have been logged out.");
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalVisible(false);
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const getSelectedKey = () => {
    if (location.pathname === "/project") {
      return "1";
    } else if (location.pathname === "/employee") {
      return "2";
    } else if (location.pathname === "/task") {
      return "3";
    } else if (location.pathname === "/help-desk") {
      return "4";
    } else if (location.pathname === "/activity") {
      return "5";
    } else if (location.pathname === "/appointment") {
      return "7";
    } else if (location.pathname === "/dashboard") {
      return "8";
    } else if (location.pathname === "/planning") {
      return "9";
    } else if (location.pathname === "/task-tansfer") {
      return "10";
    } else if (location.pathname === "/leave-Manage") {
      return "11";
    } else {
      return "1";
    }
  };

  if (isLoading) return "Loading...";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          position: "fixed",
          width: "100%",
          zIndex: 1,
          backgroundColor:"#0958d9",
          display: "flex",
          alignItems: "center",
          padding: "0 37px"
        }}
      >
        <Row justify="start" >
        <div  style={{ fontSize: "17px", color:'white'}}>
          <h3>Service Management</h3>
        </div>
        </Row>
        {user && (
          <Row justify="end" style={{ flex: 1 }}>
            <FaUserCircle
              style={{ color: "white", fontSize: "22px", marginTop: "20px" }}
            />

            <Col style={{ paddingLeft: "10px" }}>
              <div
                style={{
                  fontSize: "17px",
                  color:"white"
                }}
              >
                {user?.first_name} {user?.last_name}
              </div>
            </Col>
            <Col style={{ paddingLeft: "10px" }}>
              <Button className="Log-Out"  onClick={showLogoutModal}>Logout</Button>
            </Col>
          </Row>
        )}
      </Header>
      <Layout style={{ marginTop: 64 }}>
        {user && (
          <Sider
            width={186}
            style={{
              height: "100vh",
              position: "fixed",
              left: 0,
            }}
          >
            <Menu
              theme="white"
              selectedKeys={[getSelectedKey()]}
              mode="inline"
              style={{ backgroundColor: "#f0f5ff", height: "100%" }}
            >
              <Menu.Item
                key={8}
                icon={
                  <MdOutlineSpaceDashboard
                    style={{ color:getSelectedKey() ==="8" ?"white":"#faad14", fontSize: "17px" }}
                  />
                }
                onClick={() => navigate("/dashboard")}
                style={{
                  background:
                    getSelectedKey() === "8" ? "#0958d9" : "inherit",
                  color: getSelectedKey() === "8" ? "whitesmoke" : "inherit",
                  borderRadius:"4px"
                }}
              >
                Dashboard
              </Menu.Item>
              {role === "Admin" && (
                <Menu.Item
                  key={1}
                  icon={
                    <HomeOutlined
                      style={{ color:getSelectedKey() ==="1" ?"white": "#08979c", fontSize: "17px" }}
                    />
                  }
                  onClick={() => navigate("/project")}
                  style={{
                    background:
                      getSelectedKey() === "1" ? "#0958d9" : "inherit",
                    color: getSelectedKey() === "1" ? "whitesmoke" : "inherit",
                    borderRadius:"4px"
                  }}
                >
                  Project
                </Menu.Item>
              )}

              {role === "Admin" && (
                <Menu.Item
                  key={2}
                  icon={
                    <IoPersonOutline
                      style={{ color:getSelectedKey() ==="2" ?"white": "#1677ff", fontSize: "17px" }}
                    />
                  }
                  onClick={() => navigate("/employee")}
                  style={{
                    background:
                      getSelectedKey() === "2" ? "#0958d9" : "inherit",
                    color: getSelectedKey() === "2" ? "whitesmoke" : "inherit",
                    borderRadius:"4px"
                  }}
                >
                  Employee
                </Menu.Item>
              )}
              <Menu.Item
                key={3}
                icon={
                  <GrTask style={{ color:getSelectedKey() ==="3" ?"white": "lightgreen", fontSize: "17px" }} />
                }
                onClick={() => navigate("/task")}
                style={{
                  background:
                    getSelectedKey() === "3" ? "#0958d9" : "inherit",
                  color: getSelectedKey() === "3" ? "whitesmoke" : "inherit",
                  borderRadius:"4px"
                }}
              >
                Task
              </Menu.Item>

              {role === "User" && (
                <Menu.Item
                  key={5}
                  icon={
                    <RxActivityLog
                      style={{ color:getSelectedKey() ==="5" ? "white": "#2f54eb", fontSize: "17px" }}
                    />
                  }
                  onClick={() => navigate("/activity")}
                  style={{
                    background:
                      getSelectedKey() === "5" ? "#0958d9" : "inherit",
                    color: getSelectedKey() === "5" ? "whitesmoke" : "inherit",
                    borderRadius:"4px"
                  }}
                >
                  Task Activity
                </Menu.Item>
              )}
              <Menu.Item
                key={10}
                icon={
                  <BiTransferAlt
                    style={{ color:getSelectedKey() ==="10" ?"white":"#d4380d", fontSize: "17px" }}
                  />
                }
                onClick={() => navigate("/task-tansfer")}
                style={{
                  background:
                    getSelectedKey() === "10" ? "#0958d9" : "inherit",
                  color: getSelectedKey() === "10" ? "whitesmoke" : "inherit",
                  borderRadius:"4px"
                }}
              >
                Task Transfer
              </Menu.Item>
              {role === "Admin" && (
                <Menu.Item
                  key={9}
                  icon={
                    <IoIosTimer
                      style={{ color:getSelectedKey() ==="9" ?"white": "#fa8c16", fontSize: "17px" }}
                    />
                  }
                  onClick={() => navigate("/planning")}
                  style={{
                    background:
                      getSelectedKey() === "9" ? "#0958d9" : "inherit",
                    color: getSelectedKey() === "9" ? "whitesmoke" : "inherit",
                    borderRadius:"4px"
                  }}
                >
                  Planning
                </Menu.Item>
              )}
              <Menu.Item
                key={7}
                icon={
                  <RiCalendarScheduleLine
                    style={{ color:getSelectedKey() ==="7" ?"white":"#13c2c2", fontSize: "17px" }}
                  />
                }
                onClick={() => navigate("/appointment")}
                style={{
                  background:
                    getSelectedKey() === "7" ? "#0958d9" : "inherit",
                  color: getSelectedKey() === "7" ? "whitesmoke" : "inherit",
                  borderRadius:"4px"
                }}
              >
                Appointment
              </Menu.Item>
              <Menu.Item
                key={11}
                icon={
                  <LuCalendarX2
                    style={{ color:getSelectedKey() ==="11" ?"white": "#f5222d", fontSize: "17px" }}
                  />
                }
                onClick={() => navigate("/leave-Manage")}
                style={{
                  background:
                    getSelectedKey() === "11" ? "#0958d9" : "inherit",
                  color: getSelectedKey() === "11" ? "whitesmoke" : "inherit",
                  borderRadius:"4px"
                }}
              >
                Leave Manage
              </Menu.Item>
              {role === "Admin" && (
                <Menu.Item
                  key={4}
                  icon={
                    <SiHelpdesk
                      style={{color:getSelectedKey() ==="4" ?"white":"#eb2f96", fontSize: "17px" }}
                    />
                  }
                  onClick={() => navigate("/help-desk")}
                  style={{
                    background:
                      getSelectedKey() === "4" ? "#0958d9" : "inherit",
                    color: getSelectedKey() === "4" ? "whitesmoke" : "inherit",
                    borderRadius:"4px"
                  }}
                >
                  Help Desk
                </Menu.Item>
              )}
            </Menu>
          </Sider>
        )}
        <Layout
          style={{
            marginLeft: user ? 186 : 0,
            padding: "0 10px 10px",
            background: 'white',
          }}
        >
          <Content>
            <MainRoute />
            <Modal
             wrapClassName="sharp-edged-modal"
              title="Confirm Logout"
              visible={isLogoutModalVisible}
              onOk={handleLogoutConfirm}
              onCancel={handleLogoutCancel}
              okText="Logout"
              cancelText="Cancel"
              maskClosable={false}
              destroyOnClose
              okButtonProps={{ danger: true}}
            >
              <p>Are you sure you want to log out?</p>
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Layouts;
