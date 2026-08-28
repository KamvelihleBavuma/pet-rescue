import pool from "../config/db.js";

export const getRescueCoordinatorProfile = async (req, res) => {
  try {
    const rcPersonId = req.user.PERSON_ID; // comes from protect middleware

    const [rows] = await pool.query(
      `SELECT p.PERSON_ID, p.FIRST_NAME, p.LAST_NAME, p.USERNAME, p.EMAIL, p.ROLE,
              r.RCID, r.NPO_SPCA_ID, n.NPO_SPCA_NAME, n.EMAIL AS ORG_EMAIL, n.PHONE AS ORG_PHONE
       FROM persons p
       JOIN rescue_coordinators r ON p.PERSON_ID = r.PERSON_ID
       JOIN npos_spcas n ON r.NPO_SPCA_ID = n.NPO_SPCA_ID
       WHERE p.PERSON_ID = ?`,
      [rcPersonId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Rescue coordinator profile not found",
      });
    }

    const profile = rows[0];

    return res.status(200).json({
      success: true,
      message: "Rescue coordinator profile retrieved successfully",
      profile,
    });
  } catch (error) {
    console.error("Error in getRescueCoordinatorProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
