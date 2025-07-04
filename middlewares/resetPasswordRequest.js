

// Middleware : génère un token de réinitialisation de mot de passe et le stocke en base
const db = require('../config/database');
const crypto = require('crypto');

module.exports = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email requis' });
  try {
    // Vérifie si l'utilisateur existe
    const [users] = await db.execute('SELECT * FROM utilisateurs WHERE email = ?', [email]);
    if (users.length === 0) {
      // Pour la sécurité, ne révèle pas si l'email existe ou non
      req.resetToken = null;
      return next();
    }
    const user = users[0];
    // Génère un token unique et une date d'expiration (30 min)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    // Stocke le token et l'expiration en base
    await db.execute('UPDATE utilisateurs SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [token, expires, user.id]);
    req.resetToken = token;
    req.resetEmail = email;
    next();
  } catch (err) {
    // Gestion des erreurs SQL
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
