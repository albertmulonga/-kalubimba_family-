-- ============================================================
-- Données existantes (identiques aux IDs MySQL)
-- Les valeurs de genre "masculin/feminin" ont été normalisées
-- en "male/female", le format attendu par la logique de l'app.
-- ============================================================

BEGIN;

INSERT INTO users (id, nom, prenom, email, matricule, mot_de_passe, photo, telephone, pays, ville, date_naissance, date_creation, created_at, updated_at, deleted_at) VALUES
(1, 'Kalubimba', 'Admin', 'adminkalubimba@gmail.com', NULL, '$2b$12$JG6FYu1DE1wPDR18QsY2MO/Mx6oQoYkEoYaNDAbZkn5TJ4o3PBquq', NULL, '+243000000000', 'RDC', 'Kinshasa', NULL, '2026-07-20 09:26:28', NULL, '2026-07-20 09:26:28', NULL),
(2, 'Mulonga', 'Jean', 'jean@kalubimba.com', NULL, '$2y$12$J12sk677ZRSpRdsvAM8J/ucp9O8s4vGKpHEstm9q8x3sUtktow0RG', NULL, '+243111111111', 'RDC', 'Kinshasa', NULL, '2026-07-20 09:26:29', NULL, '2026-07-20 09:26:29', NULL),
(3, 'Mukendi', 'Marie', 'marie@kalubimba.com', NULL, '$2y$12$R51bfyIpQEoznAlzSGNeD.CrK52DrIdEUNVSW1T6Ybf0vjtd/YwAy', NULL, '+243222222222', 'RDC', 'Lubumbashi', NULL, '2026-07-20 09:26:29', NULL, '2026-07-20 09:26:29', NULL),
(4, 'Kabongo', 'Pierre', 'pierre@kalubimba.com', NULL, '$2y$12$Zcc45mj6ciSf8mGwpEnZdu3Hw/foUsFiW.WUrNgScVF/x89TsMsTS', NULL, '+243333333333', 'RDC', 'Goma', NULL, '2026-07-20 09:26:30', NULL, '2026-07-20 09:26:30', NULL),
(5, 'Ilunga', 'Sophie', 'sophie@kalubimba.com', NULL, '$2y$12$.aQmfkt5wmQQ/r0TaOuM3.pxwGs9TAeB5.LIlz/OWdF3wquBSAeNC', NULL, '+243444444444', 'RDC', 'Kinshasa', NULL, '2026-07-20 09:26:31', NULL, '2026-07-20 09:26:31', NULL);

INSERT INTO members (id, nom, prenom, nom_complet, genre, is_bloodline, date_naissance, date_deces, lieu, profession, adresse, plain_password, nom_pere, nom_mere, photo, biographie, pere_id, mere_id, conjoint_id, utilisateur_id, created_at, updated_at) VALUES
(1, 'Kalubimba', 'Joseph', 'Joseph Kalubimba', 'male', TRUE, '1940-05-15', NULL, 'Kinshasa', 'Fondateur', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 1, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(2, 'Mbuyi', 'Marie', 'Marie Mbuyi', 'female', TRUE, '1945-08-20', NULL, 'Kinshasa', 'Mère au foyer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 2, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(3, 'Kalubimba', 'Albert', 'Albert Kalubimba', 'male', TRUE, '1970-03-10', NULL, 'Kinshasa', 'Ingénieur', NULL, NULL, NULL, NULL, NULL, NULL, 1, 2, 4, 3, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(4, 'Mukendi', 'Jeanne', 'Jeanne Mukendi', 'female', TRUE, '1972-11-25', NULL, 'Lubumbashi', 'Enseignante', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 4, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(5, 'Kalubimba', 'Jean', 'Jean Kalubimba', 'male', TRUE, '1995-01-30', NULL, 'Kinshasa', 'Développeur', NULL, NULL, NULL, NULL, NULL, NULL, 3, 4, 7, 5, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(6, 'Kabongo', 'Pierre', 'Pierre Kabongo', 'male', TRUE, '1975-07-14', NULL, 'Goma', 'Médecin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 7, NULL, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(7, 'Ilunga', 'Sophie', 'Sophie Ilunga', 'female', TRUE, '1978-04-22', NULL, 'Kinshasa', 'Infirmière', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 5, NULL, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(8, 'Kalubimba', 'Claude', 'Claude Kalubimba', 'male', TRUE, '1998-09-05', NULL, 'Kinshasa', 'Étudiant', NULL, NULL, NULL, NULL, NULL, NULL, 3, 4, NULL, NULL, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(9, 'Mbuyi', 'Luc', 'Luc Mbuyi', 'male', TRUE, '2000-12-01', NULL, 'Lubumbashi', 'Étudiant', NULL, NULL, NULL, NULL, NULL, NULL, 1, 2, NULL, NULL, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(10, 'Kalubimba', 'Ancêtre', 'Ancêtre Kalubimba', 'male', TRUE, '1900-01-01', '1970-01-01', 'Kinshasa', 'Ancêtre', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-20 09:26:31', '2026-07-20 09:26:31');

INSERT INTO children (id, nom, prenom, nom_complet, genre, date_naissance, date_deces, lieu_naissance, profession, photo, biographie, pere_id, mere_id, member_id, created_at, updated_at) VALUES
(1, 'Kalubimba', 'Albert', 'Albert Kalubimba', 'male', '1970-03-10', NULL, 'Kinshasa', 'Ingénieur', NULL, NULL, 1, 2, 3, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(2, 'Kalubimba', 'Jean', 'Jean Kalubimba', 'male', '1995-01-30', NULL, 'Kinshasa', 'Développeur', NULL, NULL, 3, 4, 5, '2026-07-20 09:26:31', '2026-07-20 09:26:31');

INSERT INTO couples (id, member1_id, member2_id, marriage_date, end_date, status, created_at, updated_at) VALUES
(1, 1, 2, '1965-06-15', NULL, 'active', '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(2, 3, 4, '1990-03-20', NULL, 'active', '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(3, 5, 7, '2020-05-10', NULL, 'active', '2026-07-20 09:26:31', '2026-07-20 09:26:31');

INSERT INTO relationships (id, parent_id, child_id, relationship_type, created_at, updated_at) VALUES
(1, 1, 3, 'parent-child', '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(2, 2, 3, 'parent-child', '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(3, 3, 5, 'parent-child', '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(4, 4, 5, 'parent-child', '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(5, 3, 8, 'parent-child', '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(6, 4, 8, 'parent-child', '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(7, 1, 9, 'parent-child', '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(8, 2, 9, 'parent-child', '2026-07-20 09:26:31', '2026-07-20 09:26:31');

INSERT INTO ancestors (id, nom_complet, genre, role, photo, description, ordre, created_by, created_at, updated_at) VALUES
(1, 'Kalubimba Ancêtre', 'male', 'Fondateur de la famille', NULL, 'Premier ancêtre de la famille Kalubimba, originaire de Kinshasa.', 1, NULL, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(2, 'Mbuyi Aînée', 'female', 'Première génération', NULL, 'Mère fondatrice de la famille.', 2, NULL, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(3, 'Kalubimba Joseph', 'male', 'Deuxième génération', NULL, 'Père de la famille moderne.', 3, NULL, '2026-07-20 09:26:31', '2026-07-20 09:26:31');

INSERT INTO family_books (id, titre, description, contenu, file_path, date_publication, date_histoire, utilisateur_id, created_at, updated_at) VALUES
(1, 'Livre d''or de la famille Kalubimba', 'Recueil des souvenirs et messages de la famille.', NULL, NULL, '2026-07-20 11:26:31', NULL, 1, NULL, NULL);

INSERT INTO messages (id, expediteur_id, destinataire_id, reply_to_id, sujet, contenu, attachment_path, attachment_mime, attachment_name, attachment_size, type_message, lu, date_envoi, edited_at, created_at, updated_at) VALUES
(1, 1, 2, NULL, 'Bienvenue dans la famille', 'Bienvenue dans l''application Kalubimba Family !', NULL, NULL, NULL, NULL, 'simple', FALSE, '2026-07-20 11:26:31', NULL, NULL, NULL),
(2, 1, NULL, NULL, 'Message à toute la famille', 'Bonjour à tous les membres de la famille Kalubimba !', NULL, NULL, NULL, NULL, 'groupe', FALSE, '2026-07-20 11:26:31', NULL, NULL, NULL);

INSERT INTO photos (id, description, image, membre_id, utilisateur_id, date_publication, created_at, updated_at) VALUES
(1, 'Photo de famille', 'photos/famille.jpg', 1, 1, '2026-07-20 11:26:31', NULL, NULL),
(2, 'Réunion familiale', 'photos/reunion.jpg', 1, 1, '2026-07-20 11:26:31', NULL, NULL),
(3, 'Test upload', 'photos/7ieG6S3Og1H9otu6yhccb3m4ioC31QxOqx1i20VL.jpg', NULL, 1, '2026-07-20 12:19:35', NULL, NULL);

INSERT INTO videos (id, description, video, membre_id, utilisateur_id, date_publication, duree, created_at, updated_at) VALUES
(1, 'Vidéo de la réunion familiale', 'videos/reunion.mp4', 1, 1, '2026-07-20 11:26:31', '00:05:30', NULL, NULL);

INSERT INTO reunions (id, titre, date_reunion, heure, lieu, resume, fichier_pdf, nombre_telechargements, created_at, updated_at) VALUES
(1, 'Réunion familiale 2026', '2026-12-25', '14:00:00', 'Kinshasa, RDC', 'Réunion de fin d''année de la famille Kalubimba.', NULL, 0, '2026-07-20 09:26:31', '2026-07-20 09:26:31'),
(2, 'Anniversaire de Joseph', '2026-05-15', '18:00:00', 'Kinshasa, RDC', 'Célébration de l''anniversaire de Joseph Kalubimba.', NULL, 0, '2026-07-20 09:26:31', '2026-07-20 09:26:31');

INSERT INTO calls (id, initiated_by, type, status, started_at, ended_at, created_at, updated_at) VALUES
(1, 1, 'video', 'ended', '2026-07-20 07:26:31', '2026-07-20 08:26:31', '2026-07-20 09:26:31', '2026-07-20 09:26:31');

INSERT INTO migrations (id, migration, batch) VALUES
(1, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(2, '2024_01_01_000001_create_users_table', 1),
(3, '2026_03_16_204755_create_relationships_table', 1),
(4, '2026_03_16_204832_create_couples_table', 1),
(5, '2026_03_17_120000_create_children_table', 1),
(6, '2026_03_17_210000_create_ancestors_table', 1),
(7, '2026_03_17_210010_create_family_books_table', 1),
(8, '2026_03_18_000001_add_contenu_to_family_books', 1),
(9, '2026_03_18_000002_add_soft_deletes_to_users', 1),
(10, '2026_03_18_212518_add_matricule_to_users_table', 1),
(11, '2026_03_18_212558_make_email_nullable_in_users_table', 1),
(12, '2026_03_21_145015_create_calls_table', 1),
(13, '2026_03_21_153025_create_members_table', 1),
(14, '2026_03_21_153634_create_messages_table', 1),
(15, '2026_03_21_153806_create_photos_table', 1),
(16, '2026_03_21_153810_create_videos_table', 1),
(17, '2026_03_23_000001_add_indexes_to_users_table', 1),
(18, '2026_03_23_153715_create_reunions_table', 1);

SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users), true);
SELECT setval(pg_get_serial_sequence('members', 'id'), (SELECT MAX(id) FROM members), true);
SELECT setval(pg_get_serial_sequence('children', 'id'), (SELECT MAX(id) FROM children), true);
SELECT setval(pg_get_serial_sequence('couples', 'id'), (SELECT MAX(id) FROM couples), true);
SELECT setval(pg_get_serial_sequence('relationships', 'id'), (SELECT MAX(id) FROM relationships), true);
SELECT setval(pg_get_serial_sequence('ancestors', 'id'), (SELECT MAX(id) FROM ancestors), true);
SELECT setval(pg_get_serial_sequence('family_books', 'id'), (SELECT MAX(id) FROM family_books), true);
SELECT setval(pg_get_serial_sequence('messages', 'id'), (SELECT MAX(id) FROM messages), true);
SELECT setval(pg_get_serial_sequence('photos', 'id'), (SELECT MAX(id) FROM photos), true);
SELECT setval(pg_get_serial_sequence('videos', 'id'), (SELECT MAX(id) FROM videos), true);
SELECT setval(pg_get_serial_sequence('reunions', 'id'), (SELECT MAX(id) FROM reunions), true);
SELECT setval(pg_get_serial_sequence('calls', 'id'), (SELECT MAX(id) FROM calls), true);
SELECT setval(pg_get_serial_sequence('migrations', 'id'), (SELECT MAX(id) FROM migrations), true);

COMMIT;
