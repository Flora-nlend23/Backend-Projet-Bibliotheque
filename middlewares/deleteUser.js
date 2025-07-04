// middlewares/deleteUser.js
// ========================
const db = require('../config/database');

// Supprime un utilisateur (si pas d'emprunt en cours)
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Vérifie les emprunts en cours
    const [emprunts] = await db.execute(
      'SELECT * FROM emprunts WHERE utilisateur_id = ? AND statut = "en_cours"',
      [userId]
    );

    if (emprunts.length > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer cet utilisateur. Il a des emprunts en cours.' 
      });
    }

    // Supprime l'utilisateur
    const [result] = await db.execute(
      'DELETE FROM utilisateurs WHERE id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    req.deleteResult = { message: 'Utilisateur supprimé avec succès' };
    next();
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = deleteUser;