<?php

require __DIR__ . '/vendor/autoload.php';
require 'database.php';
require 'news.lib.php';

$connect = connect();

$news = insertNews();

if ($news) {
    notify();
}