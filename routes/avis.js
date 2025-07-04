// routes/avis.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const db = require('../config/database');
const findAllAvis = require('../middlewares/findAllAvis');

// Récupérer tous les avis d'un livre
router.get('/', findAllAvis, (req, res) => {
  res.json(req.avisResult);
});

// Ajouter un avis (utilisateur connecté)
router.post('/', verifyToken, async (req, res) => {
  try {
    const utilisateur_id = req.user.userId;
    const { livre_id, note, commentaire } = req.body;
    if (!livre_id || !note) {
      return res.status(400).json({ message: 'Champs requis manquants.' });
    }
    // Un utilisateur ne peut laisser qu'un avis par livre
    const [existing] = await db.execute(
      'SELECT * FROM avis_livres WHERE utilisateur_id = ? AND livre_id = ?',
      [utilisateur_id, livre_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà laissé un avis pour ce livre.' });
    }
    await db.execute(
      'INSERT INTO avis_livres (utilisateur_id, livre_id, note, commentaire) VALUES (?, ?, ?, ?)',
      [utilisateur_id, livre_id, note, commentaire]
    );
    res.status(201).json({ message: 'Avis ajouté avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'avis:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un avis (admin ou auteur)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const avis_id = req.params.id;
    const utilisateur_id = req.user.userId;
    const [avis] = await db.execute('SELECT * FROM avis_livres WHERE id = ?', [avis_id]);
    if (avis.length === 0) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }
    if (req.user.role !== 'admin' && avis[0].utilisateur_id !== utilisateur_id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    await db.execute('DELETE FROM avis_livres WHERE id = ?', [avis_id]);
    res.json({ message: 'Avis supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
