// routes/auth.js
// ========================
const express = require('express');
const router = express.Router();

const addNewUser = require('../middlewares/addNewUser');
const userLoginCheck = require('../middlewares/userLoginCheck');

const resetPasswordRequest = require('../middlewares/resetPasswordRequest');
const resetPassword = require('../middlewares/resetPassword');
// Réinitialisation du mot de passe
router.post('/reset-password', resetPassword, (req, res) => {
  res.json({ message: 'Mot de passe réinitialisé avec succès' });
});

// Route d'inscription
router.post('/register', addNewUser, (req, res) => {
  res.status(201).json({
    message: 'Inscription réussie',
    ...req.newUser
  });
});

// Route de connexion
router.post('/login', userLoginCheck, (req, res) => {
  res.status(200).json({
    message: 'Connexion réussie',
    ...req.loginResult
  });
});


// Demande de reset de mot de passe
router.post('/reset-password-request', resetPasswordRequest, async (req, res) => {
  // Ici, on simule l'envoi d'email (à remplacer par un vrai envoi d'email)
  if (req.resetToken && req.resetEmail) {
    // Lien de reset (à adapter selon le frontend)
    const resetLink = `http://localhost:3000/reset-password?token=${req.resetToken}`;
    // TODO: Envoyer le mail avec le lien
    console.log(`Lien de reset pour ${req.resetEmail}: ${resetLink}`);
  }
  // Toujours répondre pareil pour la sécurité
  res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
});

module.exports = router;
