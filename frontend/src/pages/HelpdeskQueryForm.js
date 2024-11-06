import React, { useEffect, useState, useContext } from "react";
import { Row, Col, Card, message, Form, Input } from "antd";
import AppButton from "../components/Generic/AppButton";
import {
  addDataBySelection,
  updateDataBySelection,
  fetchDataBySelection,
} from "../Services/Services";
import { AuthContext } from "../Context/AuthProvider";
import AppDropdown from "../components/Generic/AppDropdown";
import { QUERY_PRIORITY, QUERY_STATUS } from "../constant";

const HelpdeskQueryForm = ({
  queryData,
  isViewMode = false,
  isUpdateMode = false,
  closeModal,
  onSuccess,
}) => {
  const { user } = useContext(AuthContext) ?? {};
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState([]);
  const [selectedStatus, setSelectedStatus] = React.useState(null);
  const [LinkedtaskId, setLinkedtaskId] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await fetchDataBySelection("get_tasks_by_Completion_status");
        setTasks(fetchedTasks);
      } catch (error) {
        message.error(
          error.message || "Failed to fetch tasks. Please try again."
        );
      }
    };

    loadTasks();

    if (queryData) {
      form.setFieldsValue({
        query: queryData.query,
        status: queryData.status,
        priority: queryData.priority ? queryData.priority : null,
        linked_task: queryData.linked_task,
      });
      setSelectedStatus(queryData.status);
      setLinkedtaskId(queryData.linked_task_id);
    } else {
      form.resetFields();
    }
  }, [queryData, form]);

  const handleSubmit = async (values) => {    
    const formattedValues = {
      ...values,
      priority: values.priority || "",
      created_by: user?.user_id,
    };

    try {
      let query;
      if (isUpdateMode) {
        query = await updateDataBySelection(
          "helpdeskQuery",
          queryData.id,
          { ...formattedValues, status: selectedStatus , linked_task: LinkedtaskId}
        );
        message.success("Query updated successfully");
      } else {
        query = await addDataBySelection("helpdeskQuery", formattedValues);
        message.success("Query created successfully");
      }
      closeModal();
      onSuccess({...query , linked_task: queryData ? queryData.linked_task : selectedStatus});
      form.resetFields();
    } catch (error) {
      message.error(
        error.response?.data?.detail || "Operation failed. Please try again."
      );
    }
  };

  return (
    <Row justify="center" align="middle" >
      <Col xs={24} sm={20} md={24} lg={24}>
        <Card
          className="scroll-xy-continer"
          style={{
            border: "none",
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <h2 className="text-center">
              {isViewMode
                ? "View Helpdesk Query Details"
                : isUpdateMode
                ? "Update Helpdesk Query"
                : "Helpdesk Query Registration"}
            </h2>

            <Form.Item
              label="Query Title"
              name="query"
              rules={[
                {
                  required: !isViewMode,
                  message: "Please enter the query title",
                },
              ]}
            >
              <Input placeholder="Query Title" disabled={isViewMode} />
            </Form.Item>

            <AppDropdown
              label="Linked Task"
              name="linked_task"
              options={tasks}
              placeholder="Select Linked Task"
              labelKey="name"
              valueKey="id"
              rules={[
                {
                  required: !isViewMode,
                  message: "Please select a linked task",
                },
              ]}
              disabled={isViewMode}
            />

            <Row gutter={16}>
              {isViewMode | isUpdateMode ? (
                <Col xs={24} sm={12}>
                  <Form.Item label="Status">
                    <AppDropdown
                      options={QUERY_STATUS}
                      placeholder="Select Status"
                      labelKey="label"
                      value={selectedStatus}
                      onChange={(value) => setSelectedStatus(value.id)}
                      disabled={isViewMode}
                    />
                  </Form.Item>
                </Col>
              ): null}
              
              <Col xs={24} sm={12}>
                <AppDropdown
                  label="Priority"
                  name="priority"
                  options={QUERY_PRIORITY}
                  placeholder="Select Priority"
                  labelKey="label"
                  valueKey="id"
                  disabled={isViewMode}
                  rules={[]}
                />
              </Col>
            </Row>

            {!isViewMode ? (
              <Form.Item style={{ marginTop: "20px", textAlign:'right' }}>
                <AppButton
                  htmlType="submit"
                  type="primary"
                  label={isUpdateMode ? "Update Query" : "Create Query"}
                />
              </Form.Item>
            ): null}
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default HelpdeskQueryForm;
