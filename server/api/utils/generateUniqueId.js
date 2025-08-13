// File: utils/generateUniqueId.js
// Converted to CommonJS syntax.
const { getDB } = require("../../config/db.js");

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

const generateHierarchicalId = async (type, name, parentId = null) => {
  const db = getDB();
  let prefix = "";
  let tableName = "";
  let baseCode = createCodeFromName(name);
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

const generateMemberId = async (regionId, districtId, branchId, joinYear) => {
  const db = getDB();

  const extractCode = (id) => {
    if (!id || typeof id !== "string") return null;
    return id.split("-").pop();
  };

  const regionCode = extractCode(regionId);
  const districtCode = extractCode(districtId) || "GMM"; // Placeholder if no district
  const branchCode = extractCode(branchId);

  if (!regionCode || !branchCode) {
    throw new Error(
      "Valid Region ID and Branch ID are required to generate a Member ID."
    );
  }

  const prefix = `${regionCode}-${districtCode}-${branchCode}-${joinYear}-`;

  const query = `SELECT id FROM members WHERE id LIKE ? ORDER BY id DESC LIMIT 1`;
  const [lastMembers] = await db.query(query, [`${prefix}%`]);

  let nextSequence = 1;
  if (lastMembers.length > 0) {
    const lastId = lastMembers[0].id;
    const lastSequence = parseInt(lastId.split("-").pop(), 10);
    nextSequence = lastSequence + 1;
  }

  const sequenceString = nextSequence.toString().padStart(4, "0");

  return `${prefix}${sequenceString}`;
};

module.exports = { generateHierarchicalId, generateMemberId };
