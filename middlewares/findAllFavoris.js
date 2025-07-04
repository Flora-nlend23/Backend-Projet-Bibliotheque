


// Middleware : récupère la liste des favoris de l'utilisateur connecté
const db = require('../config/database');

const findAllFavoris = async (req, res, next) => {
  try {
    // Récupère l'id utilisateur depuis le token
    const utilisateur_id = req.user.userId;
    // Sélectionne tous les favoris de l'utilisateur
    const [favoris] = await db.execute(
      'SELECT * FROM favoris WHERE utilisateur_id = ?',
      [utilisateur_id]
    );
    // Attache le résultat à la requête
    req.favorisResult = favoris;
    next();
  } catch (error) {
    // Gestion des erreurs SQL
    console.error('Erreur lors de la récupération des favoris:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = findAllFavoris;
