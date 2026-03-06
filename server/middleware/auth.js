const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        msg: 'No token, authorization denied' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        msg: 'No token, authorization denied' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          msg: 'Token is not valid' 
        });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false,
        msg: 'Token is not valid' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      msg: 'Server error in authentication' 
    });
  }
};

module.exports = auth;

