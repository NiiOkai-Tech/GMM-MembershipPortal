// File: src/components/hierarchy/BranchManager.jsx
// Component to manage Branches.
import React, { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import AuthContext from "../../context/AuthContext";
import Card from "../ui/Card";
import Button from "../ui/Button";
import useToast from "../../hooks/useToast";
import Modal from "../ui/Modal";

const BranchManager = () => {
  const [branches, setBranches] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBranch, setNewBranch] = useState({
    name: "",
    regionId: "",
    districtId: "",
  });
  const [editingBranch, setEditingBranch] = useState(null);
  const { isAdmin } = useContext(AuthContext);
  const { addToast } = useToast();

  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [editingFilteredDistricts, setEditingFilteredDistricts] = useState([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [branchesRes, regionsRes, districtsRes] = await Promise.all([
        api.get("/branches"),
        api.get("/regions"),
        api.get("/districts"),
      ]);
      setBranches(branchesRes.data);
      setRegions(regionsRes.data);
      setDistricts(districtsRes.data);
    } catch (err) {
      addToast("Failed to fetch data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (newBranch.regionId) {
      setFilteredDistricts(
        districts.filter((d) => d.regionId === newBranch.regionId)
      );
    } else {
      setFilteredDistricts([]);
    }
  }, [newBranch.regionId, districts]);
  useEffect(() => {
    if (editingBranch?.regionId) {
      setEditingFilteredDistricts(
        districts.filter((d) => d.regionId === editingBranch.regionId)
      );
    } else {
      setEditingFilteredDistricts([]);
    }
  }, [editingBranch?.regionId, districts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBranch((p) => ({ ...p, [name]: value }));
    if (name === "regionId") {
      setNewBranch((p) => ({ ...p, districtId: "" }));
    }
  };
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingBranch((p) => ({ ...p, [name]: value }));
    if (name === "regionId") {
      setEditingBranch((p) => ({ ...p, districtId: "" }));
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!newBranch.name.trim() || !newBranch.regionId) return;
    try {
      await api.post("/branches", {
        ...newBranch,
        districtId: newBranch.districtId || null,
      });
      setNewBranch({ name: "", regionId: "", districtId: "" });
      addToast("Branch added successfully!", "success");
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add branch.", "error");
    }
  };

  const handleUpdateBranch = async (e) => {
    e.preventDefault();
    if (!editingBranch || !editingBranch.name.trim() || !editingBranch.regionId)
      return;
    try {
      await api.put(`/branches/${editingBranch.id}`, {
        ...editingBranch,
        districtId: editingBranch.districtId || null,
      });
      setEditingBranch(null);
      addToast("Branch updated successfully!", "success");
      fetchData();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to update branch.",
        "error"
      );
    }
  };

  const handleDeleteBranch = async (branchId) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await api.delete(`/branches/${branchId}`);
        addToast("Branch deleted successfully!", "success");
        fetchData();
      } catch (err) {
        addToast(
          err.response?.data?.message || "Failed to delete branch.",
          "error"
        );
      }
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Manage Branches</h2>
      {isAdmin && (
        <form
          onSubmit={handleAddBranch}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <input
            type="text"
            name="name"
            value={newBranch.name}
            onChange={handleInputChange}
            placeholder="New Branch Name"
            className="input"
          />
          <select
            name="regionId"
            value={newBranch.regionId}
            onChange={handleInputChange}
            className="input"
          >
            <option value="">Select Region *</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            name="districtId"
            value={newBranch.districtId}
            onChange={handleInputChange}
            className="input"
            disabled={!newBranch.regionId}
          >
            <option value="">Select District (Optional)</option>
            {filteredDistricts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <Button type="submit">Add Branch</Button>
        </form>
      )}
      {isLoading ? (
        <p>Loading branches...</p>
      ) : (
        <ul className="space-y-2">
          {branches.map((b) => (
            <li
              key={b.id}
              className="p-3 bg-gray-50 rounded-md flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{b.name}</p>
                <p className="text-sm text-gray-500">
                  {b.districtName || b.regionName}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 font-mono">{b.id}</span>
                {isAdmin && (
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      className="text-xs !py-1 !px-2"
                      onClick={() => setEditingBranch(b)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="text-xs !py-1 !px-2"
                      onClick={() => handleDeleteBranch(b.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {editingBranch && (
        <Modal
          isOpen={!!editingBranch}
          onClose={() => setEditingBranch(null)}
          title="Edit Branch"
        >
          <form onSubmit={handleUpdateBranch} className="space-y-4">
            <input
              name="name"
              value={editingBranch.name}
              onChange={handleEditInputChange}
              placeholder="Branch Name"
              className="input"
            />
            <select
              name="regionId"
              value={editingBranch.regionId}
              onChange={handleEditInputChange}
              className="input"
            >
              <option value="">Select Region *</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <select
              name="districtId"
              value={editingBranch.districtId || ""}
              onChange={handleEditInputChange}
              className="input"
              disabled={!editingBranch.regionId}
            >
              <option value="">Select District (Optional)</option>
              {editingFilteredDistricts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingBranch(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </Card>
  );
};
export default BranchManager;
