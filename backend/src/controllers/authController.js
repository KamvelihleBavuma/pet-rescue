import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

// ------------------ SIGNUP ------------------
export const signupUser = async (req, res) => {
  const { username, password, firstName, lastName, email } = req.body;

  // ✅ Basic input validation
  if (![username, password, firstName, lastName, email].every(Boolean)) {
    return res.status(400).json({
      success: false,
      message:
        "All fields (username, password, firstName, lastName, email) are required",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const [userResult] = await pool.query(
      `INSERT INTO persons (username, email, password_hash, first_name, last_name)
       VALUES (?, ?, ?, ?, ?)`,
      [
        username.trim(),
        email.trim(),
        hashedPassword,
        firstName.trim(),
        lastName.trim(),
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Student account created successfully",
      userId: userResult.insertId,
    });
  } catch (err) {
    console.error("Signup error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating account",
    });
  }
};

// ------------------ LOGIN ------------------
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM persons WHERE username = ?",
      [username.trim()],
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const user = rows[0];

    if (!user.PASSWORD_HASH) {
      console.error("DB row missing password_hash:", user);
      return res.status(500).json({
        success: false,
        message: "Server error: password field missing",
      });
    }
    const match = await bcrypt.compare(password, user.PASSWORD_HASH);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // ✅ Include role in token
    const token = jwt.sign(
      { id: user.PERSON_ID, username: user.USERNAME },
      ENV.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};
