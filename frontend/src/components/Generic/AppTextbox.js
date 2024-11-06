import React from "react";
import { Form, Input } from "antd";

const AppTextbox = ({
  label,
  name,
  rules,
  placeholder,
  type,
  rows,
  prefix, 
  ...props
}) => {
  return (
    <Form.Item label={label} name={name} rules={[...(rules || [])]} {...props} >
      {type === "text" ? (
        <Input 
          placeholder={placeholder} 
          prefix={prefix}
        />
      ) : type === "password" ? (
        <Input.Password 
          placeholder={placeholder} 
          prefix={prefix}
        />
      ) : type === "textarea" ? (
        <Input.TextArea 
          rows={rows} 
          placeholder={placeholder} 
        />
      ) : type === "number" ? (
        <Input 
          type="number" 
          placeholder={placeholder} 
        />
      ) : null}
    </Form.Item>
  );
};

export default AppTextbox;
