import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import pool from "../config/db.js";

export const protectAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    // Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // Fetch user from DB (optional, but useful if you want user info)
    const [rows] = await pool.query(
      "SELECT PERSON_ID, USERNAME, EMAIL FROM persons WHERE PERSON_ID = ?",
      [decoded.id],
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Attach user to request
    req.user = rows[0];

    next();
  } catch (err) {
    console.error("protectAuth error:", err);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
