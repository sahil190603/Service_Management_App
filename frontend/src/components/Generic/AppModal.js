import React from "react";
import { Modal } from "antd";

const AppModal = ({ visible, onCancel, title, children, size = "default" },ref) => {
  let modalWidth;

  switch (size) {
    case "large":
      modalWidth = "80%";
      break;
    case "medium":
      modalWidth = "60%";
      break;
    case "small":
      modalWidth = "40%";
      break;
    default:
      modalWidth = "50%";
  }

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={null}
      title={title}
      width={modalWidth}
      style={{ top:"64px" }} 
      bodyStyle={{  overflowY: "auto",  overflowX:"auto"}}
      wrapClassName="sharp-edged-modal"
    >
      {children}
    </Modal>
  );
};

export default AppModal;
