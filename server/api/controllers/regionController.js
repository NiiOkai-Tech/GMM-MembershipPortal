// File: controllers/regionController.js
// Contains the business logic for region CRUD operations.

import { getDB } from "../../config/db.js";

// @desc    Create a new region
// @route   POST /api/regions
// @access  Private/Admin
export const createRegion = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Region name is required" });
  }

  try {
    const db = getDB();

    // Check if region already exists
    const [existing] = await db.query("SELECT * FROM regions WHERE name = ?", [
      name,
    ]);
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Region with this name already exists" });
    }

    const [result] = await db.query("INSERT INTO regions (name) VALUES (?)", [
      name,
    ]);

    res.status(201).json({
      id: result.insertId,
      name: name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating region" });
  }
};

// @desc    Get all regions
// @route   GET /api/regions
// @access  Private
export const getRegions = async (req, res) => {
  try {
    const db = getDB();
    const [regions] = await db.query("SELECT * FROM regions ORDER BY name ASC");
    res.json(regions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching regions" });
  }
};

// @desc    Get a single region by ID
// @route   GET /api/regions/:id
// @access  Private
export const getRegionById = async (req, res) => {
  try {
    const db = getDB();
    const [regions] = await db.query("SELECT * FROM regions WHERE id = ?", [
      req.params.id,
    ]);

    if (regions.length > 0) {
      res.json(regions[0]);
    } else {
      res.status(404).json({ message: "Region not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching region" });
  }
};

// @desc    Update a region
// @route   PUT /api/regions/:id
// @access  Private/Admin
export const updateRegion = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Region name is required" });
  }

  try {
    const db = getDB();
    const [result] = await db.query(
      "UPDATE regions SET name = ? WHERE id = ?",
      [name, req.params.id]
    );

    if (result.affectedRows > 0) {
      res.json({ id: req.params.id, name: name });
    } else {
      res.status(404).json({ message: "Region not found" });
    }
  } catch (error) {
    // Handle potential duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "A region with this name already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Server error updating region" });
  }
};

// @desc    Delete a region
// @route   DELETE /api/regions/:id
// @access  Private/Admin
export const deleteRegion = async (req, res) => {
  try {
    const db = getDB();
    const [result] = await db.query("DELETE FROM regions WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows > 0) {
      res.json({ message: "Region removed" });
    } else {
      res.status(404).json({ message: "Region not found" });
    }
  } catch (error) {
    console.error(error);
    // Note: Deleting a region will cascade and delete related districts/branches.
    // This is handled by the FOREIGN KEY constraints in the database schema.
    res.status(500).json({ message: "Server error deleting region" });
  }
};
