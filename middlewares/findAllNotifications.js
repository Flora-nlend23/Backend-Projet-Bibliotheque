


// Middleware : récupère toutes les notifications d'un utilisateur
const db = require('../config/database');

const findAllNotifications = async (req, res, next) => {
  try {
    // Récupère l'id utilisateur depuis le token
    const utilisateur_id = req.user.userId;
    // Sélectionne toutes les notifications de l'utilisateur, triées par date
    const [notifications] = await db.execute(
      'SELECT * FROM notifications WHERE utilisateur_id = ? ORDER BY date_creation DESC',
      [utilisateur_id]
    );
    // Attache le résultat à la requête
    req.notificationsResult = notifications;
    next();
  } catch (error) {
    // Gestion des erreurs SQL
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = findAllNotifications;
