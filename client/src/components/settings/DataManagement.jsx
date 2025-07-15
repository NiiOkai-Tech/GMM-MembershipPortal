// File: src/components/settings/DataManagement.jsx
// NEW FILE: Component for data import/export functionality.
import React from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";

const DataManagement = () => {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold mb-4">Export Member Data</h2>
        <p className="text-gray-600 mb-4">
          Export the full list of members to a CSV file for offline analysis or
          backup.
        </p>
        <Button
          onClick={() => alert("Export functionality not yet implemented.")}
        >
          Export All Members
        </Button>
      </Card>
      <Card>
        <h2 className="text-xl font-bold mb-4">Bulk Import Members</h2>
        <p className="text-gray-600 mb-4">
          Upload a CSV file to add multiple new members at once. Ensure the file
          follows the required format.
        </p>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          <Button
            onClick={() => alert("Import functionality not yet implemented.")}
          >
            Upload and Import
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DataManagement;
