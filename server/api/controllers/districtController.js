// File: controllers/districtController.js
// NEW FILE: Contains logic for district CRUD operations.

import { getDB } from "../../config/db.js";

// @desc    Create a new district
// @route   POST /api/districts
// @access  Private/Admin
export const createDistrict = async (req, res) => {
  const { name, regionId } = req.body;
  if (!name || !regionId) {
    return res.status(400).json({ message: "Name and regionId are required" });
  }

  try {
    const db = getDB();
    const [result] = await db.query(
      "INSERT INTO districts (name, regionId) VALUES (?, ?)",
      [name, regionId]
    );
    res.status(201).json({ id: result.insertId, name, regionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating district" });
  }
};

// @desc    Get all districts
// @route   GET /api/districts
// @access  Private
export const getDistricts = async (req, res) => {
  try {
    const db = getDB();
    // Allow filtering by regionId
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
    console.error(error);
    res.status(500).json({ message: "Server error fetching districts" });
  }
};

// @desc    Get a single district by ID
// @route   GET /api/districts/:id
// @access  Private
export const getDistrictById = async (req, res) => {
  try {
    const db = getDB();
    const [districts] = await db.query("SELECT * FROM districts WHERE id = ?", [
      req.params.id,
    ]);

    if (districts.length > 0) {
      res.json(districts[0]);
    } else {
      res.status(404).json({ message: "District not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching district" });
  }
};

// @desc    Update a district
// @route   PUT /api/districts/:id
// @access  Private/Admin
export const updateDistrict = async (req, res) => {
  const { name, regionId } = req.body;
  if (!name || !regionId) {
    return res.status(400).json({ message: "Name and regionId are required" });
  }

  try {
    const db = getDB();
    const [result] = await db.query(
      "UPDATE districts SET name = ?, regionId = ? WHERE id = ?",
      [name, regionId, req.params.id]
    );

    if (result.affectedRows > 0) {
      res.json({ id: req.params.id, name, regionId });
    } else {
      res.status(404).json({ message: "District not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating district" });
  }
};

// @desc    Delete a district
// @route   DELETE /api/districts/:id
// @access  Private/Admin
export const deleteDistrict = async (req, res) => {
  try {
    const db = getDB();
    const [result] = await db.query("DELETE FROM districts WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows > 0) {
      res.json({ message: "District removed" });
    } else {
      res.status(404).json({ message: "District not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting district" });
  }
};
