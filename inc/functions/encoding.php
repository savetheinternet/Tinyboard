<?php

defined('TINYBOARD') or exit;


function base32_decode($d) {
	$charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	$d = str_split($d);
	$l = array_pop($d);
	$b = '';
	foreach ($d as $c) {
		$b .= sprintf("%05b", strpos($charset, $c));
	}
	$padding = 8 - strlen($b) % 8;
	$b .= str_pad(decbin(strpos($charset, $l)), $padding, '0', STR_PAD_LEFT);

	return implode('', array_map(function($c) { return chr(bindec($c)); }, str_split($b, 8)));
}

function base32_encode($d) {
	$charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	$b = implode('', array_map(function($c) { return sprintf("%08b", ord($c)); }, str_split($d)));
	return implode('', array_map(function($c) use ($charset) { return $charset[bindec($c)]; }, str_split($b, 5)));
}
