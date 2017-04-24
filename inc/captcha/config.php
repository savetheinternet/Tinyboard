<?php
// We are using a custom path here to connect to the database.
// Why? Performance reasons.
// change $pdo database_name, database_user, database_password to your own settings if not using xampp or default xampp settings: 
// example $pdo = new PDO("mysql:dbname=database_name;host=localhost", "database_user", "database_password", array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));
$pdo = new PDO("mysql:dbname=hokachan;host=localhost", "root", "", array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));

// Captcha expiration:
$expires_in = 300; // 120 seconds

// Captcha dimensions:
$width = 250;
$height = 80;

// Captcha length:
$length = 5;
