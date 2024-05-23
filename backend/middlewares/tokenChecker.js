const jwt = require('jsonwebtoken');

const tokenChecker = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        jwt.verify(token, process.env.SUPER_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Access forbidden: Invalid token" });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(403).json({ message: "Access forbidden: No token provided" });
    }
};


function isAuthenticated(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      res.status(401).send({ success: false, message: "Not authenticated" });
    }
  }

  
  module.exports = { tokenChecker, isAuthenticated };
  

