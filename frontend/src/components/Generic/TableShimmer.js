import React from "react";
import { Card } from "antd";
import "../../Style/ShimmerCard.css"

const TableShimmer = () => {
  return (
    <Card  className="shimmer-line" style={{ borderRadius: '8px', backgroundColor: '#D3D3D3', marginBottom: '8px', height:"82px", width:"100%" }}>
    </Card>
  );
};

export default TableShimmer;
