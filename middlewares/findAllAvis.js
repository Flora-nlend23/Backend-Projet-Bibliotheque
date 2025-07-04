


// Middleware : récupère les avis sur un livre (ou tous les avis)
const db = require('../config/database');

const findAllAvis = async (req, res, next) => {
  try {
    // Récupère l'id du livre si fourni en query
    const livre_id = req.query.livre_id;
    let query = 'SELECT * FROM avis_livres';
    let params = [];
    if (livre_id) {
      // Filtre par livre si précisé
      query += ' WHERE livre_id = ?';
      params.push(livre_id);
    }
    // Trie par date d'avis la plus récente
    query += ' ORDER BY date_avis DESC';
    const [avis] = await db.execute(query, params);
    // Attache le résultat à la requête
    req.avisResult = avis;
    next();
  } catch (error) {
    // Gestion des erreurs SQL
    console.error('Erreur lors de la récupération des avis:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = findAllAvis;
