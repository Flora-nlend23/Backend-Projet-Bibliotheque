// routes/notifications.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const db = require('../config/database');
const findAllNotifications = require('../middlewares/findAllNotifications');

// Récupérer toutes les notifications de l'utilisateur connecté
router.get('/', verifyToken, findAllNotifications, (req, res) => {
  res.json(req.notificationsResult);
});

// Marquer une notification comme lue
router.put('/:id/lue', verifyToken, async (req, res) => {
  try {
    const notification_id = req.params.id;
    const utilisateur_id = req.user.userId;
    const [notifications] = await db.execute('SELECT * FROM notifications WHERE id = ?', [notification_id]);
    if (notifications.length === 0) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    if (notifications[0].utilisateur_id !== utilisateur_id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    await db.execute('UPDATE notifications SET lu = true, date_lecture = NOW() WHERE id = ?', [notification_id]);
    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer une notification (utilisateur uniquement)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const notification_id = req.params.id;
    const utilisateur_id = req.user.userId;
    const [notifications] = await db.execute('SELECT * FROM notifications WHERE id = ?', [notification_id]);
    if (notifications.length === 0) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    if (notifications[0].utilisateur_id !== utilisateur_id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    await db.execute('DELETE FROM notifications WHERE id = ?', [notification_id]);
    res.json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
