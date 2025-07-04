// middlewares/welcome.js
// ========================
// Middleware d'accueil : ajoute un message de bienvenue à la requête
const welcome = (req, res, next) => {
  req.welcomeMessage = {
    message: 'Bienvenue dans l\'API de gestion de bibliothèque'
  };
  next();
};

module.exports = welcome;