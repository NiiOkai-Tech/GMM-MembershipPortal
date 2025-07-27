// File: middleware/authMiddleware.js
// Middleware to protect routes by verifying JWT.
const jwt = require("jsonwebtoken");
const { getDB } = require("../../config/db.js");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "SUPER_ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

module.exports = { protect, admin };
