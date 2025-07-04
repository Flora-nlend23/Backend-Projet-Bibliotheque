

// Middleware pour récupérer l'historique des emprunts d'un utilisateur (ou tous si admin)
const db = require('../config/database');

const findAllHistoriqueEmprunts = async (req, res, next) => {
  try {
    // Si admin, on récupère tout, sinon seulement l'utilisateur courant
    const utilisateur_id = req.user.role === 'admin' ? null : req.user.userId;
    let query = 'SELECT * FROM historique_emprunts';
    let params = [];
    if (utilisateur_id) {
      // Filtre par utilisateur si non admin
      query += ' WHERE utilisateur_id = ?';
      params.push(utilisateur_id);
    }
    // Trie par date d'action la plus récente
    query += ' ORDER BY date_action DESC';
    const [historiques] = await db.execute(query, params);
    // On attache le résultat à la requête pour la suite
    req.historiquesResult = historiques;
    next();
  } catch (error) {
    // Gestion des erreurs SQL
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = findAllHistoriqueEmprunts;
