// middlewares/findAllUsers.js
// ========================
const db = require('../config/database');

// Récupère tous les utilisateurs (avec pagination et filtre par rôle)
const findAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const role = req.query.role;

    let query = 'SELECT id, nom, prenom, email, role, created_at, photo_profil FROM utilisateurs';
    let countQuery = 'SELECT COUNT(*) as total FROM utilisateurs';
    let queryParams = [];

    if (role) {
      query += ' WHERE role = ?';
      countQuery += ' WHERE role = ?';
      queryParams.push(role);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [users] = await db.execute(query, queryParams);
    const [countResult] = await db.execute(countQuery, role ? [role] : []);

    req.usersResult = {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(countResult[0].total / limit),
        totalUsers: countResult[0].total,
        limit
      }
    };

    next();
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = findAllUsers;
