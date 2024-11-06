import React from 'react';
import PropTypes from 'prop-types';
import { Button, message } from 'antd';
import axios from 'axios';
import { PiExportBold } from 'react-icons/pi';

const ExportButton = ({
  endpoint,
  params = {},
  filename = 'export.xlsx',
  buttonLabel = 'Export',
  buttonProps = {},
}) => {
  const handleExport = async () => {
    try {
      const response = await axios.get(endpoint, {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] })
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Error downloading the file.');
    }
  };

  return (
    <Button {...buttonProps} onClick={handleExport} icon={<PiExportBold /> }
className='Export_button' 
>
      {buttonLabel}
    </Button>
  );
};
ExportButton.propTypes = {
  endpoint: PropTypes.string.isRequired, 
  params: PropTypes.object, 
  filename: PropTypes.string, 
  buttonLabel: PropTypes.string,
  buttonProps: PropTypes.object,
};

export default ExportButton;
