// File: src/components/hierarchy/RegionManager.jsx
// Component to manage Regions.
import React, { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import AuthContext from "../../context/AuthContext";
import Card from "../ui/Card";
import Button from "../ui/Button";
import useToast from "../../hooks/useToast";
import Modal from "../ui/Modal";

const RegionManager = () => {
  const [regions, setRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRegionName, setNewRegionName] = useState("");
  const [editingRegion, setEditingRegion] = useState(null);
  const { isAdmin } = useContext(AuthContext);
  const { addToast } = useToast();

  const fetchRegions = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/regions");
      setRegions(data);
    } catch (err) {
      addToast("Failed to fetch regions.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleAddRegion = async (e) => {
    e.preventDefault();
    if (!newRegionName.trim()) return;
    try {
      await api.post("/regions", { name: newRegionName });
      setNewRegionName("");
      addToast("Region added successfully!", "success");
      fetchRegions();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add region.", "error");
    }
  };

  const handleUpdateRegion = async (e) => {
    e.preventDefault();
    if (!editingRegion || !editingRegion.name.trim()) return;
    try {
      await api.put(`/regions/${editingRegion.id}`, {
        name: editingRegion.name,
      });
      setEditingRegion(null);
      addToast("Region updated successfully!", "success");
      fetchRegions();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to update region.",
        "error"
      );
    }
  };

  const handleDeleteRegion = async (regionId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this region? This will also delete all associated districts and branches."
      )
    ) {
      try {
        await api.delete(`/regions/${regionId}`);
        addToast("Region deleted successfully!", "success");
        fetchRegions();
      } catch (err) {
        addToast(
          err.response?.data?.message || "Failed to delete region.",
          "error"
        );
      }
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Manage Regions</h2>
      {isAdmin && (
        <form onSubmit={handleAddRegion} className="flex gap-4 mb-6">
          <input
            type="text"
            value={newRegionName}
            onChange={(e) => setNewRegionName(e.target.value)}
            placeholder="New Region Name"
            className="input flex-grow"
          />
          <Button type="submit">Add Region</Button>
        </form>
      )}
      {isLoading ? (
        <p>Loading regions...</p>
      ) : (
        <ul className="space-y-2">
          {regions.map((region) => (
            <li
              key={region.id}
              className="p-3 bg-gray-50 rounded-md flex justify-between items-center"
            >
              <div>
                <span>{region.name}</span>
                <span className="text-sm text-gray-500 font-mono ml-4">
                  {region.id}
                </span>
              </div>
              {isAdmin && (
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    className="text-xs !py-1 !px-2"
                    onClick={() => setEditingRegion(region)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    className="text-xs !py-1 !px-2"
                    onClick={() => handleDeleteRegion(region.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {editingRegion && (
        <Modal
          isOpen={!!editingRegion}
          onClose={() => setEditingRegion(null)}
          title="Edit Region"
        >
          <form onSubmit={handleUpdateRegion} className="space-y-4">
            <input
              value={editingRegion.name}
              onChange={(e) =>
                setEditingRegion({ ...editingRegion, name: e.target.value })
              }
              className="input"
            />
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingRegion(null)}
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
export default RegionManager;
