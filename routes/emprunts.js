// routes/emprunts.js
// ========================
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const db = require('../config/database');
const sendLateReturnNotifications = require('../middlewares/sendLateReturnNotifications');
const sendBorrowConfirmationMail = require('../middlewares/sendBorrowConfirmationMail');

// Emprunter un livre
router.post('/', verifyToken, async (req, res) => {
  try {
    const { livre_id, date_emprunt, date_retour_prevue } = req.body;
    const utilisateur_id = req.user.userId;
    if (!livre_id) {
      return res.status(400).json({ message: 'ID du livre requis' });
    }
    // Vérifier si le livre existe et est disponible
    const [livres] = await db.execute(
      'SELECT * FROM livres WHERE id = ? AND statut = "disponible"',
      [livre_id]
    );
    if (livres.length === 0) {
      return res.status(400).json({ message: 'Livre non disponible' });
    }
    // Vérifier si l'utilisateur n'a pas déjà emprunté ce livre
    const [existingEmprunts] = await db.execute(
      'SELECT * FROM emprunts WHERE utilisateur_id = ? AND livre_id = ? AND statut = "en_cours"',
      [utilisateur_id, livre_id]
    );
    if (existingEmprunts.length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà emprunté ce livre' });
    }
    // Utiliser la date d'emprunt du frontend ou la date du jour
    const dateEmprunt = date_emprunt ? new Date(date_emprunt) : new Date();
    const dateEmpruntStr = dateEmprunt.toISOString().split('T')[0];
    if (!date_retour_prevue) {
      return res.status(400).json({ message: 'date_retour_prevue requise' });
    }
    const dateRetourPrevue = new Date(date_retour_prevue);
    const dateRetourPrevueStr = dateRetourPrevue.toISOString().split('T')[0];
    // Calcul de la durée prévue
    const duree_prevue_jours = Math.ceil((dateRetourPrevue - dateEmprunt) / (1000 * 60 * 60 * 24));
    // Créer l'emprunt avec toutes les colonnes pertinentes
    const statut = 'en_cours';
    const nombre_prolongations = 0;
    const max_prolongations = 2;
    const frais_retard = 0.00;
    const etat_livre_emprunt = livres[0].etat_livre || 'bon';
    const [result] = await db.execute(
      `INSERT INTO emprunts (utilisateur_id, livre_id, date_emprunt, date_retour_prevue, duree_prevue_jours, statut, nombre_prolongations, max_prolongations, frais_retard, etat_livre_emprunt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        utilisateur_id,
        livre_id,
        dateEmpruntStr,
        dateRetourPrevueStr,
        duree_prevue_jours,
        statut,
        nombre_prolongations,
        max_prolongations,
        frais_retard,
        etat_livre_emprunt
      ]
    );
    // Marquer le livre comme non disponible seulement si plus d'exemplaires
    await db.execute(
      'UPDATE livres SET quantite_disponible = quantite_disponible - 1 WHERE id = ? AND quantite_disponible > 0',
      [livre_id]
    );
    // Vérifier la quantité restante
    const [livreMaj] = await db.execute('SELECT quantite_disponible FROM livres WHERE id = ?', [livre_id]);
    if (livreMaj[0]?.quantite_disponible <= 0) {
      await db.execute('UPDATE livres SET statut = "indisponible" WHERE id = ?', [livre_id]);
    }
    // Envoi du mail de confirmation d'emprunt
    sendBorrowConfirmationMail(utilisateur_id, livre_id, dateRetourPrevueStr);
    res.status(201).json({
      message: 'Livre emprunté avec succès',
      emprunt: {
        id: result.insertId,
        livre_id,
        date_emprunt: dateEmpruntStr,
        date_retour_prevue: dateRetourPrevueStr,
        duree_prevue_jours,
        statut: 'en_cours'
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'emprunt:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Retourner un livre
router.put('/:id/retour', verifyToken, async (req, res) => {
  try {
    const emprunt_id = req.params.id;
    const utilisateur_id = req.user.userId;
    // Récupérer l'emprunt
    const [emprunts] = await db.execute(
      'SELECT * FROM emprunts WHERE id = ? AND (statut = "en_cours" OR statut = "prolonge" OR statut = "en_retard")',
      [emprunt_id]
    );
    if (emprunts.length === 0) {
      return res.status(404).json({ message: 'Emprunt non trouvé ou déjà retourné' });
    }
    const emprunt = emprunts[0];
    // Vérifier les permissions (utilisateur propriétaire ou admin)
    if (req.user.role !== 'admin' && emprunt.utilisateur_id !== utilisateur_id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    const date_retour_reelle = new Date().toISOString().split('T')[0];
    // Calcul de la durée réelle
    const duree_emprunt_jours = Math.ceil((new Date(date_retour_reelle) - new Date(emprunt.date_emprunt)) / (1000 * 60 * 60 * 24));
    // Statut toujours 'rendu' lors du retour
    const retourEnRetard = new Date(date_retour_reelle) > new Date(emprunt.date_retour_prevue);
    const statut = 'rendu';
    // Mettre à jour l'emprunt (ne pas supprimer !)
    await db.execute(
      'UPDATE emprunts SET date_retour_effective = ?, statut = ?, duree_emprunt_jours = ? WHERE id = ?',
      [date_retour_reelle, statut, duree_emprunt_jours, emprunt_id]
    );
    // Vérification du statut après update
    const [verif] = await db.execute('SELECT statut FROM emprunts WHERE id = ?', [emprunt_id]);
    console.log('Statut après retour:', verif[0]?.statut);
    // Marquer le livre comme disponible et incrémenter la quantité
    await db.execute(
      'UPDATE livres SET quantite_disponible = quantite_disponible + 1 WHERE id = ?',
      [emprunt.livre_id]
    );
    // Vérifier la quantité après retour
    const [livreMaj] = await db.execute('SELECT quantite_disponible FROM livres WHERE id = ?', [emprunt.livre_id]);
    if (livreMaj[0]?.quantite_disponible > 0) {
      await db.execute('UPDATE livres SET statut = "disponible" WHERE id = ?', [emprunt.livre_id]);
    }
    // Récupérer les infos du livre pour enrichir l'historique
    const [livres] = await db.execute('SELECT titre, auteur FROM livres WHERE id = ?', [emprunt.livre_id]);
    const livre = livres[0] || {};
    // Ajouter à l'historique des emprunts (copie complète + infos livre)
    await db.execute(
      'INSERT INTO historique_emprunts (emprunt_id, utilisateur_id, livre_id, action, details) VALUES (?, ?, ?, ?, ?)',
      [
        emprunt.id,
        emprunt.utilisateur_id,
        emprunt.livre_id,
        'retour',
        JSON.stringify({ ...emprunt, ...livre, date_retour_reelle, duree_emprunt_jours, retour_en_retard: retourEnRetard })
      ]
    );
    res.json({
      message: 'Livre retourné avec succès',
      emprunt: {
        id: emprunt_id,
        date_retour_reelle,
        statut,
        duree_emprunt_jours
      }
    });
  } catch (error) {
    console.error('Erreur lors du retour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Prolonger un emprunt
router.put('/:id/prolonger', verifyToken, async (req, res) => {
  try {
    const emprunt_id = req.params.id;
    const utilisateur_id = req.user.userId;
    // Récupérer l'emprunt
    const [emprunts] = await db.execute(
      'SELECT * FROM emprunts WHERE id = ? AND (statut = "en_cours" OR statut = "prolonge")',
      [emprunt_id]
    );
    if (emprunts.length === 0) {
      console.error('Aucun emprunt trouvé pour prolongation', { emprunt_id });
      return res.status(404).json({ message: 'Emprunt non trouvé ou déjà retourné' });
    }
    const emprunt = emprunts[0];
    // Vérifier les permissions (utilisateur propriétaire ou admin)
    if (req.user.role !== 'admin' && emprunt.utilisateur_id !== utilisateur_id) {
      console.error('Prolongation refusée : mauvais utilisateur', { user: req.user, emprunt });
      return res.status(403).json({ message: 'Accès refusé' });
    }
    // Vérifier la limite de prolongations
    if (emprunt.nombre_prolongations >= emprunt.max_prolongations) {
      console.error('Limite de prolongations atteinte', { emprunt });
      return res.status(400).json({ message: 'Limite de prolongations atteinte' });
    }
    // Calculer la nouvelle date de retour prévue (+duree_emprunt_jours)
    const ancienneDate = new Date(emprunt.date_retour_prevue);
    const nouvelleDate = new Date(ancienneDate.getTime() + emprunt.duree_emprunt_jours * 24 * 60 * 60 * 1000);
    const nouvelleDateStr = nouvelleDate.toISOString().split('T')[0];
    // Mettre à jour l'emprunt (date, compteur, statut)
    await db.execute(
      'UPDATE emprunts SET date_retour_prevue = ?, nombre_prolongations = nombre_prolongations + 1, statut = ? WHERE id = ?',
      [nouvelleDateStr, 'prolonge', emprunt_id]
    );
    res.json({
      message: 'Prolongation effectuée',
      nouvelle_date_retour_prevue: nouvelleDateStr,
      nombre_prolongations: emprunt.nombre_prolongations + 1
    });
  } catch (error) {
    console.error('Erreur lors de la prolongation:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error?.message });
  }
});

// Récupérer les emprunts d'un utilisateur
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.userId != userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    // Mettre à jour les statuts en retard
    await db.execute(
      "UPDATE emprunts SET statut = 'en_retard' WHERE statut = 'en_cours' AND CURDATE() > date_retour_prevue"
    );
    // Jointure pour récupérer les détails du livre
    const [emprunts] = await db.execute(
      `SELECT e.*, l.titre, l.auteur, l.genre, l.statut AS statut_livre, l.couverture_url
       FROM emprunts e
       JOIN livres l ON e.livre_id = l.id
       WHERE e.utilisateur_id = ?`,
      [userId]
    );
    res.json({ emprunts });
  } catch (error) {
    console.error('Erreur lors de la récupération des emprunts utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer tous les emprunts (admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    // Mettre à jour les statuts en retard
    await db.execute(
      "UPDATE emprunts SET statut = 'en_retard' WHERE statut = 'en_cours' AND CURDATE() > date_retour_prevue"
    );
    const [emprunts] = await db.execute('SELECT * FROM emprunts');
    res.json({ emprunts });
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les emprunts:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour envoyer les notifications de retard (admin)
router.post('/notifications/retard', verifyToken, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  // Appel du middleware
  await sendLateReturnNotifications(req, res, (err) => {
    if (err) return res.status(500).json({ message: "Erreur lors de l'envoi des notifications" });
    res.json({ message: 'Notifications de retard envoyées' });
  });
});

module.exports = router;