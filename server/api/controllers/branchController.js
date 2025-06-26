// File: controllers/branchController.js
// Contains logic for branch CRUD operations.

import { getDB } from "../../config/db.js";

// @desc    Create a new branch
// @route   POST /api/branches
// @access  Private/Admin
export const createBranch = async (req, res) => {
  const { name, regionId, districtId } = req.body;
  if (!name || !regionId) {
    return res.status(400).json({ message: "Name and regionId are required" });
  }

  try {
    const db = getDB();
    const [result] = await db.query(
      "INSERT INTO branches (name, regionId, districtId) VALUES (?, ?, ?)",
      [name, regionId, districtId || null]
    );
    res.status(201).json({ id: result.insertId, name, regionId, districtId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating branch" });
  }
};

// @desc    Get all branches
// @route   GET /api/branches
// @access  Private
export const getBranches = async (req, res) => {
  try {
    const db = getDB();
    let query = `
            SELECT 
                b.id, b.name, b.regionId, b.districtId, 
                r.name as regionName, 
                d.name as districtName 
            FROM branches b 
            JOIN regions r ON b.regionId = r.id 
            LEFT JOIN districts d ON b.districtId = d.id
        `;
    const params = [];

    // Allow filtering by regionId and/or districtId
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

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += " ORDER BY b.name ASC";

    const [branches] = await db.query(query, params);
    res.json(branches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching branches" });
  }
};

// @desc    Get a single branch by ID
// @route   GET /api/branches/:id
// @access  Private
export const getBranchById = async (req, res) => {
  try {
    const db = getDB();
    const [branches] = await db.query("SELECT * FROM branches WHERE id = ?", [
      req.params.id,
    ]);

    if (branches.length > 0) {
      res.json(branches[0]);
    } else {
      res.status(404).json({ message: "Branch not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching branch" });
  }
};

// @desc    Update a branch
// @route   PUT /api/branches/:id
// @access  Private/Admin
export const updateBranch = async (req, res) => {
  const { name, regionId, districtId } = req.body;
  if (!name || !regionId) {
    return res.status(400).json({ message: "Name and regionId are required" });
  }

  try {
    const db = getDB();
    const [result] = await db.query(
      "UPDATE branches SET name = ?, regionId = ?, districtId = ? WHERE id = ?",
      [name, regionId, districtId || null, req.params.id]
    );

    if (result.affectedRows > 0) {
      res.json({ id: req.params.id, name, regionId, districtId });
    } else {
      res.status(404).json({ message: "Branch not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating branch" });
  }
};

// @desc    Delete a branch
// @route   DELETE /api/branches/:id
// @access  Private/Admin
export const deleteBranch = async (req, res) => {
  try {
    const db = getDB();
    const [result] = await db.query("DELETE FROM branches WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows > 0) {
      res.json({ message: "Branch removed" });
    } else {
      res.status(404).json({ message: "Branch not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting branch" });
  }
};
