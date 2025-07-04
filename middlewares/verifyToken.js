// middlewares/verifyToken.js
// ========================
const jwt = require('jsonwebtoken');

// Middleware : vérifie la présence et la validité du token JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifie le token
    req.user = decoded; // Ajoute les infos du user à la requête
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token invalide.' });
  }
};

module.exports = verifyToken;

