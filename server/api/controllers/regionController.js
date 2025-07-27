// File: controllers/regionController.js
// Contains the business logic for region CRUD operations.
const { getDB } = require("../../config/db.js");
const { generateHierarchicalId } = require("../utils/generateUniqueId.js");

const createRegion = async (req, res) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ message: "Region name is required" });
  try {
    const db = getDB();
    const [existing] = await db.query("SELECT * FROM regions WHERE name = ?", [
      name,
    ]);
    if (existing.length > 0)
      return res
        .status(400)
        .json({ message: "Region with this name already exists" });
    const newId = await generateHierarchicalId("region", name);
    await db.query("INSERT INTO regions (id, name) VALUES (?, ?)", [
      newId,
      name,
    ]);
    res.status(201).json({ id: newId, name: name });
  } catch (error) {
    res.status(500).json({ message: "Server error creating region" });
  }
};

const getRegions = async (req, res) => {
  try {
    const db = getDB();
    const [regions] = await db.query("SELECT * FROM regions ORDER BY name ASC");
    res.json(regions);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching regions" });
  }
};

const getRegionById = async (req, res) => {
  try {
    const db = getDB();
    const [regions] = await db.query("SELECT * FROM regions WHERE id = ?", [
      req.params.id,
    ]);
    if (regions.length > 0) res.json(regions[0]);
    else res.status(404).json({ message: "Region not found" });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching region" });
  }
};

const updateRegion = async (req, res) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ message: "Region name is required" });
  try {
    const db = getDB();
    const [result] = await db.query(
      "UPDATE regions SET name = ? WHERE id = ?",
      [name, req.params.id]
    );
    if (result.affectedRows > 0) res.json({ id: req.params.id, name: name });
    else res.status(404).json({ message: "Region not found" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      return res
        .status(400)
        .json({ message: "A region with this name already exists" });
    res.status(500).json({ message: "Server error updating region" });
  }
};

const deleteRegion = async (req, res) => {
  try {
    const db = getDB();
    const [result] = await db.query("DELETE FROM regions WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows > 0) res.json({ message: "Region removed" });
    else res.status(404).json({ message: "Region not found" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting region" });
  }
};

module.exports = {
  createRegion,
  getRegions,
  getRegionById,
  updateRegion,
  deleteRegion,
};
