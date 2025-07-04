// routes/historique_emprunts.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const findAllHistoriqueEmprunts = require('../middlewares/findAllHistoriqueEmprunts');

// Récupérer l'historique des emprunts (admin = tout, utilisateur = ses actions)
router.get('/', verifyToken, findAllHistoriqueEmprunts, (req, res) => {
  res.json(req.historiquesResult);
});

// Récupérer l'historique d'un utilisateur spécifique
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.user.role !== 'admin' && req.user.userId != userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    const [historiques] = await require('../config/database').execute(
      'SELECT * FROM historique_emprunts WHERE utilisateur_id = ? ORDER BY date_action DESC',
      [userId]
    );
    res.json({ historique: historiques });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
