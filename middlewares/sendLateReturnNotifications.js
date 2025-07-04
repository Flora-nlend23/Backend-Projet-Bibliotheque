

// Middleware : envoie un email à chaque utilisateur ayant un emprunt en retard
const db = require('../config/database');
const nodemailer = require('nodemailer');

// Configuration du transporteur mail (exemple Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendLateReturnNotifications(req, res, next) {
  try {
    // Récupère tous les emprunts en retard avec infos utilisateur/livre
    const [rows] = await db.execute(`
      SELECT e.id AS emprunt_id, u.email, u.nom, u.prenom, l.titre, e.date_retour_prevue
      FROM emprunts e
      JOIN utilisateurs u ON e.utilisateur_id = u.id
      JOIN livres l ON e.livre_id = l.id
      WHERE e.statut = 'en_retard'
    `);
    for (const emprunt of rows) {
      // Prépare et envoie un email à chaque utilisateur en retard
      const mailOptions = {
        from: process.env.MAIL_USER,
        to: emprunt.email,
        subject: 'Retard de retour de livre',
        text: `Bonjour ${emprunt.prenom} ${emprunt.nom},\n\nVous avez un retard pour le livre : "${emprunt.titre}".\nDate de retour prévue : ${emprunt.date_retour_prevue}. Merci de le rendre au plus vite.`,
      };
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Notification email envoyée à ${emprunt.email}`);
      } catch (err) {
        // Affiche une erreur si l'envoi échoue
        console.error(`Erreur d'envoi email à ${emprunt.email}:`, err);
      }
    }
    // Passe au middleware suivant
    next && next();
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications de retard:', error);
    next && next(error);
  }
}

module.exports = sendLateReturnNotifications;
