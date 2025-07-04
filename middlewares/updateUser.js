// middlewares/updateUser.js
// ========================
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Met à jour les infos d'un utilisateur (admin ou lui-même)
const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { nom, email, mot_de_passe, role } = req.body;

    // Prépare dynamiquement la requête SQL selon les champs reçus
    let updateFields = [];
    let updateValues = [];

    if (nom) {
      updateFields.push('nom = ?');
      updateValues.push(nom);
    }

    if (email) {
      // Vérifie que l'email n'est pas déjà pris
      const [existingUsers] = await db.execute(
        'SELECT * FROM utilisateurs WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (mot_de_passe) {
      if (mot_de_passe.length < 6) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
      updateFields.push('mot_de_passe = ?');
      updateValues.push(hashedPassword);
    }

    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    // Ajout de la gestion de la photo de profil
    if (req.body.photo_profil !== undefined) {
      updateFields.push('photo_profil = ?');
      updateValues.push(req.body.photo_profil || null);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Aucune donnée à mettre à jour' });
    }

    updateValues.push(userId);

    const [result] = await db.execute(
      `UPDATE utilisateurs SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    req.updateResult = { message: 'Utilisateur mis à jour avec succès' };
    next();
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = updateUser;