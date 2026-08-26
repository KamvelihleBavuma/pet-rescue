import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { genToken } from "../config/genToken.js";

export const signupUser = async (req, res) => {
  const {
    username,
    password,
    firstName,
    lastName,
    email,
    role = "COMMUNITY_MEMBER",
  } = req.body;

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
      `INSERT INTO persons (username, email, password_hash, first_name, last_name, role)
       VALUES (?, ?, ?, ?, ?,?)`,
      [
        username.trim(),
        email.trim(),
        hashedPassword,
        firstName.trim(),
        lastName.trim(),
        role.toUpperCase(),
      ],
    );

    const newUserId = userResult.insertId;

    if (role.toUpperCase() === "COMMUNITY_MEMBER") {
      await pool.query(`INSERT INTO community_members (person_id) VALUES (?)`, [
        newUserId,
      ]);
    }

    if (role.toUpperCase() === "PET_OWNER") {
      await pool.query(`INSERT INTO pet_owners (person_id) VALUES (?)`, [
        newUserId,
      ]);
    }

    if (role.toUpperCase() === "ADMIN") {
      await pool.query(`INSERT INTO itadmins (person_id) VALUES (?)`, [
        newUserId,
      ]);
    }

    const token = genToken(res, newUserId);

    return res.status(201).json({
      success: true,
      message: "Student account created successfully",
      userId: newUserId,
      role: role.toUpperCase(),
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

export const registerManager = async (req, res) => {
  try {
    const { personId } = req.params;
    const adminNpoSpcaId = req.user.NPO_SPCA_ID; // IT admin's org ID

    // Check if person exists and is COMMUNITY_MEMBER
    const [rows] = await pool.query(
      "SELECT * FROM persons WHERE PERSON_ID = ?",
      [personId],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Person not found" });
    }

    const person = rows[0];
    if (person.ROLE !== "COMMUNITY_MEMBER") {
      return res.status(400).json({
        success: false,
        message: "Only COMMUNITY_MEMBER can be promoted to MANAGER",
      });
    }

    // Update role in PERSONS
    await pool.query("UPDATE persons SET ROLE = ? WHERE PERSON_ID = ?", [
      "MANAGER",
      personId,
    ]);

    // Insert into MANAGER table with IT admin’s NPO_SPCA_ID
    await pool.query(
      "INSERT INTO managers (person_id, npo_spca_id) VALUES (?, ?)",
      [personId, adminNpoSpcaId],
    );

    return res.status(201).json({
      success: true,
      message: "Manager registered successfully",
      personId,
      npoSpcaId: adminNpoSpcaId,
    });
  } catch (err) {
    console.error("Manager registration error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error registering manager" });
  }
};

export const registerRescueCoordinator = async (req, res) => {
  try {
    const { personId } = req.params;
    const adminNpoSpcaId = req.user.NPO_SPCA_ID; // IT admin’s org ID

    // Check if person exists and is COMMUNITY_MEMBER
    const [rows] = await pool.query(
      "SELECT * FROM persons WHERE PERSON_ID = ?",
      [personId],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Person not found" });
    }

    const person = rows[0];
    if (person.ROLE !== "COMMUNITY_MEMBER") {
      return res.status(400).json({
        success: false,
        message: "Only COMMUNITY_MEMBER can be promoted to RESCUE_COORDINATOR",
      });
    }

    // Update role in PERSONS
    await pool.query("UPDATE persons SET ROLE = ? WHERE PERSON_ID = ?", [
      "RESCUE_COORDINATOR",
      personId,
    ]);

    // Insert into RESCUE_COORDINATOR table with IT admin’s NPO_SPCA_ID
    await pool.query(
      "INSERT INTO rescue_coordinators (person_id, npo_spca_id) VALUES (?, ?)",
      [personId, adminNpoSpcaId],
    );

    return res.status(201).json({
      success: true,
      message: "Rescue coordinator registered successfully",
      personId,
      npoSpcaId: adminNpoSpcaId,
    });
  } catch (err) {
    console.error("Rescue coordinator registration error:", err);
    return res.status(500).json({
      success: false,
      message: "Error registering rescue coordinator",
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
      user,
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

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT p.PERSON_ID, p.FIRST_NAME, p.LAST_NAME, p.USERNAME, p.EMAIL, p.ROLE,
              m.NPO_SPCA_ID AS manager_spca,
              r.NPO_SPCA_ID AS rc_spca,
              i.NPO_SPCA_ID AS admin_spca
       FROM persons p
       LEFT JOIN managers m ON p.PERSON_ID = m.PERSON_ID
       LEFT JOIN rescue_coordinators r ON p.PERSON_ID = r.PERSON_ID
       LEFT JOIN itadmins i ON p.PERSON_ID = i.PERSON_ID
       ORDER BY p.PERSON_ID ASC`,
    );

    // Normalize roles
    const safeUsers = users.map((u) => ({
      PERSON_ID: u.PERSON_ID,
      FIRST_NAME: u.FIRST_NAME,
      LAST_NAME: u.LAST_NAME,
      USERNAME: u.USERNAME,
      EMAIL: u.EMAIL,
      ROLE: u.ROLE ? u.ROLE.toUpperCase() : null,
      NPO_SPCA_ID: u.manager_spca || u.rc_spca || u.admin_spca || null,
    }));

    return res.status(200).json({
      success: true,
      count: safeUsers.length,
      users: safeUsers,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
