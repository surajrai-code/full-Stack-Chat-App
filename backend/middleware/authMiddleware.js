const jwt = require('jsonwebtoken');

// Middleware to get user data from request
exports.getUserDataFromRequest = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        req.userData = userData;
        next();
      });
    } else {
      throw 'no token';
    }
  } catch (error) {
    res.status(401).json('no token');
  }
};
