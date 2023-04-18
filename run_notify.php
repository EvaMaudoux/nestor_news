<?php

// appel de ce script dans le planificateur de tâches - notifications qui doivent être envoyées postérieurement

require __DIR__ . '/vendor/autoload.php';

require 'database.php';
require 'news.lib.php';


$connect = connect();

notify();