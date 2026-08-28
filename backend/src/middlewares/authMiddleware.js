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

    // Fetch person
    const [rows] = await pool.query(
      "SELECT PERSON_ID, USERNAME, EMAIL, ROLE FROM persons WHERE PERSON_ID = ?",
      [decoded.id],
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    let user = rows[0];

    // Attach org ID if role requires it
    if (user.ROLE === "ITADMIN") {
      const [adminRows] = await pool.query(
        "SELECT NPO_SPCA_ID FROM itadmin WHERE PERSON_ID = ?",
        [user.PERSON_ID],
      );
      if (adminRows.length > 0) user.NPO_SPCA_ID = adminRows[0].NPO_SPCA_ID;
    } else if (user.ROLE === "MANAGER") {
      const [managerRows] = await pool.query(
        "SELECT NPO_SPCA_ID FROM managers WHERE PERSON_ID = ?",
        [user.PERSON_ID],
      );
      if (managerRows.length > 0) user.NPO_SPCA_ID = managerRows[0].NPO_SPCA_ID;
    } else if (user.ROLE === "RESCUE_COORDINATOR") {
      const [rcRows] = await pool.query(
        "SELECT NPO_SPCA_ID FROM rescue_coordinators WHERE PERSON_ID = ?",
        [user.PERSON_ID],
      );
      if (rcRows.length > 0) user.NPO_SPCA_ID = rcRows[0].NPO_SPCA_ID;
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error("protectAuth error:", err);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
