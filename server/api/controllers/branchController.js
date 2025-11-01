const { getDB } = require("../../config/db.js");
const { generateHierarchicalId } = require("../utils/generateUniqueId.js");
const { errorLogger } = require("../../config/logger.js");

const createBranch = async (req, res, next) => {
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
    errorLogger.error({
      controller: "createBranch",
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    return next(error);
  }
};

const getBranches = async (req, res, next) => {
  try {
    const db = getDB();
    let query = `
      SELECT b.id, b.name, b.regionId, b.districtId,
             r.name AS regionName, d.name AS districtName
      FROM branches b
      JOIN regions r ON b.regionId = r.id
      LEFT JOIN districts d ON b.districtId = d.id
    `;
    const params = [];
    const { regionId, districtId } = req.query;
    const whereClauses = [];

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
    errorLogger.error({
      controller: "getBranches",
      message: error.message,
      stack: error.stack,
    });
    return next(error);
  }
};

const getBranchById = async (req, res, next) => {
  try {
    const db = getDB();
    const [branches] = await db.query("SELECT * FROM branches WHERE id = ?", [
      req.params.id,
    ]);

    if (!branches.length)
      return res.status(404).json({ message: "Branch not found" });

    res.json(branches[0]);
  } catch (error) {
    errorLogger.error({
      controller: "getBranchById",
      message: error.message,
      stack: error.stack,
    });
    return next(error);
  }
};

const updateBranch = async (req, res, next) => {
  const { name, regionId, districtId } = req.body;

  if (!name || !regionId)
    return res.status(400).json({ message: "Name and regionId are required" });

  try {
    const db = getDB();
    const [result] = await db.query(
      "UPDATE branches SET name=?, regionId=?, districtId=? WHERE id=?",
      [name, regionId, districtId || null, req.params.id]
    );

    if (!result.affectedRows)
      return res.status(404).json({ message: "Branch not found" });

    res.json({ id: req.params.id, name, regionId, districtId });
  } catch (error) {
    errorLogger.error({
      controller: "updateBranch",
      message: error.message,
      stack: error.stack,
    });
    return next(error);
  }
};

const deleteBranch = async (req, res, next) => {
  try {
    const db = getDB();
    const [result] = await db.query("DELETE FROM branches WHERE id = ?", [
      req.params.id,
    ]);

    if (!result.affectedRows)
      return res.status(404).json({ message: "Branch not found" });

    res.json({ message: "Branch removed" });
  } catch (error) {
    errorLogger.error({
      controller: "deleteBranch",
      message: error.message,
      stack: error.stack,
    });
    return next(error);
  }
};

module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
};
