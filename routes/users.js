// =============================
// Routes liées à la gestion des utilisateurs
// =============================
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken'); // Vérifie le JWT
const UserOne = require('../middlewares/UserOne'); // Récupère un utilisateur par ID
const updateUser = require('../middlewares/updateUser'); // Met à jour un utilisateur
const deleteUser = require('../middlewares/deleteUser'); // Supprime un utilisateur
const findAllUsers = require('../middlewares/findAllUsers'); // Liste tous les utilisateurs
const addNewUser = require('../middlewares/addNewUser'); // Ajoute un nouvel utilisateur


// Récupérer tous les utilisateurs (admin seulement)
router.get('/', verifyToken, (req, res, next) => {
  // Seul un admin peut voir tous les utilisateurs
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé. Administrateur requis.' });
  }
  next();
}, findAllUsers, (req, res) => {
  res.json(req.usersResult); // La liste est stockée dans req.usersResult par le middleware
});


// Récupérer un utilisateur spécifique (par ID)

router.get('/:id', verifyToken, UserOne, (req, res) => {
  // Un utilisateur peut voir ses propres infos, l'admin peut voir tout le monde
  if (req.user.role !== 'admin' && req.user.userId !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }
  res.json(req.foundUser); // L'utilisateur trouvé est dans req.foundUser
});


// Récupérer le profil de l'utilisateur connecté
router.get('/profile/me', verifyToken, UserOne, (req, res) => {
  res.json(req.foundUser); // Renvoie le profil de l'utilisateur connecté
});

// Mettre à jour un utilisateur
router.put('/:id', verifyToken, (req, res, next) => {
  // Un utilisateur peut modifier ses propres infos, l'admin peut tout modifier
  if (req.user.role !== 'admin' && req.user.userId !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }
  // Empêche un étudiant de changer son rôle
  if (req.user.role !== 'admin' && req.body.role) {
    delete req.body.role;
  }
  next();
}, updateUser, (req, res) => {
  res.json(req.updateResult); // Résultat de la mise à jour
});


// Supprimer un utilisateur (admin seulement)
router.delete('/:id', verifyToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé. Administrateur requis.' });
  }
  next();
}, deleteUser, (req, res) => {
  res.json(req.deleteResult); // Résultat de la suppression
});

// Ajouter un utilisateur (admin seulement)
router.post('/', verifyToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé. Administrateur requis.' });
  }
  next();
}, addNewUser, (req, res) => {
  res.status(201).json(req.newUser);
});

module.exports = router;