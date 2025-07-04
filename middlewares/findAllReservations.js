// middlewares/findAllReservations.js
// ========================
const db = require('../config/database');

// Récupère toutes les réservations (avec pagination et filtre statut)
const findAllReservations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const statut = req.query.statut;

    let query = 'SELECT * FROM reservations';
    let countQuery = 'SELECT COUNT(*) as total FROM reservations';
    let queryParams = [];

    if (statut) {
      query += ' WHERE statut = ?';
      countQuery += ' WHERE statut = ?';
      queryParams.push(statut);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [reservations] = await db.execute(query, queryParams);
    const [countResult] = await db.execute(countQuery, statut ? [statut] : []);

    req.reservationsResult = {
      reservations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(countResult[0].total / limit),
        totalReservations: countResult[0].total,
        limit
      }
    };
    next();
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = findAllReservations;
