import pool from "../config/db.js";

export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.PERSON_ID; // comes from protectITAdmin middleware

    const [rows] = await pool.query(
      `SELECT p.PERSON_ID, p.FIRST_NAME, p.LAST_NAME, p.USERNAME, p.EMAIL, p.ROLE,
              i.ITADMIN_ID, i.NPO_SPCA_ID, n.NPO_SPCA_NAME, n.EMAIL AS ORG_EMAIL, n.PHONE AS ORG_PHONE
       FROM persons p
       JOIN itadmins i ON p.PERSON_ID = i.PERSON_ID
       JOIN npos_spcas n ON i.NPO_SPCA_ID = n.NPO_SPCA_ID
       WHERE p.PERSON_ID = ?`,
      [adminId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found",
      });
    }

    const profile = rows[0];

    return res.status(200).json({
      success: true,
      message: "Admin profile retrieved successfully",
      profile,
    });
  } catch (error) {
    console.error("Error in getAdminProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
