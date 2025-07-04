

// Middleware : vérifie le token de réinitialisation et met à jour le mot de passe
const db = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = async (req, res, next) => {
  const { token, mot_de_passe } = req.body;
  if (!token || !mot_de_passe) return res.status(400).json({ message: 'Token et nouveau mot de passe requis' });
  try {
    // Vérifie le token et sa validité
    const [users] = await db.execute('SELECT * FROM utilisateurs WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Lien de réinitialisation invalide ou expiré' });
    }
    const user = users[0];
    // Hash le nouveau mot de passe et met à jour en base
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    await db.execute('UPDATE utilisateurs SET mot_de_passe = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashedPassword, user.id]);
    req.resetUser = user;
    next();
  } catch (err) {
    // Gestion des erreurs SQL
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
