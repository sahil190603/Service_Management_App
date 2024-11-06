import React, { useEffect, useState } from "react";
import QuerylineChart from "../components/Charts/QuerylineChart";
import Querybarchart from "../components/Charts/Querybarchart";
import {  message, Row } from "antd";
import HelpdeskQueryStatusPieChart from "../components/Charts/QueryStatusPieChart";
import axios from "axios";
import QueryCompletionbarChart from "../components/Charts/QueryCompletionbarChart";

const HelpdeskAnalysis = ({ timingFilter }) => {
  const [queryLineChartData, setqueryLineChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Creation Dates vs Start Dates",
        data: [],
      },
    ],
  });
  const [querybarChartData, setqueryBarChartData] = useState({
    labels: [],
    solved_by_date: [],
    solved_time: [],
  });

  useEffect(() => {
    const fetchqueyBarChartData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/helpdesk/query_solved_time_summary/?timingFilter=${timingFilter}`
        );
        if (response) {
          setqueryBarChartData({
            labels: response.data.labels,
            solved_by_date: response.data.solved_by_date,
            solved_time: response.data.solved_time,
          });
        } else {
          throw new Error("Invalid data structure received");
        }
      } catch (error) {
        message.error(
          "Failed to fetch bar chart data. Please try again later."
        );
      }
    };

    const fetchqueryLineChartData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/helpdesk/Query_line_plot_data/?timingFilter=${timingFilter}`
        );
        if (response) {
          setqueryLineChartData(response.data);
        } else {
          throw new Error("Invalid data structure received");
        }
      } catch (error) {
        message.error(
          "Failed to fetch query line chart data. Please try again later."
        );
      }
    };
    fetchqueyBarChartData();
    fetchqueryLineChartData();
  }, [timingFilter]);
  return (
<div>
          <Row gutter={10}>
            <HelpdeskQueryStatusPieChart timingFilter={timingFilter}/>
            <Querybarchart data={querybarChartData} />
            <QueryCompletionbarChart  timingFilter={timingFilter}/>
          </Row>
          <Row>
            <QuerylineChart data={queryLineChartData}/>
          </Row>
          </div>
  );
};

export default HelpdeskAnalysis;
