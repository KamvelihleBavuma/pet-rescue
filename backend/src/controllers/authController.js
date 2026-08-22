import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { genToken } from "../config/genToken.js";

export const signupUser = async (req, res) => {
  const { username, password, firstName, lastName, email } = req.body;

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

    const newUserId = userResult.insertId;

    // ✅ Issue token immediately so user stays logged in
    const token = genToken(res, newUserId);

    return res.status(201).json({
      success: true,
      message: "Student account created successfully",
      userId: newUserId,
      token,
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

    const match = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = genToken(res, user.PERSON_ID);

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

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({
      success: false,
      message: "Error logging out",
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json({
      message: "user is logged in",
      user: req.user,
    });
  } catch (error) {
    console.log("Error in loginUser", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
