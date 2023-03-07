<?php


function connect()
{
    global $connect;

    if (is_a($connect, 'PDO')) {
        return $connect;
    } else {
        try {
            $connect = new PDO('mysql:dbname=nestor;host=localhost;charset=utf8', 'root', '');
            $connect->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $exception) {
            die ('Erreur: ' . $exception->getMessage());
        }
        return $connect;
    }
}

