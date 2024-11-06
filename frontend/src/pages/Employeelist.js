import React, { useEffect, useState } from "react";
import {
  Table,
  message,
  Tooltip,
  Row,
  Col,
  Card,
  Skeleton,
  Modal,
  Select,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { fetchDataBySelection } from "../Services/Services";
import AppModal from "../components/Generic/AppModal";
import Register from "../Forms/Register";
import { IoSearchOutline } from "react-icons/io5";
import AppTextbox from "../components/Generic/AppTextbox";
import ExportButton from "../components/Generic/ExportButton";
import axios from "axios";
import AppButton from "../components/Generic/AppButton";

const { Option } = Select;

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [pageSize, setPageSize] = useState(5);
  const [timingFilter, setTimingFilter] = useState();

  useEffect(() => {
    const getEmployees = async () => {
      setLoading(true);
      try {
        const response = await fetchDataBySelection(
          "allEmployees",
          "",
          "",
          timingFilter
        );
        setEmployees(response);
      } catch (error) {
        message.error(error.message);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };
    getEmployees();
  }, [timingFilter]);

  const filteredEmployees = employees.filter((employee) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      employee.first_name.toLowerCase().includes(searchLower) ||  
      employee.last_name.toLowerCase().includes(searchLower) ||   
      employee.email.toLowerCase().includes(searchLower) ||       
      employee.contact_no.includes(searchQuery)                  
    );
  });
  
  const showDeleteConfirm = (TaskID) => {
    setDeleteProjectId(TaskID);
    setIsDeleteModalVisible(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
  };
  const columns = [
    {
      title: <span className="tableheader">First Name</span>,
      dataIndex: "first_name",
      key: "first_name",
      sorter: (a, b) => a.first_name.localeCompare(b.first_name),
    },
    {
      title: <span className="tableheader">Last Name</span>,
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: <span className="tableheader">Email</span>,
      dataIndex: "email",
      key: "email",
    },
    {
      title: <span className="tableheader">Contact</span>,
      dataIndex: "contact_no",
      key: "contact_no",
    },
    {
      title: <span className="tableheader">Actions</span>,
      key: "actions",
      align:"center",
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
          <Tooltip title="Edit">
            <AppButton
            className={"ActionButton"}
              icon={<EditOutlined style={{ color: "blue" }} />}
              style={{ marginRight: 8 }}
              onClick={() => handleEdit(record)}
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
        </span>
      ),
    },
  ];
  const handleView = (record) => {
    setCurrentEmployee(record);
    setModalMode("view");
    setIsModalVisible(true);
  };

  const handleEdit = (employee) => {
    setCurrentEmployee(employee);
    setModalMode("edit");
    setIsModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/authapp/Users/${deleteProjectId}/`
      );
      if (response.status === 204) {
        message.success("User deleted Successfully.");
        setEmployees((prev) =>
          prev.filter((emp) => emp.id !== deleteProjectId)
        );
        setIsDeleteModalVisible(false);
      } else {
        message.error(response.detail || "Failed to delete employee.");
      }
    } catch (error) {
      message.error("Failed to delete employee.");
    }
  };

  const handleCreate = () => {
    setCurrentEmployee(null);
    setModalMode("create");
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setCurrentEmployee(null);
  };

  const handleTimingFilterChange = (value) => {
    setTimingFilter(value ? value : null);
  };

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
            }}
          >
            <Row gutter={10} style={{ marginBottom: 8 }}>
              <Col className="left-content">
                <h2 style={{ margin: 2 }}>Employee</h2>
              </Col>

              <Col className="right-content" >
                <ExportButton
                  endpoint="http://localhost:8000/authapp/Export-to-excel/"
                  params={{ timingFilter: timingFilter }}
                  filename="Authapp.xlsx"
                  buttonLabel="Export Employees"
                />
              </Col>
              <Col className="right-content">
                <AppButton 
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  label="Register Employee"
                  type={"primary"}
                  style={{ width:'100%'}}
                />
              </Col>
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
                    width: "100%",
                    borderRadius: "3px",
                    marginBottom: 24,
                  }}
                />
              </Col>
              <Col span={15}></Col>
              <Col span={4}>
                <Select
                  style={{ width: "105%" }}
                  value={timingFilter}
                  onChange={handleTimingFilterChange}
                  placeholder="Select Time"
                  allowClear
                >
                  <Option value="All">All Time</Option>
                  <Option value="Today">Today</Option>
                  <Option value="ThisWeek">This Week</Option>
                  <Option value="ThisMonth">This Month</Option>
                  <Option value="ThisYear">This Year</Option>
                </Select>
              </Col>
            </Row>
            {loading ? (
              <Skeleton
                active
                paragraph={{ rows: 12 }}
                className="Sketeton_of_table"
              />
            ) : (
              <Table
                columns={columns}
                dataSource={filteredEmployees}
                rowKey={(record) => record.id}
                pagination={{
                  pageSize: pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: ["5","7" ,"10", "20", "50"],
                  showQuickJumper: true,
                  onShowSizeChange: (current, size) => setPageSize(size),
                }}
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
        <Register
          employee={currentEmployee}
          mode={modalMode}
          onSuccess={() => {
            handleModalClose();
            fetchDataBySelection("allEmployees")
              .then(setEmployees)
              .catch((error) => message.error(error.message));
          }}
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
        <p>Are you sure you want to delete this Employee?</p>
      </Modal>
    </>
  );
};

export default EmployeeList;
