// File: src/components/hierarchy/DistrictManager.jsx
// Component to manage Districts.
import React, { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import AuthContext from "../../context/AuthContext";
import Card from "../ui/Card";
import Button from "../ui/Button";
import useToast from "../../hooks/useToast";
import Modal from "../ui/Modal";

const DistrictManager = () => {
  const [districts, setDistricts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDistrict, setNewDistrict] = useState({ name: "", regionId: "" });
  const [editingDistrict, setEditingDistrict] = useState(null);
  const { isAdmin } = useContext(AuthContext);
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [districtsRes, regionsRes] = await Promise.all([
        api.get("/districts"),
        api.get("/regions"),
      ]);
      setDistricts(districtsRes.data);
      setRegions(regionsRes.data);
    } catch (err) {
      addToast("Failed to fetch data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) =>
    setNewDistrict({ ...newDistrict, [e.target.name]: e.target.value });

  const handleAddDistrict = async (e) => {
    e.preventDefault();
    if (!newDistrict.name.trim() || !newDistrict.regionId) return;
    try {
      await api.post("/districts", newDistrict);
      setNewDistrict({ name: "", regionId: "" });
      addToast("District added successfully!", "success");
      fetchData();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to add district.",
        "error"
      );
    }
  };

  const handleUpdateDistrict = async (e) => {
    e.preventDefault();
    if (
      !editingDistrict ||
      !editingDistrict.name.trim() ||
      !editingDistrict.regionId
    )
      return;
    try {
      await api.put(`/districts/${editingDistrict.id}`, {
        name: editingDistrict.name,
        regionId: editingDistrict.regionId,
      });
      setEditingDistrict(null);
      addToast("District updated successfully!", "success");
      fetchData();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to update district.",
        "error"
      );
    }
  };

  const handleDeleteDistrict = async (districtId) => {
    if (window.confirm("Are you sure you want to delete this district?")) {
      try {
        await api.delete(`/districts/${districtId}`);
        addToast("District deleted successfully!", "success");
        fetchData();
      } catch (err) {
        addToast(
          err.response?.data?.message || "Failed to delete district.",
          "error"
        );
      }
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Manage Districts</h2>
      {isAdmin && (
        <form
          onSubmit={handleAddDistrict}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <input
            type="text"
            name="name"
            value={newDistrict.name}
            onChange={handleInputChange}
            placeholder="New District Name"
            className="input"
          />
          <select
            name="regionId"
            value={newDistrict.regionId}
            onChange={handleInputChange}
            className="input"
          >
            <option value="">Select Region</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          <Button type="submit">Add District</Button>
        </form>
      )}
      {isLoading ? (
        <p>Loading districts...</p>
      ) : (
        <ul className="space-y-2">
          {districts.map((d) => (
            <li
              key={d.id}
              className="p-3 bg-gray-50 rounded-md flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{d.name}</p>
                <p className="text-sm text-gray-500">{d.regionName}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 font-mono">{d.id}</span>
                {isAdmin && (
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      className="text-xs !py-1 !px-2"
                      onClick={() => setEditingDistrict(d)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="text-xs !py-1 !px-2"
                      onClick={() => handleDeleteDistrict(d.id)}
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
      {editingDistrict && (
        <Modal
          isOpen={!!editingDistrict}
          onClose={() => setEditingDistrict(null)}
          title="Edit District"
        >
          <form onSubmit={handleUpdateDistrict} className="space-y-4">
            <input
              value={editingDistrict.name}
              onChange={(e) =>
                setEditingDistrict({ ...editingDistrict, name: e.target.value })
              }
              className="input"
            />
            <select
              value={editingDistrict.regionId}
              onChange={(e) =>
                setEditingDistrict({
                  ...editingDistrict,
                  regionId: e.target.value,
                })
              }
              className="input"
            >
              <option value="">Select Region</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingDistrict(null)}
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
export default DistrictManager;
