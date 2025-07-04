// routes/livres.js
// ========================
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const db = require('../config/database');

// Récupérer tous les livres (avec filtres)
router.get('/', async (req, res) => {
  try {
    const { titre, auteur, genre, statut, page = 1, limit = 10 } = req.query;
    
    let query = 'SELECT * FROM livres WHERE 1=1';
    let queryParams = [];
    
    if (titre) {
      query += ' AND titre LIKE ?';
      queryParams.push(`%${titre}%`);
    }
    
    if (auteur) {
      query += ' AND auteur LIKE ?';
      queryParams.push(`%${auteur}%`);
    }
    
    if (genre) {
      query += ' AND genre LIKE ?';
      queryParams.push(`%${genre}%`);
    }
    
    if (statut !== undefined) {
      query += ' AND statut = ?';
      queryParams.push(statut);
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [livres] = await db.execute(query, queryParams);

    // Pour chaque livre, calculer la note moyenne (ou 5 si aucun avis) et le statut de réservation
    for (const livre of livres) {
      // Note moyenne
      const [rows] = await db.execute(
        'SELECT AVG(note) as moyenne FROM avis_livres WHERE livre_id = ?',
        [livre.id]
      );
      let moyenne = rows[0].moyenne;
      if (moyenne !== null && moyenne !== undefined) {
        moyenne = parseFloat(moyenne);
        livre.note_moyenne = Number.isNaN(moyenne) ? 5.0 : parseFloat(moyenne.toFixed(2));
      } else {
        livre.note_moyenne = 5.0;
      }

      // Statut réservé : true seulement si plus aucun exemplaire n'est disponible
      livre.reserve = (livre.quantite_disponible === 0);
    }
    
    // Compter le total
    let countQuery = 'SELECT COUNT(*) as total FROM livres WHERE 1=1';
    let countParams = [];
    
    if (titre) {
      countQuery += ' AND titre LIKE ?';
      countParams.push(`%${titre}%`);
    }
    if (auteur) {
      countQuery += ' AND auteur LIKE ?';
      countParams.push(`%${auteur}%`);
    }
    if (genre) {
      countQuery += ' AND genre LIKE ?';
      countParams.push(`%${genre}%`);
    }
    if (statut !== undefined) {
      countQuery += ' AND statut = ?';
      countParams.push(statut);
    }
    
    const [countResult] = await db.execute(countQuery, countParams);
    
    res.json({
      livres,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit),
        totalLivres: countResult[0].total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer un livre spécifique
router.get('/:id', async (req, res) => {
  try {
    const [livres] = await db.execute(
      'SELECT * FROM livres WHERE id = ?',
      [req.params.id]
    );
    
    if (livres.length === 0) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    
    res.json(livres[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un livre (admin seulement)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Administrateur requis.' });
    }
    
    // Récupérer tous les champs du body
    const { titre, auteur, genre, isbn, quantite_totale, quantite_disponible, etat_livre, description, mots_cles, langue, couverture_url, date_acquisition, statut } = req.body;
    if (!titre || !auteur) {
      return res.status(400).json({ message: 'Titre et auteur requis' });
    }
    // Vérifier si l'ISBN existe déjà
    if (isbn) {
      const [existingBooks] = await db.execute(
        'SELECT * FROM livres WHERE isbn = ?',
        [isbn]
      );
      if (existingBooks.length > 0) {
        return res.status(400).json({ message: 'Un livre avec cet ISBN existe déjà' });
      }
    }
    // Insertion complète avec tous les champs
    const [result] = await db.execute(
      `INSERT INTO livres (titre, auteur, genre, isbn, quantite_totale, quantite_disponible, etat_livre, description, mots_cles, langue, couverture_url, date_acquisition, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titre,
        auteur,
        genre || null,
        isbn || null,
        quantite_totale || 0,
        quantite_disponible || 0,
        etat_livre || null,
        description || null,
        mots_cles || null,
        langue || null,
        couverture_url || null,
        date_acquisition || null,
        statut || 'disponible'
      ]
    );
    res.status(201).json({
      message: 'Livre ajouté avec succès',
      livre: {
        id: result.insertId,
        titre,
        auteur,
        genre,
        isbn,
        quantite_totale,
        quantite_disponible,
        etat_livre,
        description,
        mots_cles,
        langue,
        couverture_url,
        date_acquisition,
        statut
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un livre (admin seulement)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Administrateur requis.' });
    }
    
    const { titre, auteur, genre, isbn, statut, quantite_totale, quantite_disponible, etat_livre, description, mots_cles, langue, couverture_url, date_acquisition } = req.body;
    const livreId = req.params.id;
    
    // Construire la requête dynamiquement
    let updateFields = [];
    let updateValues = [];
    
    if (titre) {
      updateFields.push('titre = ?');
      updateValues.push(titre);
    }
    
    if (auteur) {
      updateFields.push('auteur = ?');
      updateValues.push(auteur);
    }
    
    if (genre !== undefined) {
      updateFields.push('genre = ?');
      updateValues.push(genre);
    }
    
    if (isbn !== undefined) {
      // Vérifier si l'ISBN n'est pas déjà utilisé par un autre livre
      if (isbn) {
        const [existingBooks] = await db.execute(
          'SELECT * FROM livres WHERE isbn = ? AND id != ?',
          [isbn, livreId]
        );
        
        if (existingBooks.length > 0) {
          return res.status(400).json({ message: 'Un livre avec cet ISBN existe déjà' });
        }
      }
      
      updateFields.push('isbn = ?');
      updateValues.push(isbn);
    }
    
    if (statut !== undefined) {
      updateFields.push('statut = ?');
      updateValues.push(statut);
    }
    
    if (quantite_totale !== undefined) {
      updateFields.push('quantite_totale = ?');
      updateValues.push(quantite_totale);
    }
    if (quantite_disponible !== undefined) {
      updateFields.push('quantite_disponible = ?');
      updateValues.push(quantite_disponible);
    }
    if (etat_livre !== undefined) {
      updateFields.push('etat_livre = ?');
      updateValues.push(etat_livre);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (mots_cles !== undefined) {
      updateFields.push('mots_cles = ?');
      updateValues.push(mots_cles);
    }
    if (langue !== undefined) {
      updateFields.push('langue = ?');
      updateValues.push(langue);
    }
    if (couverture_url !== undefined) {
      updateFields.push('couverture_url = ?');
      updateValues.push(couverture_url);
    }
    if (date_acquisition !== undefined) {
      updateFields.push('date_acquisition = ?');
      updateValues.push(date_acquisition);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Aucune donnée à mettre à jour' });
    }
    
    updateValues.push(livreId);
    
    const [result] = await db.execute(
      `UPDATE livres SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    
    res.json({ message: 'Livre mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un livre (admin seulement)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Administrateur requis.' });
    }
    
    const livreId = req.params.id;
    
    // Vérifier si le livre a des emprunts en cours
    const [emprunts] = await db.execute(
      'SELECT * FROM emprunts WHERE livre_id = ? AND statut = "en_cours"',
      [livreId]
    );
    
    if (emprunts.length > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer ce livre. Il a des emprunts en cours.' 
      });
    }
    
    const [result] = await db.execute(
      'DELETE FROM livres WHERE id = ?',
      [livreId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    
    res.json({ message: 'Livre supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;