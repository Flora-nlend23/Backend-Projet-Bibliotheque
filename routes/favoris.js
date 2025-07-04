// routes/favoris.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const db = require('../config/database');
const findAllFavoris = require('../middlewares/findAllFavoris');

// Récupérer tous les favoris de l'utilisateur connecté
router.get('/', verifyToken, findAllFavoris, (req, res) => {
  res.json(req.favorisResult);
});

// Ajouter un livre aux favoris
router.post('/', verifyToken, async (req, res) => {
  try {
    const utilisateur_id = req.user.userId;
    const { livre_id } = req.body;
    if (!livre_id) {
      return res.status(400).json({ message: 'ID du livre requis.' });
    }
    // Un utilisateur ne peut pas ajouter deux fois le même livre
    const [existing] = await db.execute(
      'SELECT * FROM favoris WHERE utilisateur_id = ? AND livre_id = ?',
      [utilisateur_id, livre_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Ce livre est déjà dans vos favoris.' });
    }
    await db.execute(
      'INSERT INTO favoris (utilisateur_id, livre_id) VALUES (?, ?)',
      [utilisateur_id, livre_id]
    );
    res.status(201).json({ message: 'Livre ajouté aux favoris' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du favori:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un favori (utilisateur uniquement)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const favori_id = req.params.id;
    const utilisateur_id = req.user.userId;
    const [favoris] = await db.execute('SELECT * FROM favoris WHERE id = ?', [favori_id]);
    if (favoris.length === 0) {
      return res.status(404).json({ message: 'Favori non trouvé' });
    }
    if (favoris[0].utilisateur_id !== utilisateur_id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    await db.execute('DELETE FROM favoris WHERE id = ?', [favori_id]);
    res.json({ message: 'Favori supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
