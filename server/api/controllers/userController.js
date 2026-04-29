// File: controllers/userController.js
// Contains logic for managing executive users.
const bcrypt = require("bcryptjs");
const { getDB } = require("../../config/db.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const getUsers = async (req, res) => {
  try {
    const db = getDB();
    const [users] = await db.query(
      "SELECT id, email, role, regionId, districtId, branchId FROM users ORDER BY email",
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching users." });
  }
};

const createUser = async (req, res) => {
  const { email, password, role, regionId, districtId, branchId } = req.body;
  if (!email || !password || !role)
    return res
      .status(400)
      .json({ message: "Please provide email, password, and role" });

  try {
    const db = getDB();
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );
    if (existingUsers.length > 0)
      return res
        .status(400)
        .json({ message: "User with this email already exists" });

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
      ],
    );

    if (result.affectedRows === 1) {
      res.status(201).json({ id: result.insertId, email, role });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error creating user" });
  }
};

const updateUser = async (req, res) => {
  const { email, role, regionId, districtId, branchId } = req.body;
  if (!email || !role)
    return res.status(400).json({ message: "Email and role are required" });

  try {
    const db = getDB();
    const [result] = await db.query(
      "UPDATE users SET email = ?, role = ?, regionId = ?, districtId = ?, branchId = ? WHERE id = ?",
      [
        email,
        role,
        regionId || null,
        districtId || null,
        branchId || null,
        req.params.id,
      ],
    );

    if (result.affectedRows > 0) {
      res.json({ message: "User updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error updating user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const db = getDB();
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows > 0) {
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error deleting user" });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Please provide both current and new passwords." });
  }

  try {
    const db = getDB();
    const [users] = await db.query("SELECT password FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedNewPassword,
      userId,
    ]);

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error changing password." });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });

  try {
    const db = getDB();
    const [users] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    // Always respond the same way to prevent user enumeration
    if (users.length === 0) {
      return res.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      "UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?",
      [token, expires, users[0].id],
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", // false for port 587 (STARTTLS), true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Ghana Muslim Mission" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset for your GMM Membership Portal account.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
      `,
    });

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// POST /api/users/reset-password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res
      .status(400)
      .json({ message: "Token and new password are required." });

  try {
    const db = getDB();
    const [users] = await db.query(
      "SELECT id FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW()",
      [token],
    );

    if (users.length === 0)
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(
      "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?",
      [hashedPassword, users[0].id],
    );

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
