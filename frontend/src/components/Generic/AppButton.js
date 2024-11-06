import React from "react";
import { Button } from "antd";

const AppButton = ({ type, className,label, ...props }) => {
  return (
    <Button type={type} className={className ? className: "custom-button"} {...props} >
      {label}
    </Button>
  );
};

export default AppButton;
