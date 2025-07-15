// File: src/components/ui/Card.jsx
// A reusable Card component for consistent content containers.
import React from "react";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);
export default Card;
