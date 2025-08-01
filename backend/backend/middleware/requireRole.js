// backend/middleware/requireRole.js
export const requireRole = (...allowedRoles) => (req, res, next) => {
    console.log("requireRole middleware - user:", req.user);
    console.log("requireRole middleware - allowed roles:", allowedRoles);
    
    if (!req.user) {
      console.log("No user found in request");
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      console.log(`User role ${req.user.role} not in allowed roles:`, allowedRoles);
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    console.log("Role check passed for user:", req.user.role);
    next();
  };
  export default requireRole;
  