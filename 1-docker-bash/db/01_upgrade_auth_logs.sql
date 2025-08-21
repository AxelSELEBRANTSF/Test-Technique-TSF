USE MovieApp;

-- USERS : colonnes pour auth + rôle + horodatage
ALTER TABLE users
  ADD COLUMN email VARCHAR(190) NULL,
  ADD COLUMN password_hash VARCHAR(255) NULL,
  ADD COLUMN display_name VARCHAR(100) NULL,
  ADD COLUMN role ENUM('reader','editor','admin') NOT NULL DEFAULT 'reader',
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Index/contrainte
CREATE INDEX idx_users_username ON users (username);
ALTER TABLE users ADD CONSTRAINT ux_users_email UNIQUE (email);

-- MOVIE : audit create/update + timestamps
ALTER TABLE movie
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN created_by_user_id INT NULL,
  ADD COLUMN updated_by_user_id INT NULL;

-- FKs
ALTER TABLE movie
  ADD CONSTRAINT fk_movie_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_movie_updated_by
    FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Indexes pour recherche et pagination
CREATE INDEX idx_movie_title ON movie (title);
CREATE INDEX idx_movie_production ON movie (production);
CREATE INDEX idx_movie_director ON movie (director);
CREATE INDEX idx_movie_id ON movie (id);

-- LOGS d’activité
CREATE TABLE user_activity_logs (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NULL,
  action      VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id   INT NULL,
  message     TEXT NULL,
  ip          VARCHAR(45) NULL,
  user_agent  VARCHAR(255) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_logs_user_created ON user_activity_logs (user_id, created_at);
CREATE INDEX idx_logs_created ON user_activity_logs (created_at);
