// =============================
// Middleware : récupération d'un utilisateur par son ID
// =============================
const db = require('../config/database'); // Import du pool de connexion MySQL

/**
 * Récupère un utilisateur depuis la base de données à partir de son ID (dans l'URL ou le token)
 * Si trouvé, ajoute l'utilisateur à req.foundUser et passe au middleware suivant
 * Sinon, renvoie une erreur 404
 */
const UserOne = async (req, res, next) => {
  try {
    // On récupère l'ID de l'utilisateur (soit dans l'URL, soit dans le token JWT)
    const userId = req.params.id || req.user.userId;

    // On exécute la requête SQL pour récupérer toutes les infos du profil
    const [users] = await db.execute(
      `SELECT id, nom, prenom, email, numero_etudiant, telephone, adresse, date_naissance, niveau_etude, filiere, role, statut, date_inscription, derniere_connexion, nombre_emprunts_total, nombre_retards, photo_profil, created_at, updated_at
       FROM utilisateurs WHERE id = ?`,
      [userId]
    );

    // Si aucun utilisateur trouvé, on renvoie une erreur 404
    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // On ajoute l'utilisateur trouvé à la requête pour les middlewares suivants
    req.foundUser = users[0];
    next();
  } catch (error) {
    // Gestion des erreurs SQL ou autres
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// On exporte le middleware pour l'utiliser dans les routes
module.exports = UserOne;
