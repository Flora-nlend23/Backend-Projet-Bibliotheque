-- Schéma SQL pour la base de données Bibliothèque Universitaire

CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('admin', 'etudiant') DEFAULT 'etudiant',
  numero_etudiant VARCHAR(50) UNIQUE NULL,
  date_naissance DATE NULL,
  niveau_etude VARCHAR(100) NULL,
  filiere VARCHAR(100) NULL,
  telephone VARCHAR(30) NULL,
  adresse VARCHAR(255) NULL,
  statut VARCHAR(50) NULL,
  date_inscription DATETIME NULL,
  derniere_connexion DATETIME NULL,
  nombre_emprunts_total INT NULL,
  nombre_retards INT NULL,
  photo_profil VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE livres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  auteur VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  isbn VARCHAR(50) UNIQUE,
  quantite_totale INT ,
  quantite_disponible INT ,
  etat_livre VARCHAR(100),
  description TEXT,
  mots_cles VARCHAR(255),
  langue VARCHAR(50),
  couverture_url VARCHAR(255),
  date_acquisition DATE,
  statut ENUM('disponible', 'emprunte', 'reserve') DEFAULT 'disponible',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE emprunts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  livre_id INT NOT NULL,
  date_emprunt DATE NOT NULL,
  date_retour_prevue DATE NOT NULL,
  date_retour_effective DATE,
  statut ENUM('en_cours', 'retourne', 'retard') DEFAULT 'en_cours',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
  FOREIGN KEY (livre_id) REFERENCES livres(id)
);

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  livre_id INT NOT NULL,
  date_reservation DATE NOT NULL,
  statut ENUM('active', 'annulee', 'expiree') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
  FOREIGN KEY (livre_id) REFERENCES livres(id)
);

CREATE TABLE avis_livres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  livre_id INT NOT NULL,
  note INT NOT NULL,
  commentaire TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
  FOREIGN KEY (livre_id) REFERENCES livres(id)
);

CREATE TABLE favoris (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  livre_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
  FOREIGN KEY (livre_id) REFERENCES livres(id)
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  lu BOOLEAN DEFAULT FALSE,
  date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_lecture DATETIME,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);

CREATE TABLE historique_emprunts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  livre_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  date_action DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
  FOREIGN KEY (livre_id) REFERENCES livres(id)
);