// ========================
// middlewares/userLoginCheck.js
// ========================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Vérifie l'email et le mot de passe lors de la connexion utilisateur
const userLoginCheck = async (req, res, next) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Recherche l'utilisateur par email
    const [users] = await db.execute(
      'SELECT * FROM utilisateurs WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];

    // Vérifie le mot de passe avec bcrypt
    const isValidPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Met à jour la date de dernière connexion
    await db.execute(
      'UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = ?',
      [user.id]
    );

    // Générer le token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    req.loginResult = {
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    };

    next();
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = userLoginCheck;