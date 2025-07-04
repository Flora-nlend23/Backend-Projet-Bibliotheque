



// Middleware : envoie un email de confirmation d'emprunt à l'utilisateur
const nodemailer = require('nodemailer');
const db = require('../config/database');

// Configuration du transporteur mail (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendBorrowConfirmationMail(utilisateur_id, livre_id, date_retour_prevue) {
  // Récupère les infos utilisateur et livre
  const [[user]] = await db.execute('SELECT email, nom, prenom FROM utilisateurs WHERE id = ?', [utilisateur_id]);
  const [[livre]] = await db.execute('SELECT titre FROM livres WHERE id = ?', [livre_id]);
  if (!user || !livre) return;
  // Prépare le mail de confirmation
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: user.email,
    subject: 'Confirmation de votre emprunt de livre',
    text: `Bonjour ${user.prenom} ${user.nom},\n\nVous venez d\'emprunter le livre : "${livre.titre}".\nMerci de le retourner au plus tard le ${date_retour_prevue}.\n\nBonne lecture !`,
  };
  try {
    // Envoie le mail
    await transporter.sendMail(mailOptions);
    console.log(`Mail de confirmation d'emprunt envoyé à ${user.email}`);
  } catch (err) {
    // Affiche une erreur si l'envoi échoue
    console.error(`Erreur d'envoi du mail de confirmation à ${user.email}:`, err);
  }
}

module.exports = sendBorrowConfirmationMail;
