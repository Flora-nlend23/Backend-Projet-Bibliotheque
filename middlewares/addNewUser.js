// middlewares/addNewUser.js
// ========================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Ajoute un nouvel utilisateur (admin ou inscription)
const addNewUser = async (req, res, next) => {
  try {
    const { nom, prenom, email, mot_de_passe, role, numero_etudiant, date_naissance, niveau_etude, filiere, telephone, photo_profil } = req.body;

    // Vérifie les champs obligatoires
    if (!nom || !prenom || !email || !mot_de_passe || !role) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }
    if (role === 'etudiant') {
      if (!numero_etudiant || !date_naissance || !niveau_etude || !filiere || !telephone) {
        return res.status(400).json({ message: 'Tous les champs étudiants sont requis' });
      }
    }

    // Vérifie si l'utilisateur existe déjà (email ou numéro étudiant)
    let existingQuery = 'SELECT * FROM utilisateurs WHERE email = ?';
    let existingParams = [email];
    if (role === 'etudiant') {
      existingQuery += ' OR numero_etudiant = ?';
      existingParams.push(numero_etudiant);
    }
    const [existingUsers] = await db.execute(existingQuery, existingParams);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Cet email ou numéro étudiant est déjà utilisé' });
    }

    // Hash le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Prépare la requête d'insertion
    let insertQuery = 'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role';
    let insertValues = [nom, prenom, email, hashedPassword, role];
    let insertPlaceholders = '?, ?, ?, ?, ?';
    if (role === 'etudiant') {
      insertQuery += ', numero_etudiant, date_naissance, niveau_etude, filiere, telephone';
      insertPlaceholders += ', ?, ?, ?, ?, ?';
      insertValues.push(numero_etudiant, date_naissance, niveau_etude, filiere, telephone);
    }
    // Ajout du champ photo_profil
    insertQuery += ', photo_profil';
    insertPlaceholders += ', ?';
    insertValues.push(photo_profil || null);

    insertQuery += `) VALUES (${insertPlaceholders})`;
    const [result] = await db.execute(insertQuery, insertValues);

    // Générer le token
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        email: email, 
        role: role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    req.newUser = {
      token,
      user: {
        id: result.insertId,
        nom: nom,
        prenom: prenom,
        email: email,
        role: role,
        photo_profil: photo_profil || null
      }
    };

    next();
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = addNewUser;