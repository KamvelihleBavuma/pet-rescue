import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import pool from "../config/db.js";

export const protectITAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    // Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // Fetch IT admin with NPO_SPCA_ID
    const [rows] = await pool.query(
      `SELECT p.PERSON_ID, p.USERNAME, p.EMAIL, p.ROLE, i.NPO_SPCA_ID
       FROM persons p
       JOIN itadmins i ON p.PERSON_ID = i.PERSON_ID
       WHERE p.PERSON_ID = ?`,
      [decoded.id],
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "IT Admin not found" });
    }

    const user = rows[0];

    // Enforce role check
    if (user.ROLE !== "ADMIN") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Not an IT Admin." });
    }

    // Attach IT admin info (including NPO_SPCA_ID) to request
    req.user = user;

    next();
  } catch (err) {
    console.error("protectITAdmin error:", err);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
