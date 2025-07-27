// File: controllers/authController.js
// Contains the logic for registration and login.
const bcrypt = require("bcryptjs");
const { getDB } = require("../../config/db.js");
const generateToken = require("../utils/generateToken.js");

const registerUser = async (req, res) => {
  const { email, password, role, regionId, districtId, branchId } = req.body;
  if (!email || !password || !role)
    return res
      .status(400)
      .json({ message: "Please provide email, password, and role" });
  try {
    const db = getDB();
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0)
      return res.status(400).json({ message: "User already exists" });
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
    if (result.affectedRows === 1) {
      res.status(201).json({ id: result.insertId, email, role });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = getDB();
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = users[0];
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        regionId: user.regionId,
        districtId: user.districtId,
        branchId: user.branchId,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};

const getUserProfile = async (req, res) => {
  const user = req.user;
  if (user) {
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      regionId: user.regionId,
      districtId: user.districtId,
      branchId: user.branchId,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

module.exports = { loginUser, getUserProfile };
