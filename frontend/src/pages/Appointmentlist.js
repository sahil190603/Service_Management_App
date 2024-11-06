import React, { useEffect, useState, useContext } from "react";
import {
  Table,
  message,
  Tooltip,
  Row,
  Col,
  Card,
  Skeleton,
  Tag,
  Badge,
  Select,
  Form,
  Modal,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  fetchDataBySelection,
  accept_appointment_request,
  reject_appointment_request,
} from "../Services/Services";
import AppTextbox from "../components/Generic/AppTextbox";
import AppModal from "../components/Generic/AppModal";
import AppointmentForm from "../Forms/AppointmentFrom";
import { AuthContext } from "../Context/AuthProvider";
import AppButton from "../components/Generic/AppButton";
import ExportButton from "../components/Generic/ExportButton";
import {
  APPOINTMENT_ADMIN_STATUS_CHOICE,
  APPOINTMENT_STATUS_COLOR,
  APPOINTMENT_USER_STATUS_CHOICE,
} from "../constant";
import { IoSearchOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import AppDropdown from "../components/Generic/AppDropdown";
import { GrCheckbox, GrCheckboxSelected } from "react-icons/gr";
import { MdDone } from "react-icons/md";

const { Option } = Select;

const Appointmentlist = () => {
  const { user, role } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [ModalsearchQuery ,setModalSearchQuery] = useState("");
  const [FilteredModalAppointments, setFilteredModalAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [pageSize, setPageSize] = useState(5);
  const [pageModalSize, setPageModalSize] = useState(7);
  const [timingFilter, setTimingFilter] = useState("Today");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteAppointmentId, setDeleteAppointmentId] = useState(null);


  const getAppointments = async () => {
    setLoading(true);
    try {
      const response =
        role === "Admin"
          ? await fetchDataBySelection("Appointments", "", "", timingFilter)
          : await fetchDataBySelection(
              "Appointmentsbycreator",
              user?.user_id,
              "",
              timingFilter
            );
      setAppointments(response);
    } catch (error) {
      message.error("Failed to fetch appointments.");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    getAppointments();
    fetchPendingAppointments();
  }, [role, user?.user_id, timingFilter]);

  const fetchPendingAppointment = () => {
    setIsRequestModalVisible(true);
  };

  const fetchPendingAppointments = async () => {
    try {
      const response = await fetchDataBySelection(
        "Appointments",
        null,
        "pending"
      );

      setPendingAppointments(response);
    } catch (error) {
      message.error("Failed to fetch pending appointments.");
    }
  };

  const handleTimingFilterChange = (value) => {
    setTimingFilter(value ? value : null);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  const handleApprove = async (id) => {
    try {
      await accept_appointment_request(id);
      setPendingAppointments(
        pendingAppointments.filter((appointment) => appointment.id !== id)
      );
      handleModalClose();
      message.success("Appointment approved successfully.");
    } catch (error) {
      message.error(`${error.response.data.error}`);
    }
  };

  const handleMarkAsCompleted = async (id) => {
    try {
      await axios.put(`http://localhost:8000/appointment/appointments/${id}/`, {
        Marked_As_done: true,
        status: "Completed",
      });
      message.success("Appointment completed successfully.");
      setAppointments(
        appointments.map((appointment) =>
          appointment.id === id
            ? { ...appointment, Marked_As_done: true, status: "Completed" }
            : appointment
        )
      );
    } catch (error) {
      message.error(`${error.response.data}`);
    }
  };

  const handleReject = async (id) => {
    try {
      await reject_appointment_request(id);
      setPendingAppointments(
        pendingAppointments.filter((appointment) => appointment.id !== id)
      );
      handleModalClose();
      message.success("Appointment rejected successfully.");
    } catch (error) {
      message.error(`${error.response.data.error}`);
    }
  };

  useEffect(() => {
    let filtered = appointments;
  
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((appointment) => {
        const matchesName = appointment.name.toLowerCase().includes(searchLower);
        const matchesDescription = appointment.description 
          ? appointment.description.toLowerCase().includes(searchLower) 
          : false;

  
        return matchesName || matchesDescription;
      });
    }
  
    if (statusFilter) {
      filtered = filtered.filter(
        (appointment) => appointment.status === statusFilter
      );
    }
  
    setFilteredAppointments(filtered);
  }, [appointments, searchQuery, statusFilter]);


  useEffect(() => {
    let filteredModal = pendingAppointments;
  
    if (ModalsearchQuery) {
      const searchLower = ModalsearchQuery.toLowerCase();
      filteredModal = filteredModal.filter((appointment) => {
        const matchesCreator = appointment.creator.toLowerCase().includes(searchLower);
        const matchesUserId = appointment.user_id 
          ? appointment.user_id.toString().toLowerCase().includes(searchLower)
          : false;
        const matchesDescription = appointment.description 
          ? appointment.description.toLowerCase().includes(searchLower)
          : false;
  
        return matchesCreator || matchesUserId || matchesDescription;
      });
    }
  
    setFilteredModalAppointments(filteredModal);
  }, [pendingAppointments, ModalsearchQuery]);
  

  

  const handleView = (record) => {
    setCurrentAppointment(record);
    setModalMode("view");
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setCurrentAppointment(record);
    setModalMode("edit");
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setCurrentAppointment(null);
    setModalMode("create");
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setCurrentAppointment(null);
    setIsRequestModalVisible(false);
  };

  const showDeleteConfirm = (ID) => {
    setDeleteAppointmentId(ID);
    setIsDeleteModalVisible(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
  };
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/appointment/appointments/${deleteAppointmentId}/`
      );
      setAppointments(
        appointments.filter((appointment) => appointment.id !== deleteAppointmentId)
      );
      message.success("Appointment deleted successfully.");
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Failed to delete appointment.");
    }
  };

  const columns = [
    {
      title: <span className="tableheader">Apponitment Name</span>,
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: <span className="tableheader">Description</span>,
      dataIndex: "description",
      key: "description",
      align:"center",
      width: "20%",
      render: (text) => (
        <div
          style={{ maxHeight: "30px", overflowY: "auto", overflowX: "hidden" }}
        >
          {text}
        </div>
      ),
    },
    {
      title: <span className="tableheader">Start Time</span>,
      dataIndex: "start_time",
      key: "start_time",
      align:"center",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: <span className="tableheader">End Time</span>,
      dataIndex: "end_time",
      key: "end_time",
      align:"center",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: <span className="tableheader">Status</span>,
      dataIndex: "status",
      key: "status",
      align:"center",
      render: (status) => (
        <Tag color={APPOINTMENT_STATUS_COLOR[status]}>{status}</Tag>
      ),
    },
    {
      title: <span className="tableheader">Mark As Done</span>,
      dataIndex: "Marked_As_done",
      align:"center",
      render: (text, record) => (
        <div>
          {record.Marked_As_done === true && (
            <Tooltip title="Completed">
              <AppButton
                className={"ActionButton"}
                icon={<GrCheckboxSelected style={{ fontSize: 20 }} />}
              />
            </Tooltip>
          )}
          {record.Marked_As_done !== false && role === "Admin" && record.status === "Accepted" ? (
            <Tooltip title="Mark as Completed">
              <AppButton
                className={"ActionButton"}
                icon={<GrCheckbox style={{ fontSize: 20 }} />}
                onClick={() => handleMarkAsCompleted(record.id)}
              />
            </Tooltip>
          ): "--"}
        </div>
      ),
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
              onClick={() => handleView(record)}
              style={{ marginRight: 8 }}
            />
          </Tooltip>
          {role === "Admin" && (
            <>
              <Tooltip title="Edit">
                <AppButton
                className={"ActionButton"}
                  icon={<EditOutlined style={{ color: "blue" }} />}
                  onClick={() => handleEdit(record)}
                  style={{ marginRight: 8 }}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <AppButton
                  danger
                  className={"ActionButton"}
                  icon={<DeleteOutlined />}
                  onClick={() => showDeleteConfirm(record.id)}
                />
              </Tooltip>
            </>
          )}
          {role === "User" && record.status === "Pending" && (
            <>
              <Tooltip title="Edit">
                <AppButton
                className={"ActionButton"}
                  icon={<EditOutlined style={{ color: "blue" }} />}
                  onClick={() => handleEdit(record)}
                  style={{ marginRight: 8 }}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <AppButton
                className={"ActionButton"}
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => showDeleteConfirm(record.id)}
                />
              </Tooltip>
            </>
          )}
        </span>
      ),
    },
  ];

  const requestColumns = [
    {
      title: <span className="tableheader">Employee Name</span>,
      dataIndex: "creator",
      key: "creator",
      align:"center",
    },
    {
      title: <span className="tableheader">Employee ID</span>,
      dataIndex: "user_id",
      key: "user_id",
      align:"center",
    },
    {
      title: <span className="tableheader">Description</span>,
      dataIndex: "description",
      key: "description",
      align:"center",
    },
    {
      title: <span className="tableheader">Start Time</span>,
      dataIndex: "start_time",
      key: "start_time",
      align:"center",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: <span className="tableheader">End Time</span>,
      dataIndex: "end_time",
      key: "end_time",
      align:"center",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: <span className="tableheader">Actions</span>,
      key: "actions",
      align:"center",
      render: (text, record) => (
        <div>
          <Tooltip title="Accept">
            <AppButton
            className={"ActionButton"}
              icon={<MdDone style={{ color: "green" }} />}
              onClick={() => handleApprove(record.id)}
            />
          </Tooltip>
          <Tooltip title="Reject">
            <AppButton
            className={"ActionButton"}
              icon={<RxCross1 />}
              onClick={() => handleReject(record.id)}
              style={{ marginLeft: 8 }}
              danger
            />
          </Tooltip>
        </div>
      ),
    },
  ];
  const pendingAppointmentsCount = pendingAppointments.filter(
    (req) => req.status === "Pending"
  ).length;

  return (
    <>
      <Row justify="center" align="middle" style={{ marginTop: "10px" }}>
        <Col xs={24} sm={20} md={24} lg={24}>
          <Card
            className="scroll-container"
            style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
              borderRadius: "3px",
              height: "86.8vh",
            }}
          >
            <Row
              gutter={10}
              style={{ marginBottom: 8 }}
            >
              <Col className="left-content">
                <h2 style={{ margin: 2 }}>
                 Appointment
                </h2>
              </Col>

              {role === "Admin" && (
                <Col className="right-content">
                  <Badge
                    count={pendingAppointmentsCount}
                    offset={[2, 0]}
                    style={{ backgroundColor: "#f5222d", marginRight: 8 }}
                  >
                    <AppButton
                      onClick={fetchPendingAppointment}
                      label="Appointment Requests"
                    />
                  </Badge>
                  <ExportButton
                    endpoint="http://localhost:8000/appointment/export-appointments/"
                    params={{ status: statusFilter }}
                    filename="Appointments.xlsx"
                    buttonLabel="Export Appointmnets"
                    style={{ marginRight: 8 }}
                  />
                </Col>
              )}
              <Col>    
                  <AppButton
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                    label="Create Appointment"
                    type="primary"
                  /></Col>
            </Row>

            <Row gutter={10} style={{ width: "100%" }}>
              <Col span={5}>
                <AppTextbox
                  prefix={<IoSearchOutline />}
                  placeholder="Search"
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
              <Col span={11}></Col>
              <Col span={4}>
                {role === "Admin" && (
                  <AppDropdown
                    // label="Status"
                    name="status"
                    options={APPOINTMENT_ADMIN_STATUS_CHOICE}
                    placeholder="Select Status"
                    labelKey="label"
                    onChange={handleStatusChange}
                    value={statusFilter}
                  />
                )}
                {role === "User" && (
                  <AppDropdown
                    // label="Status"
                    name="status"
                    options={APPOINTMENT_USER_STATUS_CHOICE}
                    placeholder="Select Status"
                    labelKey="label"
                    onChange={handleStatusChange}
                    value={statusFilter}
                  />
                )}
              </Col>
              <Col span={4}>
                <Form.Item name="Time">
                  <Select
                    defaultValue="Today"
                    style={{ width: "105%" }}
                    value="value"
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
                dataSource={filteredAppointments}
                rowKey={(record) => record.id}
                pagination={{
                  pageSize: pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: ["5", "10", "20", "50"],
                  showQuickJumper: true,
                  onShowSizeChange: (current, size) => setPageSize(size),
                }}
              />
            )}
          </Card>
        </Col>
      </Row>
      <AppModal visible={isModalVisible} onCancel={handleModalClose}>
        <AppointmentForm
          appointmentData={currentAppointment}
          isViewMode={modalMode === "view"}
          isUpdateMode={modalMode === "edit"}
          closeModal={handleModalClose}
          onRefreshAppointments={getAppointments}
        />
      </AppModal>

      <AppModal
        visible={isRequestModalVisible}
        onCancel={handleModalClose}
        title="Pending Appointment Requests"
        size="large"
      >
                    <Row gutter={10} style={{ width: "100%" }}>
              <Col span={6}>
                <AppTextbox
                  prefix={<IoSearchOutline />}
                  placeholder="Search"
                  value={ModalsearchQuery}
                  type="text"
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "3px",
                    marginBottom: 16,
                  }}
                />
              </Col>
              </Row>
        <Table
          columns={requestColumns}
          dataSource={FilteredModalAppointments}
          rowKey={(record) => record.id}
          pagination={{
            pageSize: pageModalSize,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showQuickJumper: true,
            onShowSizeChange: (current, size) => setPageModalSize(size),
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
        <p>Are you sure you want to delete this Apponintment?</p>
      </Modal>
    </>
  );
};

export default Appointmentlist;
