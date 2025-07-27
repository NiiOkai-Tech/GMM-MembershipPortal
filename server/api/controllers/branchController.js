// File: controllers/branchController.js
// Contains logic for branch CRUD operations.
const { getDB } = require("../../config/db.js");
const { generateHierarchicalId } = require("../utils/generateUniqueId.js");

const createBranch = async (req, res) => {
  const { name, regionId, districtId } = req.body;
  if (!name || !regionId)
    return res.status(400).json({ message: "Name and regionId are required" });
  try {
    const db = getDB();
    const parentId = districtId || regionId;
    const newId = await generateHierarchicalId("branch", name, parentId);
    await db.query(
      "INSERT INTO branches (id, name, regionId, districtId) VALUES (?, ?, ?, ?)",
      [newId, name, regionId, districtId || null]
    );
    res.status(201).json({ id: newId, name, regionId, districtId });
  } catch (error) {
    res.status(500).json({ message: "Server error creating branch" });
  }
};

const getBranches = async (req, res) => {
  try {
    const db = getDB();
    let query = `SELECT b.id, b.name, b.regionId, b.districtId, r.name as regionName, d.name as districtName FROM branches b JOIN regions r ON b.regionId = r.id LEFT JOIN districts d ON b.districtId = d.id`;
    const params = [];
    const { regionId, districtId } = req.query;
    let whereClauses = [];
    if (regionId) {
      whereClauses.push("b.regionId = ?");
      params.push(regionId);
    }
    if (districtId) {
      whereClauses.push("b.districtId = ?");
      params.push(districtId);
    }
    if (whereClauses.length > 0)
      query += " WHERE " + whereClauses.join(" AND ");
    query += " ORDER BY b.name ASC";
    const [branches] = await db.query(query, params);
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching branches" });
  }
};

const getBranchById = async (req, res) => {
  try {
    const db = getDB();
    const [branches] = await db.query("SELECT * FROM branches WHERE id = ?", [
      req.params.id,
    ]);
    if (branches.length > 0) res.json(branches[0]);
    else res.status(404).json({ message: "Branch not found" });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching branch" });
  }
};

const updateBranch = async (req, res) => {
  const { name, regionId, districtId } = req.body;
  if (!name || !regionId)
    return res.status(400).json({ message: "Name and regionId are required" });
  try {
    const db = getDB();
    const [result] = await db.query(
      "UPDATE branches SET name = ?, regionId = ?, districtId = ? WHERE id = ?",
      [name, regionId, districtId || null, req.params.id]
    );
    if (result.affectedRows > 0)
      res.json({ id: req.params.id, name, regionId, districtId });
    else res.status(404).json({ message: "Branch not found" });
  } catch (error) {
    res.status(500).json({ message: "Server error updating branch" });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const db = getDB();
    const [result] = await db.query("DELETE FROM branches WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows > 0) res.json({ message: "Branch removed" });
    else res.status(404).json({ message: "Branch not found" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting branch" });
  }
};

module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
};
