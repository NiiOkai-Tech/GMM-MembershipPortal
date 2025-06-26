// File: middleware/authMiddleware.js
// Middleware to protect routes by verifying JWT.

import jwt from "jsonwebtoken";
import { getDB } from "../../config/db.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database and attach to request
      const db = getDB();
      const userQuery =
        "SELECT id, email, role, regionId, districtId, branchId FROM users WHERE id = ?";
      const [users] = await db.query(userQuery, [decoded.id]);

      if (users.length === 0) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      req.user = users[0];
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to check for Admin role
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "SUPER_ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};
