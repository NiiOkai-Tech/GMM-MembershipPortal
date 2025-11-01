// File: utils/generateUniqueId.js
const { getDB } = require("../../config/db.js");

// Create a short uppercase code from a name
const createCodeFromName = (name) => {
  return name
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 3);
};

// Hierarchical ID for region/district/branch
const generateHierarchicalId = async (type, name, parentId = null) => {
  const db = getDB();
  let prefix = "";
  let tableName = "";
  const baseCode = createCodeFromName(name);
  let finalId = "";

  switch (type) {
    case "region":
      prefix = "REG";
      tableName = "regions";
      finalId = `${prefix}-${baseCode}`;
      break;

    case "district":
      prefix = "DIS";
      tableName = "districts";
      const regionCode = parentId.replace("REG-", "");
      finalId = `${prefix}-${regionCode}-${baseCode}`;
      break;

    case "branch":
      prefix = "BR";
      tableName = "branches";
      const parentCode = parentId.replace(/(REG-|DIS-)/g, "");
      finalId = `${prefix}-${parentCode}-${baseCode}`;
      break;

    default:
      throw new Error("Invalid ID type specified.");
  }

  // Ensure uniqueness in DB
  let uniqueId = finalId;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const [rows] = await db.query(`SELECT id FROM ${tableName} WHERE id = ?`, [
      uniqueId,
    ]);
    if (rows.length === 0) {
      isUnique = true;
    } else {
      counter++;
      uniqueId = `${finalId}${counter}`;
    }
  }

  return uniqueId;
};

// Generate unique Member ID
const generateMemberId = async (regionId, districtId, branchId) => {
  const db = getDB();

  const extractCode = (id) => {
    if (!id || typeof id !== "string") return null;
    return id.split("-").pop();
  };

  const regionCode = extractCode(regionId);
  const districtCode = extractCode(districtId) || "ND"; // ND = No District
  const branchCode = extractCode(branchId);

  if (!regionCode || !branchCode) {
    throw new Error(
      "Valid Region and Branch IDs are required to generate Member ID."
    );
  }

  const prefix = `${regionCode}-${districtCode}-${branchCode}`;

  let unique = false;
  let memberId = "";

  while (!unique) {
    // Generate a random 12-digit number (leading zeros allowed)
    const randomDigits = Math.floor(Math.random() * 1e12)
      .toString()
      .padStart(12, "0");

    memberId = `${prefix}-${randomDigits}`;

    // Check if this ID already exists
    const [rows] = await db.query("SELECT id FROM members WHERE id = ?", [
      memberId,
    ]);
    if (rows.length === 0) {
      unique = true;
    }
  }

  return memberId;
};

module.exports = { generateHierarchicalId, generateMemberId };
