// =============================
// Configuration de la connexion à la base de données MySQL
// =============================

const mysql = require('mysql2/promise'); // On utilise le module mysql2 en mode promesse
require('dotenv').config(); // Charge les variables d'environnement depuis .env

// Paramètres de connexion à la base (récupérés depuis .env)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost', // Adresse du serveur MySQL
  user: process.env.DB_USER || 'root', // Utilisateur MySQL
  password: process.env.DB_PASSWORD || '', // Mot de passe MySQL
  database: process.env.DB_NAME || 'bibliotheque', // Nom de la base
  port: process.env.PORT ? parseInt(process.env.PORT) : 3306, // Port MySQL (par défaut 3306)
  waitForConnections: true, // File d'attente si trop de connexions
  connectionLimit: 10, // Nombre max de connexions simultanées
  queueLimit: 0 // Pas de limite de file d'attente
};

// Création du pool de connexions (meilleure gestion des accès concurrents)
const pool = mysql.createPool(dbConfig);

// On exporte le pool pour l'utiliser dans les autres fichiers
module.exports = pool;