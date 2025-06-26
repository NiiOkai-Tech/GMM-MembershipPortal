// File: controllers/authController.js
// Contains the logic for registration and login.

import bcrypt from "bcryptjs";
import { getDB } from "../../config/db.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { email, password, role, regionId, districtId, branchId } = req.body;

  // Basic validation
  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Please provide email, password, and role" });
  }

  try {
    const db = getDB();

    // Check if user already exists
    const userExistsQuery = "SELECT * FROM users WHERE email = ?";
    const [existingUsers] = await db.query(userExistsQuery, [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user into the database
    const insertUserQuery =
      "INSERT INTO users (email, password, role, regionId, districtId, branchId) VALUES (?, ?, ?, ?, ?, ?)";
    const [result] = await db.query(insertUserQuery, [
      email,
      hashedPassword,
      role,
      regionId || null,
      districtId || null,
      branchId || null,
    ]);

    if (result.affectedRows === 1) {
      res.status(201).json({
        id: result.insertId,
        email,
        role,
        token: generateToken(result.insertId), // Generate JWT
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = getDB();

    // Find user by email
    const userQuery = "SELECT * FROM users WHERE email = ?";
    const [users] = await db.query(userQuery, [email]);

    const user = users[0];

    // Check if user exists and password matches
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
    console.error(error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res) => {
  // The user object is attached to the request in the `protect` middleware
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
