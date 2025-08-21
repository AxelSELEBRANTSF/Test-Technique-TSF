<?php
// Si c'est un fichier réel, on laisse le serveur l'envoyer tel quel
if (is_file(__DIR__.$_SERVER['REQUEST_URI'])) { return false; }
require __DIR__.'/index.php';
