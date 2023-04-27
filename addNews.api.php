<?php

require __DIR__ . '/vendor/autoload.php';
require 'database.php';
require 'news.lib.php';

$connect = connect();

// Insertion d'une annonce en base de données
insertNews();

// Envoi d'une notification dès qu'il y a insertion d'annonce
notify();