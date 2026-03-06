// Role-based access control middleware
const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        msg: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        msg: 'Access denied. Insufficient permissions.' 
      });
    }
    
    next();
  };
};

module.exports = roleCheck;

