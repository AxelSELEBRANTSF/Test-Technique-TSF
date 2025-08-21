USE MovieApp;

-- Utilisateurs de test
-- email/login + mdp : lecteur@lecteur.com / lecteur
--                     editeur@editeur.com / editeur
--                     admin@admin.com     / admin
-- Hashs = bcrypt valides pour les mdp ci-dessus
INSERT INTO users (username, email, password_hash, display_name, role, created_at)
VALUES
  ('lecteur','lecteur@lecteur.com','$2y$10$L6V99x2YBeVvxE55U6YjiOg72cYzkMO2Mqwq8iRWX/sn/sk6ow0AG','lecteur','reader', NOW()),
  ('editeur','editeur@editeur.com','$2y$10$QSFxOmt.xyLtZdXrHq67JuuQY1ACYd2VvD/HZ8Vlich6MMw.5JXvW','editeur','editor', NOW()),
  ('admin','admin@admin.com','$2y$10$FhB/QFfD1SYcKoKL00iw5eNf9ApLX59wjD.LKb9fbfC8O0lIe6n4O','admin','admin', NOW())
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role          = VALUES(role),
  username      = VALUES(username),
  display_name  = VALUES(display_name);

-- Références d'auteurs
SET @admin_id  := (SELECT id FROM users WHERE email='admin@admin.com' LIMIT 1);
SET @editor_id := (SELECT id FROM users WHERE email='editeur@editeur.com' LIMIT 1);
SET @reader_id := (SELECT id FROM users WHERE email='lecteur@lecteur.com' LIMIT 1);

INSERT INTO movie (title, production, director, start_date, end_date)
SELECT 'Inception','Warner Bros','Christopher Nolan','2010-07-16',NULL
WHERE NOT EXISTS (SELECT 1 FROM movie WHERE title='Inception' AND director='Christopher Nolan');

INSERT INTO movie (title, production, director, start_date, end_date)
SELECT 'The Matrix','Village Roadshow','Lana Wachowski','1999-03-31',NULL
WHERE NOT EXISTS (SELECT 1 FROM movie WHERE title='The Matrix' AND director='Lana Wachowski');

INSERT INTO movie (title, production, director, start_date, end_date)
SELECT 'Interstellar','Paramount Pictures','Christopher Nolan','2014-11-07','2015-01-01'
WHERE NOT EXISTS (SELECT 1 FROM movie WHERE title='Interstellar' AND director='Christopher Nolan');

INSERT INTO movie (title, production, director, start_date, end_date)
SELECT 'Blade Runner 2049','Warner Bros','Denis Villeneuve','2017-10-06',NULL
WHERE NOT EXISTS (SELECT 1 FROM movie WHERE title='Blade Runner 2049' AND director='Denis Villeneuve');

INSERT INTO movie (title, production, director, start_date, end_date)
SELECT 'Arrival','Paramount Pictures','Denis Villeneuve','2016-11-11',NULL
WHERE NOT EXISTS (SELECT 1 FROM movie WHERE title='Arrival' AND director='Denis Villeneuve');

INSERT INTO movie (title, production, director, start_date, end_date)
SELECT 'Mad Max: Fury Road','Warner Bros','George Miller','2015-05-15',NULL
WHERE NOT EXISTS (SELECT 1 FROM movie WHERE title='Mad Max: Fury Road' AND director='George Miller');

INSERT INTO movie (title, production, director, start_date, end_date)
SELECT 'The Dark Knight','Warner Bros','Christopher Nolan','2008-07-18',NULL
WHERE NOT EXISTS (SELECT 1 FROM movie WHERE title='The Dark Knight' AND director='Christopher Nolan');

INSERT INTO movie (title, production, director, start_date, end_date)
SELECT 'Dune','Legendary Pictures','Denis Villeneuve','2021-10-22',NULL
WHERE NOT EXISTS (SELECT 1 FROM movie WHERE title='Dune' AND director='Denis Villeneuve');

INSERT INTO movie (title, production, director, start_date, end_date)
SELECT 'Spider-Man: Into the Spider-Verse','Sony','Peter Ramsey','2018-12-14',NULL
WHERE NOT EXISTS (SELECT 1 FROM movie WHERE title='Spider-Man: Into the Spider-Verse' AND director='Peter Ramsey');

INSERT INTO movie (title, production, director, start_date, end_date)
SELECT 'The Social Network','Columbia Pictures','David Fincher','2010-10-01',NULL
WHERE NOT EXISTS (SELECT 1 FROM movie WHERE title='The Social Network' AND director='David Fincher');

INSERT INTO movie (title, production, director, start_date, end_date)
SELECT 'Whiplash','Sony Pictures Classics','Damien Chazelle','2014-10-10',NULL
WHERE NOT EXISTS (SELECT 1 FROM movie WHERE title='Whiplash' AND director='Damien Chazelle');

INSERT INTO movie (title, production, director, start_date, end_date)
SELECT 'Parasite','CJ Entertainment','Bong Joon-ho','2019-05-30',NULL
WHERE NOT EXISTS (SELECT 1 FROM movie WHERE title='Parasite' AND director='Bong Joon-ho');

-- Attribution des auteurs (créateur + dernier modif) par groupe
-- Admin
UPDATE movie
SET created_by_user_id=@admin_id, updated_by_user_id=@admin_id
WHERE title IN ('Inception','The Matrix','The Dark Knight');

-- Éditeur
UPDATE movie
SET created_by_user_id=@editor_id, updated_by_user_id=@editor_id
WHERE title IN ('Interstellar','Blade Runner 2049','Arrival','Dune');

-- Lecteur
UPDATE movie
SET created_by_user_id=@reader_id, updated_by_user_id=@reader_id
WHERE title IN ('Mad Max: Fury Road','Spider-Man: Into the Spider-Verse','The Social Network','Whiplash','Parasite');

-- Log de seed
INSERT INTO user_activity_logs (user_id, action, entity_type, entity_id, message)
VALUES (NULL, 'SEED', 'system', NULL, '02_seed.sql executed with lecteur/editeur/admin and expanded movies');
