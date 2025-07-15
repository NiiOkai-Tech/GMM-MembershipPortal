// File: src/components/hierarchy/DistrictManager.jsx
// Component to manage Districts.
import React, { useState, useContext } from "react";
import { regions, districts as initialDistricts } from "../../data/dummyData";
import AuthContext from "../../context/AuthContext";
import Card from "../ui/Card";
import Button from "../ui/Button";

const DistrictManager = () => {
  const [districts, setDistricts] = useState(initialDistricts);
  const { isAdmin } = useContext(AuthContext);
  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Manage Districts</h2>
      {isAdmin && (
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="New District Name"
            className="input"
          />
          <select className="input">
            <option value="">Select Region</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <Button type="submit">Add District</Button>
        </form>
      )}
      <ul className="space-y-2">
        {districts.map((d) => (
          <li
            key={d.id}
            className="p-3 bg-gray-50 rounded-md flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{d.name}</p>
              <p className="text-sm text-gray-500">
                {regions.find((r) => r.id === d.regionId)?.name}
              </p>
            </div>
            <span className="text-sm text-gray-500 font-mono">{d.id}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};
export default DistrictManager;
