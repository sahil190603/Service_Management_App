import React from "react";
import { Select, Form } from "antd";

const { Option } = Select;
const AppDropdown = ({
  label,
  name,
  options,
  placeholder,
  rules,
  labelKey,
  onChange,
  allowClear = true,
  value,
  defaultvalue,
  ...props
}) => {
  return (
    <Form.Item
      label={label}
      name={name}
      value={value}
      rules={[...(rules || [])]}
    >
      <Select 
        defaultvalue={defaultvalue}
        placeholder={placeholder}
        onChange={onChange}
        allowClear={allowClear}
        value={value}
        {...props}
      >
        {options.map((option) => (
          <Option key={option.id} value={option.value}>
           {labelKey ? option[labelKey] : option.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default AppDropdown;
