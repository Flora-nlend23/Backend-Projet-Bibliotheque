
// routes/reservations.js
// ========================
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const db = require('../config/database');
const findAllReservations = require('../middlewares/findAllReservations');

// Récupérer les réservations de l'utilisateur connecté
router.get('/me', verifyToken, async (req, res) => {
  try {
    const utilisateur_id = req.user.userId;
    const [reservations] = await db.execute(
      `SELECT r.*, l.titre FROM reservations r
        LEFT JOIN livres l ON r.livre_id = l.id
        WHERE r.utilisateur_id = ?
        ORDER BY r.created_at DESC`,
      [utilisateur_id]
    );
    res.json({ reservations });
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer toutes les réservations (admin seulement)
router.get('/', verifyToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé. Administrateur requis.' });
  }
  next();
}, findAllReservations, (req, res) => {
  res.json(req.reservationsResult);
});

// Créer une réservation
router.post('/', verifyToken, async (req, res) => {
  try {
    const utilisateur_id = req.user.userId;
    const { livre_id, date_expiration } = req.body;
    if (!livre_id || !date_expiration) {
      return res.status(400).json({ message: 'Champs requis manquants.' });
    }
    const [result] = await db.execute(
      'INSERT INTO reservations (utilisateur_id, livre_id, date_expiration) VALUES (?, ?, ?)',
      [utilisateur_id, livre_id, date_expiration]
    );
    res.status(201).json({
      message: 'Réservation créée avec succès',
      reservation: {
        id: result.insertId,
        utilisateur_id,
        livre_id,
        date_expiration
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Annuler une réservation (utilisateur ou admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const reservation_id = req.params.id;
    const utilisateur_id = req.user.userId;
    const [reservations] = await db.execute(
      'SELECT * FROM reservations WHERE id = ?',
      [reservation_id]
    );
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    const reservation = reservations[0];
    if (req.user.role !== 'admin' && reservation.utilisateur_id !== utilisateur_id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    await db.execute('DELETE FROM reservations WHERE id = ?', [reservation_id]);
    res.json({ message: 'Réservation annulée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la réservation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
