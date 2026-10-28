-- ============================================================
-- Kalubimba Family - schema PostgreSQL
-- Reprend à l'identique les 15 tables de la base MySQL
-- (mêmes noms de tables, colonnes, clés et IDs).
-- ============================================================

BEGIN;

DROP TABLE IF EXISTS call_participants CASCADE;
DROP TABLE IF EXISTS calls CASCADE;
DROP TABLE IF EXISTS reunions CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS family_books CASCADE;
DROP TABLE IF EXISTS ancestors CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS couples CASCADE;
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS personal_access_tokens CASCADE;
DROP TABLE IF EXISTS migrations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    nom             VARCHAR(255) NOT NULL,
    prenom          VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE,
    matricule       VARCHAR(255) UNIQUE,
    mot_de_passe    VARCHAR(255) NOT NULL,
    photo           VARCHAR(255),
    telephone       VARCHAR(255),
    pays            VARCHAR(255),
    ville           VARCHAR(255),
    date_naissance  DATE,
    date_creation   TIMESTAMP,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    deleted_at      TIMESTAMP
);
CREATE INDEX users_email_index ON users (email);
CREATE INDEX users_matricule_index ON users (matricule);

CREATE TABLE members (
    id              BIGSERIAL PRIMARY KEY,
    nom             VARCHAR(255) NOT NULL,
    prenom          VARCHAR(255) NOT NULL,
    nom_complet     VARCHAR(255),
    genre           VARCHAR(20),
    is_bloodline    BOOLEAN NOT NULL DEFAULT TRUE,
    date_naissance  DATE,
    date_deces      DATE,
    lieu            VARCHAR(255),
    profession      VARCHAR(255),
    adresse         TEXT,
    plain_password  VARCHAR(255),
    nom_pere        VARCHAR(255),
    nom_mere        VARCHAR(255),
    photo           VARCHAR(255),
    biographie      TEXT,
    pere_id         BIGINT REFERENCES members (id) ON DELETE SET NULL,
    mere_id         BIGINT REFERENCES members (id) ON DELETE SET NULL,
    conjoint_id     BIGINT,
    utilisateur_id  BIGINT REFERENCES users (id) ON DELETE SET NULL,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);
CREATE INDEX members_pere_id_foreign ON members (pere_id);
CREATE INDEX members_mere_id_foreign ON members (mere_id);
CREATE INDEX members_utilisateur_id_foreign ON members (utilisateur_id);
CREATE INDEX idx_user_id ON members (utilisateur_id);
CREATE INDEX idx_date_naissance ON members (date_naissance);
CREATE INDEX idx_date_deces ON members (date_deces);

CREATE TABLE children (
    id              BIGSERIAL PRIMARY KEY,
    nom             VARCHAR(255) NOT NULL,
    prenom          VARCHAR(255),
    nom_complet     VARCHAR(500),
    genre           VARCHAR(20),
    date_naissance  DATE,
    date_deces      DATE,
    lieu_naissance  VARCHAR(255),
    profession      VARCHAR(255),
    photo           VARCHAR(500),
    biographie      TEXT,
    pere_id         BIGINT REFERENCES members (id) ON DELETE SET NULL,
    mere_id         BIGINT REFERENCES members (id) ON DELETE SET NULL,
    member_id       BIGINT REFERENCES members (id) ON DELETE SET NULL,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);
CREATE INDEX idx_children_pere ON children (pere_id);
CREATE INDEX idx_children_mere ON children (mere_id);
CREATE INDEX idx_children_member ON children (member_id);

CREATE TABLE couples (
    id              BIGSERIAL PRIMARY KEY,
    member1_id      BIGINT NOT NULL REFERENCES members (id) ON DELETE CASCADE,
    member2_id      BIGINT NOT NULL REFERENCES members (id) ON DELETE CASCADE,
    marriage_date   DATE,
    end_date        DATE,
    status          VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    CONSTRAINT couples_member1_id_member2_id_unique UNIQUE (member1_id, member2_id)
);
CREATE INDEX idx_member1_id ON couples (member1_id);
CREATE INDEX idx_member2_id ON couples (member2_id);
CREATE INDEX idx_status ON couples (status);
CREATE INDEX idx_couples_member_status ON couples (member1_id, status);

CREATE TABLE relationships (
    id                 BIGSERIAL PRIMARY KEY,
    parent_id          BIGINT NOT NULL REFERENCES members (id) ON DELETE CASCADE,
    child_id           BIGINT NOT NULL REFERENCES members (id) ON DELETE CASCADE,
    relationship_type  VARCHAR(50) NOT NULL DEFAULT 'parent-child',
    created_at         TIMESTAMP,
    updated_at         TIMESTAMP,
    CONSTRAINT relationships_parent_id_child_id_unique UNIQUE (parent_id, child_id)
);
CREATE INDEX idx_parent_id ON relationships (parent_id);
CREATE INDEX idx_child_id ON relationships (child_id);

CREATE TABLE ancestors (
    id           BIGSERIAL PRIMARY KEY,
    nom_complet  VARCHAR(255) NOT NULL,
    genre        VARCHAR(20) NOT NULL DEFAULT 'other',
    role         VARCHAR(255),
    photo        VARCHAR(255),
    description  TEXT,
    ordre        INTEGER NOT NULL DEFAULT 0,
    created_by   INTEGER REFERENCES users (id) ON DELETE SET NULL,
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP
);
CREATE INDEX ancestors_ordre_nom_complet_index ON ancestors (ordre, nom_complet);

CREATE TABLE family_books (
    id                BIGSERIAL PRIMARY KEY,
    titre             VARCHAR(255),
    description       TEXT,
    contenu           TEXT,
    file_path         VARCHAR(255),
    date_publication  TIMESTAMP,
    date_histoire     TIMESTAMP,
    utilisateur_id    BIGINT REFERENCES users (id) ON DELETE SET NULL,
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP
);
CREATE INDEX family_books_date_publication_index ON family_books (date_publication);
CREATE INDEX family_books_utilisateur_id_foreign ON family_books (utilisateur_id);

CREATE TABLE messages (
    id                BIGSERIAL PRIMARY KEY,
    expediteur_id     BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    destinataire_id   BIGINT REFERENCES users (id) ON DELETE SET NULL,
    reply_to_id       BIGINT REFERENCES messages (id) ON DELETE SET NULL,
    sujet             VARCHAR(255),
    contenu           TEXT NOT NULL,
    attachment_path   VARCHAR(255),
    attachment_mime   VARCHAR(100),
    attachment_name   VARCHAR(255),
    attachment_size   BIGINT,
    type_message      VARCHAR(50) NOT NULL DEFAULT 'simple',
    lu                BOOLEAN NOT NULL DEFAULT FALSE,
    date_envoi        TIMESTAMP NOT NULL,
    edited_at         TIMESTAMP,
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP
);
CREATE INDEX messages_expediteur_id_foreign ON messages (expediteur_id);
CREATE INDEX messages_destinataire_id_foreign ON messages (destinataire_id);
CREATE INDEX messages_reply_to_id_foreign ON messages (reply_to_id);

CREATE TABLE photos (
    id                BIGSERIAL PRIMARY KEY,
    description       VARCHAR(255),
    image             VARCHAR(255) NOT NULL,
    membre_id         BIGINT REFERENCES members (id) ON DELETE SET NULL,
    utilisateur_id    BIGINT REFERENCES users (id) ON DELETE CASCADE,
    date_publication  TIMESTAMP NOT NULL,
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP
);
CREATE INDEX photos_membre_id_foreign ON photos (membre_id);
CREATE INDEX photos_utilisateur_id_foreign ON photos (utilisateur_id);

CREATE TABLE videos (
    id                BIGSERIAL PRIMARY KEY,
    description       VARCHAR(255),
    video             VARCHAR(255) NOT NULL,
    membre_id         BIGINT REFERENCES members (id) ON DELETE SET NULL,
    utilisateur_id    BIGINT REFERENCES users (id) ON DELETE CASCADE,
    date_publication  TIMESTAMP NOT NULL,
    duree             VARCHAR(255),
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP
);
CREATE INDEX videos_membre_id_foreign ON videos (membre_id);
CREATE INDEX videos_utilisateur_id_foreign ON videos (utilisateur_id);

CREATE TABLE reunions (
    id                      BIGSERIAL PRIMARY KEY,
    titre                   VARCHAR(255) NOT NULL,
    date_reunion            DATE NOT NULL,
    heure                   TIME,
    lieu                    VARCHAR(255),
    resume                  TEXT,
    fichier_pdf             TEXT,
    nombre_telechargements  INTEGER NOT NULL DEFAULT 0,
    created_by              BIGINT REFERENCES users (id) ON DELETE SET NULL,
    created_at              TIMESTAMP,
    updated_at              TIMESTAMP
);

CREATE TABLE calls (
    id            BIGSERIAL PRIMARY KEY,
    initiated_by  BIGINT NOT NULL,
    type          VARCHAR(10) NOT NULL CHECK (type IN ('video', 'audio')),
    status        VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    started_at    TIMESTAMP,
    ended_at      TIMESTAMP,
    created_at    TIMESTAMP,
    updated_at    TIMESTAMP
);
CREATE INDEX calls_initiated_by_index ON calls (initiated_by);
CREATE INDEX calls_status_index ON calls (status);

CREATE TABLE call_participants (
    id          BIGSERIAL PRIMARY KEY,
    call_id     BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    joined_at   TIMESTAMP,
    left_at     TIMESTAMP,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    CONSTRAINT call_participants_call_id_user_id_unique UNIQUE (call_id, user_id)
);
CREATE INDEX call_participants_call_id_index ON call_participants (call_id);
CREATE INDEX call_participants_user_id_index ON call_participants (user_id);

CREATE TABLE migrations (
    id         SERIAL PRIMARY KEY,
    migration  VARCHAR(255) NOT NULL,
    batch      INTEGER NOT NULL
);

CREATE TABLE personal_access_tokens (
    id              BIGSERIAL PRIMARY KEY,
    tokenable_type  VARCHAR(255) NOT NULL,
    tokenable_id    BIGINT NOT NULL,
    name            VARCHAR(255) NOT NULL,
    token           VARCHAR(64) NOT NULL UNIQUE,
    abilities       TEXT,
    last_used_at    TIMESTAMP,
    expires_at      TIMESTAMP,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);
CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index
    ON personal_access_tokens (tokenable_type, tokenable_id);

COMMIT;
