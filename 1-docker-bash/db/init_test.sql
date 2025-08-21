DROP DATABASE IF EXISTS MovieApp_test;
CREATE DATABASE MovieApp_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE MovieApp_test.users LIKE MovieApp.users;
CREATE TABLE MovieApp_test.movie LIKE MovieApp.movie;

INSERT INTO MovieApp_test.users SELECT * FROM MovieApp.users;
INSERT INTO MovieApp_test.movie SELECT * FROM MovieApp.movie;
