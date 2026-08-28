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

export const getMyORGManagersNdStaff = async (req, res) => {
  try {
    const orgId = req.user.NPO_SPCA_ID; // comes from protectITAdmin middleware

    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID not found for current user",
      });
    }

    // Fetch managers
    const [managers] = await pool.query(
      `SELECT p.PERSON_ID, p.FIRST_NAME, p.LAST_NAME, p.USERNAME, p.EMAIL, p.ROLE,
              m.MANAGER_ID, m.NPO_SPCA_ID
       FROM persons p
       JOIN managers m ON p.PERSON_ID = m.PERSON_ID
       WHERE m.NPO_SPCA_ID = ?`,
      [orgId],
    );

    // Fetch rescue coordinators
    const [rescueCoordinators] = await pool.query(
      `SELECT p.PERSON_ID, p.FIRST_NAME, p.LAST_NAME, p.USERNAME, p.EMAIL, p.ROLE,
              r.RCID, r.NPO_SPCA_ID
       FROM persons p
       JOIN rescue_coordinators r ON p.PERSON_ID = r.PERSON_ID
       WHERE r.NPO_SPCA_ID = ?`,
      [orgId],
    );

    return res.status(200).json({
      success: true,
      message: "Organization staff retrieved successfully",
      organizationId: orgId,
      managers,
      rescueCoordinators,
    });
  } catch (error) {
    console.error("Error in getMyORGManagersNdStaff:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
