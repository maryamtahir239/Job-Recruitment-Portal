// backend/middleware/requireRole.js
export const requireRole = (...allowedRoles) => (req, res, next) => {
    // Case-insensitive role comparison
    const userRole = req.user?.role?.toLowerCase();
    const allowedRolesLower = allowedRoles.map(r => r.toLowerCase());
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!allowedRolesLower.includes(userRole)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
  export default requireRole;
  