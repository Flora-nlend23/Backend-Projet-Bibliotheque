// =============================
// Point d'entrée principal du backend Express
// =============================

require('dotenv').config({ path: './config/.env' }); // Charge les variables d'environnement
const express = require('express');
const cors = require('cors'); // Pour autoriser les requêtes du frontend (CORS)
const app = express();
const PORT = 4000; // Port d'écoute de l'API

// Import des middlewares et routes
const welcome = require('./middlewares/welcome'); // Message d'accueil API
const authRoutes = require('./routes/auth'); // Authentification (login, register)
const usersRoutes = require('./routes/users'); // Gestion des utilisateurs
const livresRoutes = require('./routes/livres'); // Gestion des livres
const empruntsRoutes = require('./routes/emprunts'); // Gestion des emprunts
const reservationsRoutes = require('./routes/reservations'); // Gestion des réservations
const avisRoutes = require('./routes/avis'); // Gestion des avis sur les livres
const favorisRoutes = require('./routes/favoris'); // Gestion des favoris
const notificationsRoutes = require('./routes/notifications'); // Notifications utilisateurs
const historiqueEmpruntsRoutes = require('./routes/historique_emprunts'); // Historique des emprunts
const sendLateReturnNotifications = require('./middlewares/sendLateReturnNotifications'); // Notifications de retard
const cron = require('node-cron'); // Pour les tâches planifiées

// =============================
// Middlewares globaux
// =============================
app.use(cors()); // Autorise le frontend à accéder à l'API
app.use(express.json()); // Parse le JSON dans les requêtes

// =============================
// Route d'accueil (test API)
// =============================
app.get('/', welcome, (req, res) => {
  res.json(req.welcomeMessage); // Affiche un message de bienvenue
});

// =============================
// Déclaration des routes principales
// =============================
app.use('/api/auth', authRoutes); // Authentification
app.use('/api/users', usersRoutes); // Utilisateurs
app.use('/api/livres', livresRoutes); // Livres
app.use('/api/emprunts', empruntsRoutes); // Emprunts
app.use('/api/reservations', reservationsRoutes); // Réservations
app.use('/api/avis', avisRoutes); // Avis
app.use('/api/favoris', favorisRoutes); // Favoris
app.use('/api/notifications', notificationsRoutes); // Notifications
app.use('/api/historique-emprunts', historiqueEmpruntsRoutes); // Historique d'emprunts

// =============================
// Tâche CRON quotidienne (notifications de retard)
// =============================
cron.schedule('0 11 * * *', () => {
  sendLateReturnNotifications({}, {}, () => {});
  console.log('Tâche CRON : notifications de retard envoyées à 11h00');
});

// =============================
// Lancement du serveur
// =============================
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});