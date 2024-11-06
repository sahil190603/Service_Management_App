import React, { useEffect, useState } from "react";
import {
  Table,
  message,
  Tooltip,
  Row,
  Col,
  Card,
  Modal,
  Skeleton,
  Tag,
  Form,
  Select,
  Collapse,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { fetchDataBySelection } from "../Services/Services";
import AppModal from "../components/Generic/AppModal";
import HelpdeskQueryForm from "../Forms/HelpdeskQueryForm";
import AppTextbox from "../components/Generic/AppTextbox";
import { IoSearchOutline } from "react-icons/io5";
import { QUERY_STATUS_COLOR, TASK_PRIORITY_COLOR } from "../constant";
import axios from "axios";
import { QUERY_PRIORITY, QUERY_STATUS } from "../constant";
import ExportButton from "../components/Generic/ExportButton";
import { format } from "date-fns";
import AppButton from "../components/Generic/AppButton";

const { Option } = Select;
const { Panel } = Collapse;

const Helpdesk = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteQueryId, setDeleteQueryId] = useState(null);
  const [currentQuery, setCurrentQuery] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [pageSize, setPageSize] = useState(5);
  const [timingFilter, setTimingFilter] = useState("All");

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setLoading(true);
        const response = await fetchDataBySelection(
          "helpdeskQueries",
          "",
          "",
          timingFilter
        );
        setQueries(response);
      } catch (error) {
        message.error("Failed to fetch queries. Please try again.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchQueries();
  }, [timingFilter]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handlePriorityChange = (priority) => {
    setSelectedPriority(priority);
  };

  const filteredQueries = queries.filter((query) => {
    const searchLower = searchQuery.toLowerCase();
  
    const matchesSearch =
      query.query.toLowerCase().includes(searchLower) ||
      (query.linked_task && query.linked_task.toLowerCase().includes(searchLower));
  
    const matchesStatus = selectedStatus ? query.status === selectedStatus : true;
    const matchesPriority = selectedPriority ? query.priority === selectedPriority : true;
  
    return matchesSearch && matchesStatus && matchesPriority;
  });
  

  const handleView = (record) => {
    setCurrentQuery(record);
    setModalMode("view");
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setCurrentQuery(record);
    setModalMode("edit");
    setIsModalVisible(true);
  };

  const showDeleteConfirm = (queryID) => {
    setDeleteQueryId(queryID);
    setIsDeleteModalVisible(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/helpdesk/queries/${deleteQueryId}/`
      );
      message.success("Query deleted successfully");
      setQueries(queries.filter((query) => query.id !== deleteQueryId));
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Failed to delete query. Please try again.");
    }
  };

  const handleCreate = () => {
    setCurrentQuery(null);
    setModalMode("create");
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setCurrentQuery(null);
  };

  const refreshQueries = (query) => {
    setIsModalVisible(false);
    if (modalMode === "create") {
      setQueries((prevQueries) => [...prevQueries, query]);
    } else if (modalMode === "edit") {
      setQueries((prevQueries) =>
        prevQueries.map((q) => (q.id === query.id ? query : q))
      );
    }
  };

  const columns = [
    {
      title: <span className="tableheader">Query Title</span>,
      dataIndex: "query",
      key: "query",
      sorter: (a, b) => a.query.localeCompare(b.query),
      width: "20%",
    },
    {
      title: <span className="tableheader">Status</span>,
      dataIndex: "status",
      key: "status",
      align:"center",
      width: "10%",
      render: (text) => (
        <Tag color={QUERY_STATUS_COLOR[text]}>
          {text === "null" ? "N/A" : text}
        </Tag>
      ),
    },
    {
      title: <span className="tableheader">Priority</span>,
      dataIndex: "priority",
      key: "priority",
      align:"center",
      width: "9%",
      render: (priority) => (
        <Tag color={TASK_PRIORITY_COLOR[priority]}>
          {priority === "null" ? "N/A" : priority}
        </Tag>
      ),
    },
    {
      title: <span className="tableheader">Task</span>,
      dataIndex: "linked_task",
      key: "linked_task",
      align:"center",
      width: "10%",
    },
    {
      title: <span className="tableheader">Created At</span>,
      dataIndex: "created_at",
      key: "created_at",
      align:"center",
      width: "25%",
      render: (text) => {
        return format(new Date(text), "dd/MM/yyyy HH:mm:ss");
      },
    },
    {
      title: <span className="tableheader">Actions</span>,
      key: "actions",
      align:"center",
      width: "20%",
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
            <Row  style={{ marginBottom: 8 }}>
              <Col className="left-content">
                <h2 style={{ margin: 2 }}>Help Desk</h2>
              </Col>

              <Col className="right-content">
                <ExportButton
                  endpoint="http://localhost:8000/helpdesk/Export-to-excel/"
                  params={{
                    status: selectedStatus,
                    priority: selectedPriority,
                  }}
                  filename="Helpdesk.xlsx"
                  buttonLabel="Export Helpdesk"
                  style={{ marginRight: 8 }}
                />

                <AppButton
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  label="Create Query"
                  type="primary"
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
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "3px",
                    marginBottom: 16,
                  }}
                />
              </Col>
              <Col span={11}></Col>
              <Col span={4}>
                <Form.Item name="Time">
                  <Select
                    defaultValue="All"
                    style={{ width: "100%" }}
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
              <Col span={4}>
                <Card
                  style={{
                    borderRadius: "4px",
                    position: "absolute",
                    width: "100%",
                    zIndex: 10,
                    border: "1px solid #d9d9d9",
                  }}
                  bodyStyle={{ padding: 4 }}
                >
                  <Collapse
                    bordered={false}
                    defaultActiveKey={["0"]}
                    className="custom-collapse"
                  >
                    <Panel header="Filters" key="1">
                      <Row gutter={16}>
                        <Col span={24}>
                          <Select
                            placeholder="Select Priority"
                            onChange={handlePriorityChange}
                            allowClear
                            style={{ width: "100%" }}
                          >
                            {QUERY_PRIORITY.map((priority) => (
                              <Select.Option
                                key={priority.value}
                                value={priority.value}
                              >
                                {priority.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </Col>
                      </Row>
                      <Row gutter={16} style={{ marginTop: 8 }}>
                        <Col span={24}>
                          <Select
                            placeholder="Select Status"
                            onChange={handleStatusChange}
                            allowClear
                            style={{ width: "100%" }}
                          >
                            {QUERY_STATUS.map((status) => (
                              <Select.Option
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </Col>
                      </Row>
                    </Panel>
                  </Collapse>
                </Card>
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
                dataSource={filteredQueries}
                rowKey={(record) => record.id}
                pagination={{
                  pageSize: pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: ["5", "10", "20", "50"],
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
        visible={isModalVisible}
        onCancel={handleModalClose}
        size="default"
      >
        <HelpdeskQueryForm
          queryData={currentQuery}
          isViewMode={modalMode === "view"}
          isUpdateMode={modalMode === "edit"}
          closeModal={handleModalClose}
          onSuccess={refreshQueries}
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
        <p>Are you sure you want to delete this query?</p>
      </Modal>
    </>
  );
};

export default Helpdesk;
