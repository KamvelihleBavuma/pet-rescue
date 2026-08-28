import pool from "../config/db.js";

export const getManagerProfile = async (req, res) => {
  try {
    const managerId = req.user.PERSON_ID; // comes from protect middleware

    const [rows] = await pool.query(
      `SELECT p.PERSON_ID, p.FIRST_NAME, p.LAST_NAME, p.USERNAME, p.EMAIL, p.ROLE,
              m.MANAGER_ID, m.NPO_SPCA_ID, n.NPO_SPCA_NAME, n.EMAIL AS ORG_EMAIL, n.PHONE AS ORG_PHONE
       FROM persons p
       JOIN managers m ON p.PERSON_ID = m.PERSON_ID
       JOIN npos_spcas n ON m.NPO_SPCA_ID = n.NPO_SPCA_ID
       WHERE p.PERSON_ID = ?`,
      [managerId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Manager profile not found",
      });
    }

    const profile = rows[0];

    return res.status(200).json({
      success: true,
      message: "Manager profile retrieved successfully",
      profile,
    });
  } catch (error) {
    console.error("Error in getManagerProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
