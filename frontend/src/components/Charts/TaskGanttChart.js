import React, { useEffect, useState } from "react";
import axios from "axios";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Col, message, Row, Table, Tooltip } from "antd";
import { FaPlus , FaMinus} from "react-icons/fa";

const TaskGanttChart = ({ selectedproject, timingFilter }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);


  const fetchGanttData =()  =>{
    let url = `http://localhost:8000/task/task_gantt_data/?timingFilter=${timingFilter}`;

    if (selectedproject) {
      url = `http://localhost:8000/task/task_gantt_data/?projectId=${selectedproject}&timingFilter=${timingFilter}`;
    }
    axios.get(url)
      .then((response) => {
        const taskData = response.data
          .map((task) => {
            if (!task.start || !task.end) {
              return null;
            }

            const startDate = new Date(task.start.replace(" ", "T"));
            const endDate = new Date(task.end.replace(" ", "T"));
            return {
              id: task.id.toString(),
              name: task.name,
              start: startDate,
              end: endDate,
              progress: task.progress,
              dependencies: task.dependencies
                ? [task.dependencies.toString()]
                : [],
              action: task.dependencies && !selectedTask ? (
                <Tooltip title="Remove dependency of task!">
                <FaMinus style={{ color: "gray" }} 
                onClick={() => handleRemovedependency(task.id)}/>
                </Tooltip>
              ) : (
                selectedTask !== task.id ? (
                  <Tooltip title={selectedTask ? `Select Task to set Dependent On.`:`Select Task To add dependency.`}>
                  <FaPlus
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => handleActionClick(task.id)}
                  />
                  </Tooltip>
                ) : (
                  <Tooltip title="Remove Selected Task!">
                  <FaMinus
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => handelRemoveSelected()}
                  />
                  </Tooltip>
                )
                ),
            };
          })
          .filter((task) => task !== null);
        setTasks(taskData);
      })
      .catch((error) => {
        message.error("Error fetching task data:", error);
      });
    }

    useEffect(() => {
      fetchGanttData();
    }, [selectedproject, selectedTask, timingFilter]);
  
  const handleDateChange = (task) => {
    const startTimeString = task.start
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);
    const endTimeString = task.end.toISOString().replace("T", " ").slice(0, 19);
    axios.put(`http://localhost:8000/task/tasks/${task.id}/`, {
        start_time: startTimeString,
        end_time: endTimeString,
      })
      .then((response) => {
        const updatedTask = {
          ...task,
          start: task.start,
          end: task.end,
        };
        message.success("Task Dates updated successfully");
        const newTasks = tasks.map((t) => (t.id === task.id ? updatedTask : t));
        setTasks(newTasks);
      })
      .catch((error) => {
        message.error("Error updating task dates:", error);
      });
  };

  const handleRemovedependency = (taskId) =>{
    axios.put(`http://localhost:8000/task/tasks/${taskId}/`, {Dependent_on: null})
      .then((response) => {
        message.success(
          `Task dependency Removed Succesfully.`
        );
        fetchGanttData();
        // const updatedTasks = tasks.map((task) => {
        //   if (task.id === taskId.toString()) {
        //     return {
        //       ...task,
        //       dependencies: [], 
        //     };
        //   }
        //   return task;
        // });
        // setTasks(updatedTasks); 
        setSelectedTask(null);
      })
      .catch((error) => {
        message.error(`Error Removing dependency: ${error.message}`);
      });
  }

  const handelRemoveSelected = () => {
    setSelectedTask(null);

    message.info(
      `Task Selceted Set to null!`
    );
  };

  const handleActionClick = (task) => {
    if(!selectedTask){
    setSelectedTask(task);
    message.success(
      `Task selected succesfully, Select task for dependency.`
    );
  }else{
    handlesubmit(task);
  }
  };

  const handlesubmit = (task) => {
    axios.put(`http://localhost:8000/task/tasks/${selectedTask}/`, {Dependent_on:task})
      .then((response) => {
        message.success(
          `Task: ${selectedTask} is now dependent on task: ${task} successfully!`
        );
        setSelectedTask(null);
      })
      .catch((error) => {
        message.error(`Error setting dependency: ${error.message}`);
      });
  }

  const columns = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "center",
    },
  ];

  return (
    <div className="scroll-x-container">
      {tasks.length > 0 ? (
        <>
          <div
            style={{
              border: "2px solid black",
              borderRadius: "3px",
              padding: "10px",
            }}
          >
            <Row>
              <Col span={selectedproject ? 22 : 24}>
                <Gantt
                  tasks={tasks}
                  viewMode={ViewMode.Day}
                  onDateChange={handleDateChange}
                />
              </Col>
              {selectedproject && (
                <Table
                  dataSource={tasks}
                  columns={columns}
                  pagination={false}
                  rowKey="id"
                  style={{
                    marginLeft: "15px",
                    border: "0.4px solid #D3D3D3",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                />
              )}
            </Row>
          </div>
        </>
      ) : (
        <p>No tasks available.</p>
      )}
    </div>
  );
};

export default TaskGanttChart;
