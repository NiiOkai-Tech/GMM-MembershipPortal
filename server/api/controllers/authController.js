const bcrypt = require("bcryptjs");
const { getDB } = require("../../config/db.js");
const generateToken = require("../utils/generateToken.js");
const { errorLogger } = require("../../config/logger.js");

const registerUser = async (req, res, next) => {
  const { email, password, role, regionId, districtId, branchId } = req.body;

  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Please provide email, password, and role" });
  }

  try {
    const db = getDB();
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      "INSERT INTO users (email, password, role, regionId, districtId, branchId) VALUES (?, ?, ?, ?, ?, ?)",
      [
        email,
        hashedPassword,
        role,
        regionId || null,
        districtId || null,
        branchId || null,
      ]
    );

    res.status(201).json({ id: result.insertId, email, role });
  } catch (error) {
    errorLogger.error({
      controller: "registerUser",
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const db = getDB();
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    const user = users[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        regionId: user.regionId,
        districtId: user.districtId,
        branchId: user.branchId,
        token: generateToken(user.id),
      });
    }

    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    errorLogger.error({
      controller: "loginUser",
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    return next(error);
  }
};

const getUserProfile = (req, res) => {
  if (!req.user) return res.status(404).json({ message: "User not found" });

  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    regionId: req.user.regionId,
    districtId: req.user.districtId,
    branchId: req.user.branchId,
  });
};

module.exports = { registerUser, loginUser, getUserProfile };
