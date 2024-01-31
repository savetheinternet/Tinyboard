<?php // Vichan specific generation strategy

defined('TINYBOARD') or exit;


function generation_strategy($fun, $array=array()) { global $config;
	$action = false;

	foreach ($config['generation_strategies'] as $s) {
		if ($action = $s($fun, $array)) {
			break;
		}
	}

	switch ($action[0]) {
		case 'immediate':
			return 'rebuild';
		case 'defer':
			// Ok, it gets interesting here :)
			get_queue('generate')->push(serialize(array('build', $fun, $array, $action)));
			return 'ignore';
		case 'build_on_load':
			return 'delete';
	}
}

function strategy_immediate($fun, $array) {
	return array('immediate');
}

function strategy_smart_build($fun, $array) {
	return array('build_on_load');
}

function strategy_sane($fun, $array) { global $config;
	if (php_sapi_name() == 'cli') {
		return false;
	}
	elseif (isset($_POST['mod'])) {
		return false;
	}
	// Thread needs to be done instantly. Same with a board page, but only if posting a new thread.
	elseif ($fun == 'sb_thread' || ($fun == 'sb_board' && $array[1] == 1 && isset ($_POST['page']))) {
		return array('immediate');
	}
	return false;
}

// My first, test strategy.
function strategy_first($fun, $array) {
	switch ($fun) {
		case 'sb_thread':
		case 'sb_api':
		case 'sb_catalog':
		case 'sb_ukko':
			return array('defer');
		case 'sb_board':
			return $array[1] > 8 ? array('build_on_load') : array('defer');
		case 'sb_recent':
		case 'sb_sitemap':
			return array('build_on_load');
	}
}
