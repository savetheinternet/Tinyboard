<?php // Text handling functions.

defined('TINYBOARD') or exit;


function sprintf3($str, $vars, $delim = '%') {
	$replaces = array();
	foreach ($vars as $k => $v) {
		$replaces[$delim . $k . $delim] = $v;
	}
	return str_replace(array_keys($replaces), array_values($replaces), $str);
}

function mb_substr_replace($string, $replacement, $start, $length) {
	return mb_substr($string, 0, $start) . $replacement . mb_substr($string, $start + $length);
}

function format_timestamp($timestamp) {
	switch(TRUE) {
		case ($timestamp < 60):
			return $timestamp . ' ' . ngettext('second', 'seconds', $timestamp);
		case ($timestamp < 3600): //60*60 = 3600
			return ($num = round($timestamp / 60)) . ' ' . ngettext('minute', 'minutes', $num);
		case ($timestamp < 86400): //60*60*24 = 86400
			return ($num = round($timestamp / 3600)) . ' ' . ngettext('hour', 'hours', $num);
		case ($timestamp < 604800): //60*60*24*7 = 604800
			return ($num = round($timestamp / 86400)) . ' ' . ngettext('day', 'days', $num);
		case ($timestamp < 31536000): //60*60*24*365 = 31536000
			return ($num = round($timestamp / 604800)) . ' ' . ngettext('week', 'weeks', $num);
		default:
			return ($num = round($timestamp / 31536000)) . ' ' . ngettext('year', 'years', $num);
	}
}

function until($timestamp) {
	$difference = $timestamp - time();
	return format_timestamp($difference);
}

function ago($timestamp) {
	$difference = time() - $timestamp;
	return format_timestamp($difference);
}
