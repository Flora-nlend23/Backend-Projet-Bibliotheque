%%{init: {'theme':'base', 'themeVariables': { 'primaryColor': '#F5F5DC', 'primaryTextColor': '#8B4513', 'primaryBorderColor': '#A0522D', 'lineColor': '#696969', 'secondaryColor': '#D3D3D3', 'tertiaryColor': '#DDBEA9'}}}%%

erDiagram
    UTILISATEURS {
        int id PK "AUTO_INCREMENT"
        varchar nom "NOT NULL"
        varchar prenom "NOT NULL"
        varchar email "NOT NULL UNIQUE"
        varchar mot_de_passe "NOT NULL"
        enum role "admin, etudiant - DEFAULT etudiant"
        varchar numero_etudiant "UNIQUE NULL"
        date date_naissance "NULL"
        varchar niveau_etude "NULL"
        varchar filiere "NULL"
        varchar telephone "NULL"
        varchar adresse "NULL"
        varchar statut "NULL"
        datetime date_inscription "NULL"
        datetime derniere_connexion "NULL"
        int nombre_emprunts_total "NULL"
        int nombre_retards "NULL"
        varchar photo_profil "NULL"
        datetime created_at "DEFAULT CURRENT_TIMESTAMP"
        datetime updated_at "DEFAULT CURRENT_TIMESTAMP ON UPDATE"
    }

    LIVRES {
        int id PK "AUTO_INCREMENT"
        varchar titre "NOT NULL"
        varchar auteur "NOT NULL"
        varchar genre ""
        varchar isbn "UNIQUE"
        int quantite_totale ""
        int quantite_disponible ""
        varchar etat_livre ""
        text description ""
        varchar mots_cles ""
        varchar langue ""
        varchar couverture_url ""
        date date_acquisition ""
        enum statut "disponible, emprunte, reserve - DEFAULT disponible"
        datetime created_at "DEFAULT CURRENT_TIMESTAMP"
        datetime updated_at "DEFAULT CURRENT_TIMESTAMP ON UPDATE"
    }

    EMPRUNTS {
        int id PK "AUTO_INCREMENT"
        int utilisateur_id FK "NOT NULL"
        int livre_id FK "NOT NULL"
        date date_emprunt "NOT NULL"
        date date_retour_prevue "NOT NULL"
        date date_retour_effective ""
        enum statut "en_cours, retourne, retard - DEFAULT en_cours"
        datetime created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    RESERVATIONS {
        int id PK "AUTO_INCREMENT"
        int utilisateur_id FK "NOT NULL"
        int livre_id FK "NOT NULL"
        date date_reservation "NOT NULL"
        enum statut "active, annulee, expiree - DEFAULT active"
        datetime created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    AVIS_LIVRES {
        int id PK "AUTO_INCREMENT"
        int utilisateur_id FK "NOT NULL"
        int livre_id FK "NOT NULL"
        int note "NOT NULL"
        text commentaire ""
        datetime created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    FAVORIS {
        int id PK "AUTO_INCREMENT"
        int utilisateur_id FK "NOT NULL"
        int livre_id FK "NOT NULL"
        datetime created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    NOTIFICATIONS {
        int id PK "AUTO_INCREMENT"
        int utilisateur_id FK "NOT NULL"
        text message "NOT NULL"
        varchar type ""
        boolean lu "DEFAULT FALSE"
        datetime date_envoi "DEFAULT CURRENT_TIMESTAMP"
        datetime date_lecture ""
    }

    HISTORIQUE_EMPRUNTS {
        int id PK "AUTO_INCREMENT"
        int utilisateur_id FK "NOT NULL"
        int livre_id FK "NOT NULL"
        varchar action "NOT NULL"
        datetime date_action "DEFAULT CURRENT_TIMESTAMP"
    }

    %% Relations avec cardinalités
    UTILISATEURS ||--o{ EMPRUNTS : "emprunte"
    LIVRES ||--o{ EMPRUNTS : "est_emprunte"
    
    UTILISATEURS ||--o{ RESERVATIONS : "reserve"
    LIVRES ||--o{ RESERVATIONS : "est_reserve"
    
    UTILISATEURS ||--o{ AVIS_LIVRES : "donne_avis"
    LIVRES ||--o{ AVIS_LIVRES : "recoit_avis"
    
    UTILISATEURS ||--o{ FAVORIS : "marque_favori"
    LIVRES ||--o{ FAVORIS : "est_favori"
    
    UTILISATEURS ||--o{ NOTIFICATIONS : "recoit"
    
    UTILISATEURS ||--o{ HISTORIQUE_EMPRUNTS : "a_historique"
    LIVRES ||--o{ HISTORIQUE_EMPRUNTS : "dans_historique"