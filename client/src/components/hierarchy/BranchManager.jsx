// File: src/components/hierarchy/BranchManager.jsx
// Component to manage Branches.
import React, { useState, useContext } from "react";
import {
  regions,
  districts,
  branches as initialBranches,
} from "../../data/dummyData";
import AuthContext from "../../context/AuthContext";
import Card from "../ui/Card";
import Button from "../ui/Button";

const BranchManager = () => {
  const [branches, setBranches] = useState(initialBranches);
  const { isAdmin } = useContext(AuthContext);
  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Manage Branches</h2>
      {isAdmin && (
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input placeholder="New Branch Name" className="input" />
          <select className="input">
            <option value="">Select Region *</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select className="input">
            <option value="">Select District (Optional)</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <Button type="submit">Add Branch</Button>
        </form>
      )}
      <ul className="space-y-2">
        {branches.map((b) => (
          <li
            key={b.id}
            className="p-3 bg-gray-50 rounded-md flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{b.name}</p>
              <p className="text-sm text-gray-500">
                {districts.find((d) => d.id === b.districtId)?.name ||
                  regions.find((r) => r.id === b.regionId)?.name}
              </p>
            </div>
            <span className="text-sm text-gray-500 font-mono">{b.id}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};
export default BranchManager;
