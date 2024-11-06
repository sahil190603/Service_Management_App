import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Table,
  message,
  Skeleton,
  Modal,
  Badge,
  Select,
  Tag,
} from "antd";
import { AuthContext } from "../Context/AuthProvider";
import axios from "axios";
import { IoSearchOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { DeleteOutlined } from "@ant-design/icons";
import { TASK_REQ_STATUS, Task_Transfer_STATUS_COLOR } from "../constant";
import ExportButton from "../components/Generic/ExportButton";
import AppButton from "../components/Generic/AppButton";
import AppTextbox from "../components/Generic/AppTextbox";
import AppModal from "../components/Generic/AppModal";
import { MdDone } from "react-icons/md";

function TaskTransferRequest() {
  const { user, role } = useContext(AuthContext);
  const { Option } = Select;
  const [transferRequests, setTransferRequests] = useState([]);
  const [ownRequest, setOwnRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [filter, setFilter] = useState("Pending");
  const [AdminAllReq, setIsAdminAllReq] = useState([]);
  const [mainFilter, setMainFilter] = useState("Pending");
  const [pageSize, setPageSize] = useState(5);
  const [pageModalSize, setPageModalSize] = useState(7);
  const [searchQuery, setSearchQuery] = useState("");
 

  useEffect(() => {
    const fetchAllRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8000/task/get_taskTransferReq_For_admin/`
        );
        setIsAdminAllReq(response.data);
      } catch (error) {
        message.error("Failed to fetch task transfer requests.");
      } finally {
            setTimeout(() => {
      setLoading(false);
    }, 1000);
      }
    };

    const fetchTransferRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8000/task/get_task_transfer_requests_by_user/?transfer_to=${user?.user_id}`
        );
        setTransferRequests(response.data.transfer_requests);
      } catch (error) {
        message.error("Failed to fetch task transfer requests.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    const fetchOwnRequests = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/task/get_task_transfer_requests_by_user/?created_by=${user?.user_id}`
        );
        setOwnRequest(response.data.transfer_requests);
      } catch (error) {
        message.error("Failed to fetch own task transfer requests.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    if (user?.user_id) {
      if (role === "Admin") {
        fetchAllRequests();
      } else if (user?.role === "User") {
        fetchOwnRequests();
        fetchTransferRequests();
      }
    }
  }, [user, role]);

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/task/TaskTransferRequest/${deleteTaskId}/`
      );
      message.success("Request deleted successfully");
      setOwnRequest(ownRequest.filter((task) => task.id !== deleteTaskId));
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Failed to delete Request. Please try again.");
    }
  };

  const showDeleteConfirm = (TaskID) => {
    setDeleteTaskId(TaskID);
    setIsDeleteModalVisible(true);
  };

  const handleApprove = async (taskTransferId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/task/accept_task_transfer/?transfer_request_id=${taskTransferId}&user_id=${user?.user_id}`
      );
      message.success(response.data.message);
    } catch (error) {
      message.error("Failed to approve task transfer.");
    }
  };

  const handleReject = async (taskTransferId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/task/reject_task_transfer/?transfer_request_id=${taskTransferId}&user_id=${user?.user_id}`
      );
      message.success(response.data.message);
    } catch (error) {
      message.error("Failed to reject task transfer.");
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value ?? null);
  };


  const handleMainFilterChange = (value) => {
    setMainFilter(value ?? null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

const filterRequests = (requests) => {
    return requests.filter((req) => {
      const matchesFilter = !filter || req.status === filter;
  
      const matchesQuery =
        (req.task && req.task.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (req.created_by && req.created_by.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (req.transfer_to && req.transfer_to.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (req.date_of_request && new Date(req.date_of_request).toLocaleString().toLowerCase().includes(searchQuery.toLowerCase()));
      
  
      return matchesFilter && matchesQuery;
    });
  };
  
const filteredTransferRequests = filterRequests(transferRequests);
  
const filteredAdminRequests = filterRequests(AdminAllReq);
  
const filteredUserRequets = filterRequests(ownRequest);
  

  const Maincolumns = [
    {
      title: <span className="tableheader">Created By</span>,
      dataIndex: "created_by",
      key: "created_by",
      render: (text) => text,
      sorter: (a, b) => a.created_by.localeCompare(b.created_by),
    },
    {
      title: <span className="tableheader">Transfer To</span>,
      dataIndex:"transfer_to",
      key:"transfer_to",
    },
    {
      title: <span className="tableheader">Task Name</span>,
      dataIndex: "task",
      key: "task",
      render: (text) => text,
    },
    {
      title: <span className="tableheader">Date of Request</span>,
      dataIndex: "date_of_request",
      key: "date_of_request",
      align:"center",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: <span className="tableheader">Status</span>,
      dataIndex: "status",
      key: "status",
      align:"center",
      render: (status) => (
        <Tag color={Task_Transfer_STATUS_COLOR[status]}>{status  === "null" ? "N/A" : status}</Tag>
      ),
    }
  ]

  const columns = [
    {
      title: <span className="tableheader">Created By</span>,
      dataIndex: "created_by",
      key: "created_by",
      render: (text) => text,
      sorter: (a, b) => a.created_by.localeCompare(b.created_by),
    },
    {
      title: <span className="tableheader">Transfer To</span>,
      dataIndex:"transfer_to",
      key:"transfer_to",
    },
    {
      title: <span className="tableheader">Task Name</span>,
      dataIndex: "task",
      key: "task",
      render: (text) => text,
    },
    {
      title: <span className="tableheader">Date of Request</span>,
      dataIndex: "date_of_request",
      key: "date_of_request",
      align:"center",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: <span className="tableheader">Status</span>,
      dataIndex: "status",
      key: "status",
      align:"center",
      render: (status) => (
        <Tag color={Task_Transfer_STATUS_COLOR[status]}>{status  === "null" ? "N/A" : status}</Tag>
      ),
    },
    {
      title: <span className="tableheader">Actions</span>,
      key: "actions",
      align:"center",
      render: (text, record) => {
        if (record.status === "Approved" || record.status === "Rejected") {
          return null;
        }
        if (
          role !== "Admin" &&
          record.created_by_id !== user?.user_id &&
          record.status === "Pending"
        ) {
          return (
            <div>
              <AppButton
              className={"ActionButton"}
                icon={<MdDone style={{ color: "green" }} />}
                onClick={() => handleApprove(record.id)}
              />
              <AppButton
              className={"ActionButton"}
                icon={<RxCross1  />}
                onClick={() => handleReject(record.id)}
                style={{ marginLeft: 8 }}
                danger
              />
            </div>
          );
        } else if (
          record.created_by_id === user?.user_id &&
          record.status === "Pending"
        ) {
          return (
            <AppButton
            className={"ActionButton"}
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record.id)}
              style={{ marginLeft: 8 }}
            />
          );
        }
      },
    },
  ];

  const pendingRequestsCount = transferRequests.filter(
    (req) => req.status === "Pending"
  ).length;
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsDeleteModalVisible(false);
    setDeleteTaskId(null);
  };


  return (
    <div>
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
            <Row  style={{ marginBottom: 8 }}>
              <Col className="left-content">
                <h2 style={{ margin: 2, textAlign: "left" }}>
                 Task Transfer
                </h2>
              </Col>

              {role === "Admin" && 
              <Col className="right-content">
                <ExportButton
                  endpoint="http://localhost:8000/task/export-task-transfer-requests/"
                  params={{ status: mainFilter}}
                  filename="TaskTransferRequest.xlsx"
                  buttonLabel="Export Transfer"
                />
              </Col>}

              {role === "User" && (
                <Col className="right-content">
                  <Badge
                    count={pendingRequestsCount}
                    offset={[2, 0]}
                    style={{ backgroundColor: "#f5222d", marginRight: 8  }}
                  >
                    <AppButton onClick={showModal} label={'Task requests'}></AppButton>
                  </Badge>
                </Col>
              )}
            </Row>
            <Row gutter={14} style={{marginBottom: "8px"}}>    
                <Col span={5}>       
                <AppTextbox
                  placeholder="Search"
                  prefix={<IoSearchOutline />}
                  value={searchQuery}
                  type="text"
                  onChange={handleSearchChange}
                  style={{
                    width: "100%",
                    borderRadius: '3px',
                    marginBottom: 16,
                  }}
                />
                </Col> 
                <Col span={15}></Col> 
                <Col span={4}>
                  <Select
                   defaultValue="Pending"
                    placeholder="Select status"
                    onChange={handleMainFilterChange}
                    value={mainFilter ?? null}
                  style={{ width:"100%"}}
                    allowClear
                  >
                    {TASK_REQ_STATUS.map((status) => (
                      <Option key={status.id} value={status.value}>
                        {status.label}
                      </Option>
                    ))}
                  </Select>
              </Col> 
              </Row>
            {loading ? (
              <Skeleton active paragraph={{ rows: 12 }} className="Sketeton_of_table" />
            ) : (
              <Table
                columns={role === "User" ? columns : Maincolumns}
                dataSource={
                  role === "Admin" ? filteredAdminRequests : filteredUserRequets
                }
                rowKey={(record) => record.created_at}
                pagination={{
                  pageSize: pageSize, 
                  showSizeChanger: true, 
                  pageSizeOptions: ['5', '10', '20', '50'],
                  showQuickJumper: true, 
                  onShowSizeChange: (current, size) => setPageSize(size), 
                }}
                scroll={{ x: 800 }}
              />
            )}
          </Card>
        </Col>
      </Row>
      <AppModal
      title="Task Transfer Requestes"
       wrapClassName="sharp-edged-modal"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        size={"large"}
      >
        <Row  style={{ justifyContent :'end'}}>
          <Col span={4} >

            <Select
              defaultValue="Pending"
              placeholder="Select status"
              onChange={handleFilterChange}
              value={filter ?? null}
              allowClear
              style={{width:"100%"}}
            >
              {TASK_REQ_STATUS.map((status) => (
                <Option key={status.id} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        {loading ? (
          <Skeleton active paragraph={{ rows: 10 }} className="Sketeton_of_table"/>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredTransferRequests}
            rowKey={(record) => record.created_at}
            pagination={{
              pageSize: pageModalSize, 
              showSizeChanger: true, 
              pageSizeOptions: ['5', '10', '20', '50'],
              showQuickJumper: true, 
              onShowSizeChange: (current, size) => setPageModalSize(size), 
            }}
          />
        )}
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
    </div>
  );
}

export default TaskTransferRequest;
