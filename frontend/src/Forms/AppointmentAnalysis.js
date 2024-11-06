import React from "react";
import Appointmentpie from "../components/Charts/Appointmentpie";
import AppointmentBarChart from "../components/Charts/AppointmentBarChart";
import AppointmnetCompletionBar from "../components/Charts/AppointmnetCompletionBar";
import { Row } from "antd";

const AppointmentAnalysis = ({ timingFilter }) => {
  return (
    <Row gutter={10}>
      <Appointmentpie timingFilter={timingFilter} />
      <AppointmentBarChart timingFilter={timingFilter} />
      <AppointmnetCompletionBar timingFilter={timingFilter} />
    </Row>
  );
};

export default AppointmentAnalysis;
