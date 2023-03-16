<?php
require 'database.php';
require 'news.lib.php';

$connect = connect();

$news = insertNews();

// Récupère tous les enregistrements services workers
