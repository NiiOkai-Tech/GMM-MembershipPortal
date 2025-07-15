// File: src/components/hierarchy/RegionManager.jsx
// Component to manage Regions.
import React, { useState, useContext } from "react";
import { regions as initialRegions } from "../../data/dummyData";
import AuthContext from "../../context/AuthContext";
import Card from "../ui/Card";
import Button from "../ui/Button";

const RegionManager = () => {
  const [regions, setRegions] = useState(initialRegions);
  const { isAdmin } = useContext(AuthContext);
  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Manage Regions</h2>
      {isAdmin && (
        <form className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="New Region Name"
            className="input flex-grow"
          />
          <Button type="submit">Add Region</Button>
        </form>
      )}
      <ul className="space-y-2">
        {regions.map((region) => (
          <li
            key={region.id}
            className="p-3 bg-gray-50 rounded-md flex justify-between items-center"
          >
            <span>{region.name}</span>
            <span className="text-sm text-gray-500 font-mono">{region.id}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};
export default RegionManager;
