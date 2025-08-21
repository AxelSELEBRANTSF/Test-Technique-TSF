CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL
);

CREATE TABLE movie (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    production VARCHAR(255) NOT NULL,
    director VARCHAR(255) NOT NULL,
    start_date DATE,
    enddate DATE
);

INSERT INTO users (username) VALUES ('alice'), ('bob');

INSERT INTO movie (title, production, director, start_date, enddate) VALUES
('Inception', 'Warner Bros', 'Christopher Nolan', '2010-07-16', NULL),
('The Matrix', 'Village Roadshow', 'Lana Wachowski', '1999-03-31', NULL),
('Interstellar', 'Paramount Pictures', 'Christopher Nolan', '2014-11-07', '2015-01-01');