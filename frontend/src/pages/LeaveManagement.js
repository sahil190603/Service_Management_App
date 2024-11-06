import React, { useContext, useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  message,
  Tag,
  Modal,
  Badge,
  Select,
  Skeleton,
  Form,
  Tooltip,
} from "antd";
import {
  fetchDataBySelection,
  updateDataBySelection,
} from "../Services/Services";
import { AuthContext } from "../Context/AuthProvider";
import { format } from "date-fns";
import {
  Leave_status_admin,
  Leave_status_user,
  Task_Transfer_STATUS_COLOR,
} from "../constant";
import LeaveRequestForm from "../Forms/LeaveRequestForm";
import AppModal from "../components/Generic/AppModal";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { RxCross1 } from "react-icons/rx";
import { IoSearchOutline } from "react-icons/io5";
import axios from "axios";
import {  MdDone, MdOutlineModeEdit } from "react-icons/md";
import ExportButton from "../components/Generic/ExportButton";
import AppButton from "../components/Generic/AppButton";
import AppTextbox from "../components/Generic/AppTextbox";

const LeaveManagement = () => {
  const { Option } = Select;
  const { user, role } = useContext(AuthContext);
  const [leaveReqs, setLeaveReqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [deletereqId, setDeletereqId] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [ispendingModelV, setispendingModelv] = useState(false);
  const [mainFilter, setMainFilter] = useState(
    role === "User" ? "Pending" : "Approved"
  );
  const [pageSize, setPageSize] = useState(5);
  const [pageModalSize, setPageModalSize] = useState(7);
  const [formMode, setFormMode] = useState("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [ModalsearchQuery ,setModalSearchQuery] = useState("");
  const [FilteredPendingRequests, setFilteredPendingRequests] = useState([]);

  useEffect(() => {
    const fetchLeaveReqs = async () => {
      try {
        let response;
        if (role === "Admin") {
          response = await fetchDataBySelection("LeaveReqs");
        } else {
          response = await fetchDataBySelection(
            "LeaveRequsByUser",
            user?.user_id
          );
        }
        setLeaveReqs(response);
      } catch (error) {
        message.error("Failed to fetch leave requests.");
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    fetchLeaveReqs();
  }, [role, user?.user_id]);

  const showDeleteConfirm = (ReqID) => {
    setDeletereqId(ReqID);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/LeaveManagement/leave-request/${deletereqId}/`
      );
      message.success("Request deleted successfully");
      setLeaveReqs(leaveReqs.filter((Req) => Req.id !== deletereqId));
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Failed to delete Request. Please try again.");
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.get(
        `http://localhost:8000/LeaveManagement/approve_reject_leave_request/${id}/approve/`
      );
      message.success("Leave request approved successfully");
      const response = await fetchDataBySelection(
        role === "Admin" ? "LeaveReqs" : "LeaveRequsByUser",
        user?.user_id
      );
      setLeaveReqs(response);
    } catch (error) {
      message.error(`${error?.response?.data?.error}`);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.get(
        `http://localhost:8000/LeaveManagement/approve_reject_leave_request/${id}/reject/`
      );
      message.success("Leave request rejected successfully");
      const response = await fetchDataBySelection(
        role === "Admin" ? "LeaveReqs" : "LeaveRequsByUser",
        user?.user_id
      );
      setLeaveReqs(response);
    } catch (error) {
      message.error("Failed to reject leave request.");
    }
  };
  const Maincolumns = [
    {
      title: <span className="tableheader">By User</span>,
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: <span className="tableheader">Leave Type</span>,
      dataIndex: "leave_type",
      key: "leave_type",
      align:"center",
    },
    {
      title: <span className="tableheader">Start Date</span>,
      dataIndex: "start_date",
      key: "start_date",
      align:"center",
      render: (text) => format(new Date(text), "dd/MM/yyyy"),
    },
    {
      title: <span className="tableheader">End Date</span>,
      dataIndex: "end_date",
      key: "end_date",
      align:"center",
      render: (text) => format(new Date(text), "dd/MM/yyyy"),
    },
    {
      title: <span className="tableheader">Date of Request</span>,
      dataIndex: "date_of_request",
      key: "date_of_request",
      align:"center",
      render: (text) => format(new Date(text), "dd/MM/yyyy HH:mm"),
    },
    {
      title: <span className="tableheader">Status</span>,
      dataIndex: "status",
      key: "status",
      align:"center",
      render: (status) => (
        <Tag color={Task_Transfer_STATUS_COLOR[status]}>
          {status === "null" ? "N/A" : status}
        </Tag>
      ),
    },
    {
      title: <span className="tableheader">Reason</span>,
      dataIndex: "reason",
      key: "reason",
      align:"center",
    },
  ]

  const columns = [
    {
      title: <span className="tableheader">By User</span>,
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: <span className="tableheader">Leave Type</span>,
      dataIndex: "leave_type",
      key: "leave_type",
      align:"center",
    },
    {
      title: <span className="tableheader">Start Date</span>,
      dataIndex: "start_date",
      key: "start_date",
      align:"center",
      render: (text) => format(new Date(text), "dd/MM/yyyy"),
    },
    {
      title: <span className="tableheader">End Date</span>,
      dataIndex: "end_date",
      key: "end_date",
      align:"center",
      render: (text) => format(new Date(text), "dd/MM/yyyy"),
    },
    {
      title: <span className="tableheader">Date of Request</span>,
      dataIndex: "date_of_request",
      key: "date_of_request",
      align:"center",
      render: (text) => format(new Date(text), "dd/MM/yyyy HH:mm"),
    },
    {
      title: <span className="tableheader">Status</span>,
      dataIndex: "status",
      key: "status",
      align:"center",
      render: (status) => (
        <Tag color={Task_Transfer_STATUS_COLOR[status]}>
          {status === "null" ? "N/A" : status}
        </Tag>
      ),
    },
    {
      title: <span className="tableheader">Reason</span>,
      dataIndex: "reason",
      key: "reason",
      align:"center",
    },
    {
      title: <span className="tableheader">Actions</span>,
      key: "actions",
      align:"center",
      render: (text, record) => {
        if (record.status === "Approved" || record.status === "Rejected") {
          return null;
        }
        if (role === "Admin" && record.status === "Pending") {
          return (
            <div>
              <Tooltip title="Accept">
                <AppButton
                className={"ActionButton"}
                  icon={<MdDone style={{ color: "green" }} />}
                  style={{ marginLeft: 8 }}
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
          );
        } else if (role === "User" && record.status === "Pending") {
          return (
            <>
            <Tooltip title="Edit">
              <AppButton
              className={"ActionButton"}
                icon={<MdOutlineModeEdit style={{ color: "blue" }} />}
                onClick={() => handleEdit(record)}
              />
              </Tooltip>
              <Tooltip title="delete">
              <AppButton
              className={"ActionButton"}
                danger
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(record.id)}
                style={{ marginLeft: 8 }}
              />
              </Tooltip>
            </>
          );
        }
      },
    },
  ];

  const showModal = () => {
    setEditingRequest(null);
    setIsModalVisible(true);
    setFormMode("create");
  };

  const pendingRequestsCount = leaveReqs.filter(
    (req) => req.status === "Pending"
  ).length;

  const pendingRequests = leaveReqs.filter((req) => req.status === "Pending");

  const showPendigReqmodel = () => {
    setispendingModelv(true);
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setIsModalVisible(true);
    setFormMode("update");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsDeleteModalVisible(false);
    setispendingModelv(false);
    setDeletereqId(null);
  };

  const handleFormSubmit = async (values) => {
    if (editingRequest) {
      await updateDataBySelection(editingRequest.id, values);
    }
    const response = await fetchDataBySelection(
      role === "Admin" ? "LeaveReqs" : "LeaveRequsByUser",
      user?.user_id
    );
    setLeaveReqs(response);
    setIsModalVisible(false);
  };

  const handleMainFilterChange = (value) => {
    setMainFilter(value);
  };

  const filteredLeaveReqs = leaveReqs.filter((req) => {
    const matchesFilter = mainFilter ? req.status === mainFilter : true;
  
    const matchesSearch = searchQuery
      ? req.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.leave_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
  
    return matchesFilter && matchesSearch;
  });


  useEffect(() => {
    let filteredRequests = pendingRequests;
  
    if (ModalsearchQuery) {
      const searchLower = ModalsearchQuery.toLowerCase();
      
      filteredRequests = filteredRequests.filter((request) => {
        const matchesFullName = request.full_name.toLowerCase().includes(searchLower);
        const matchesLeaveType = request.leave_type.toLowerCase().includes(searchLower);
        const matchesStatus = request.status.toLowerCase().includes(searchLower);
        const matchesReason = request.reason ? request.reason.toLowerCase().includes(searchLower) : false;
  
        return (
          matchesFullName || matchesLeaveType ||
   matchesStatus || matchesReason
        );
      });
    }
  
    setFilteredPendingRequests(filteredRequests);
  }, [pendingRequests, ModalsearchQuery]);
  
  
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
            <Row className="left-righ-container" style={{ marginBottom: 8 }}>
              <Col className="left-content">
                <h2 style={{ margin: 2 }}>Leave</h2>
              </Col>

              <Col className="right-content">


                {role === "Admin" && (
                  <>
                    <ExportButton
                      endpoint="http://localhost:8000/LeaveManagement/export-leave-requests/"
                      params={{ status: mainFilter }}
                      filename="LeaveRequestsRequest.xlsx"
                      buttonLabel="Export Leaves"
                      style={{ marginRight: 8 }}
                    />

                    <Badge
                      count={pendingRequestsCount}
                      offset={[2, 0]}
                      style={{ backgroundColor: "#f5222d", marginRight: 8 }}
                    >
                      <AppButton
                        onClick={showPendigReqmodel}
                        label="Pending Requests"
                      />
                    </Badge>
                  </>
                )}

                {role === "User" && (
                  <AppButton
                    icon={<PlusOutlined />}
                    onClick={showModal}
                    label="Create Leave"
                    type="primary"
                  />
                )}
                
              </Col>
            </Row>
            <Row gutter={10} style={{ width: "100%" }}>
              <Col span={5} >
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
              
              <Col span={15}></Col>
              { role === "Admin" && <Col span={4}>
              <Form.Item name="status">
                    <Select
                        defaultValue="Approved"
                        placeholder="Select status"
                        onChange={handleMainFilterChange}
                        value={mainFilter}
                        // allowClear
                        style={{ width:"105%" }}
                      >
                        {Leave_status_admin.map((status) => (
                          <Option key={status.id} value={status.value}>
                            {status.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    </Col>}

                    {role === "User" ? (<Col span={4}>
                  <Form.Item name="status">
                    <Select
                      defaultValue="Pending"
                      placeholder= "Select status"
                      onChange={handleMainFilterChange}
                      value={mainFilter}
                      // allowClear
                      style={{width : "105%"}}
                    >
                      {Leave_status_user.map((status) => (
                        <Option key={status.id} value={status.value}>
                          {status.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  </Col>) : null}
            </Row>

            {isLoading ? (
              <Skeleton
                active
                paragraph={{ rows: 13 }}
                className="Sketeton_of_table"
              />
            ) : (
              <Table
                dataSource={filteredLeaveReqs}
                columns={ role === "Admin" ? Maincolumns : columns}
                rowKey="id"
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

      <AppModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleFormSubmit}
        okText={editingRequest ? "Update" : "Submit"}
        size="default"
 
      >
        <LeaveRequestForm
          onFormSubmit={handleFormSubmit}
          onCancel={handleCancel}
          initialValues={editingRequest}
          mode={formMode} 
        />
      </AppModal>
      <Modal
        wrapClassName="sharp-edged-modal"
        title="Confirm Deletion"
        visible={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this Request?</p>
      </Modal>

      <AppModal
        title="Pending Leave Requests"
        visible={ispendingModelV}
        onCancel={handleCancel}
        footer={null}
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
          dataSource={FilteredPendingRequests}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: pageModalSize,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showQuickJumper: true,
            onShowSizeChange: (current, size) => setPageModalSize(size),
          }}
        />
      </AppModal>
    </>
  );
};

export default LeaveManagement;
