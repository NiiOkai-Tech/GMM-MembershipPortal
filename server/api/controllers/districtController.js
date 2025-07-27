// File: controllers/districtController.js
// Contains logic for district CRUD operations.
const { getDB } = require("../../config/db.js");
const { generateHierarchicalId } = require("../utils/generateUniqueId.js");

const createDistrict = async (req, res) => {
  const { name, regionId } = req.body;
  if (!name || !regionId)
    return res.status(400).json({ message: "Name and regionId are required" });
  try {
    const db = getDB();
    const newId = await generateHierarchicalId("district", name, regionId);
    await db.query(
      "INSERT INTO districts (id, name, regionId) VALUES (?, ?, ?)",
      [newId, name, regionId]
    );
    res.status(201).json({ id: newId, name, regionId });
  } catch (error) {
    res.status(500).json({ message: "Server error creating district" });
  }
};

const getDistricts = async (req, res) => {
  try {
    const db = getDB();
    let query =
      "SELECT d.id, d.name, d.regionId, r.name as regionName FROM districts d JOIN regions r ON d.regionId = r.id";
    const params = [];
    if (req.query.regionId) {
      query += " WHERE d.regionId = ?";
      params.push(req.query.regionId);
    }
    query += " ORDER BY d.name ASC";
    const [districts] = await db.query(query, params);
    res.json(districts);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching districts" });
  }
};

const getDistrictById = async (req, res) => {
  try {
    const db = getDB();
    const [districts] = await db.query("SELECT * FROM districts WHERE id = ?", [
      req.params.id,
    ]);
    if (districts.length > 0) res.json(districts[0]);
    else res.status(404).json({ message: "District not found" });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching district" });
  }
};

const updateDistrict = async (req, res) => {
  const { name, regionId } = req.body;
  if (!name || !regionId)
    return res.status(400).json({ message: "Name and regionId are required" });
  try {
    const db = getDB();
    const [result] = await db.query(
      "UPDATE districts SET name = ?, regionId = ? WHERE id = ?",
      [name, regionId, req.params.id]
    );
    if (result.affectedRows > 0)
      res.json({ id: req.params.id, name, regionId });
    else res.status(404).json({ message: "District not found" });
  } catch (error) {
    res.status(500).json({ message: "Server error updating district" });
  }
};

const deleteDistrict = async (req, res) => {
  try {
    const db = getDB();
    const [result] = await db.query("DELETE FROM districts WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows > 0) res.json({ message: "District removed" });
    else res.status(404).json({ message: "District not found" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting district" });
  }
};

module.exports = {
  createDistrict,
  getDistricts,
  getDistrictById,
  updateDistrict,
  deleteDistrict,
};
