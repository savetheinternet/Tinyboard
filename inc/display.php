<?php

/*
 *  Copyright (c) 2010-2013 Tinyboard Development Group
 */

if (realpath($_SERVER['SCRIPT_FILENAME']) == str_replace('\\', '/', __FILE__)) {
	// You cannot request this file directly.
	exit;
}

/* 
	joaoptm78@gmail.com
	http://www.php.net/manual/en/function.filesize.php#100097
*/
function format_bytes($size) {
	$units = array(' B', ' KB', ' MB', ' GB', ' TB');
	for ($i = 0; $size >= 1024 && $i < 4; $i++) $size /= 1024;
	return round($size, 2).$units[$i];
}

function doBoardListPart($list, $root) {
	global $config;
	
	$body = '';
	foreach ($list as $board) {
		if (is_array($board))
			$body .= ' [' . doBoardListPart($board, $root) . '] ';
		else {
			if (($key = array_search($board, $list)) && gettype($key) == 'string') {
				$body .= ' <a href="' . $board . '">' . $key . '</a> /';
			} else {			
				$body .= ' <a href="' . $root . $board . '/' . $config['file_index'] . '">' . $board . '</a> /';
			}
		}
	}
	$body = preg_replace('/\/$/', '', $body);
	
	return $body;
}

function createBoardlist($mod=false) {
	global $config;
	
	if (!isset($config['boards'])) return array('top'=>'','bottom'=>'');
	
	$body = doBoardListPart($config['boards'], $mod?'?/':$config['root']);
	if (!preg_match('/\] $/', $body))
		$body = '[' . $body . ']';
	
	$body = trim($body);
	
	return array(
		'top' => '<div class="boardlist">' . $body . '</div>',
		'bottom' => '<div class="boardlist bottom">' . $body . '</div>'
	);
}

function error($message, $priority = true) {
	global $board, $mod, $config;
	
	if ($config['syslog'] && $priority !== false) {
		// Use LOG_NOTICE instead of LOG_ERR or LOG_WARNING because most error message are not significant.
		_syslog($priority !== true ? $priority : LOG_NOTICE, $message);
	}
	
	if (defined('STDIN')) {
		// Running from CLI
		die('Error: ' . $message . "\n");
	}
	
	die(Element('page.html', array(
		'config'=>$config,
		'title'=>'Error',
		'subtitle'=>'An error has occured.',
		'body'=>'<center>' .
		        '<h2>' . _($message) . '</h2>' .
			(isset($board) ? 
				"<p><a href=\"" . $config['root'] .
					($mod ? $config['file_mod'] . '?/' : '') .
					$board['dir'] . $config['file_index'] . "\">Go back</a>.</p>" : '') .
		        '</center>'
	)));
}

function loginForm($error=false, $username=false, $redirect=false) {
	global $config;
	
	die(Element('page.html', array(
		'index' => $config['root'],
		'title' => _('Login'),
		'config' => $config,
		'body' => Element('login.html', array(
			'config'=>$config,
			'error'=>$error,
			'username'=>utf8tohtml($username),
			'redirect'=>$redirect
			)
		)
	)));
}

function pm_snippet($body, $len=null) {
	global $config;
	
	if (!isset($len))
		$len = &$config['mod']['snippet_length'];
	
	// Replace line breaks with some whitespace
	$body = str_replace('<br/>', '  ', $body);
	
	// Strip tags
	$body = strip_tags($body);
	
	// Unescape HTML characters, to avoid splitting them in half
	$body = html_entity_decode($body, ENT_COMPAT, 'UTF-8');
	
	// calculate strlen() so we can add "..." after if needed
	$strlen = mb_strlen($body);
	
	$body = mb_substr($body, 0, $len);
	
	// Re-escape the characters.
	return '<em>' . utf8tohtml($body) . ($strlen > $len ? '&hellip;' : '') . '</em>';
}

function capcode($cap) {
	global $config;
	
	if (!$cap)
		return false;
	
	$capcode = array();
	if (isset($config['custom_capcode'][$cap])) {
		if (is_array($config['custom_capcode'][$cap])) {
			$capcode['cap'] = sprintf($config['custom_capcode'][$cap][0], $cap);
			if (isset($config['custom_capcode'][$cap][1]))
				$capcode['name'] = $config['custom_capcode'][$cap][1];
			if (isset($config['custom_capcode'][$cap][2]))
				$capcode['trip'] = $config['custom_capcode'][$cap][2];
		} else {
			$capcode['cap'] = sprintf($config['custom_capcode'][$cap], $cap);
		}
	} else {
		$capcode['cap'] = sprintf($config['capcode'], $cap);
	}
	
	return $capcode;
}

function truncate($body, $url, $max_lines = false, $max_chars = false) {
	global $config;
	
	if ($max_lines === false)
		$max_lines = $config['body_truncate'];
	if ($max_chars === false)
		$max_chars = $config['body_truncate_char'];
	
	// We don't want to risk truncating in the middle of an HTML comment.
	// It's easiest just to remove them all first.
	$body = preg_replace('/<!--.*?-->/s', '', $body);
	
	$original_body = $body;
	
	$lines = substr_count($body, '<br/>');
	
	// Limit line count
	if ($lines > $max_lines) {
		if (preg_match('/(((.*?)<br\/>){' . $max_lines . '})/', $body, $m))
			$body = $m[0];
	}
	
	$body = mb_substr($body, 0, $max_chars);
	
	if ($body != $original_body) {
		// Remove any corrupt tags at the end
		$body = preg_replace('/<([\w]+)?([^>]*)?$/', '', $body);
		
		// Open tags
		if (preg_match_all('/<([\w]+)[^>]*>/', $body, $open_tags)) {
			
			$tags = array();
			for ($x=0;$x<count($open_tags[0]);$x++) {
				if (!preg_match('/\/(\s+)?>$/', $open_tags[0][$x]))
					$tags[] = $open_tags[1][$x];
			}
			
			// List successfully closed tags
			if (preg_match_all('/(<\/([\w]+))>/', $body, $closed_tags)) {
				for ($x=0;$x<count($closed_tags[0]);$x++) {
					unset($tags[array_search($closed_tags[2][$x], $tags)]);
				}
			}
			
			// remove broken HTML entity at the end (if existent)
			$body = preg_replace('/&[^;]+$/', '', $body);
			
			$tags_no_close_needed = array("colgroup", "dd", "dt", "li", "optgroup", "option", "p", "tbody", "td", "tfoot", "th", "thead", "tr", "br", "img");
			
			// Close any open tags
			foreach ($tags as &$tag) {
				if (!in_array($tag, $tags_no_close_needed))
					$body .= "</{$tag}>";
			}
		} else {
			// remove broken HTML entity at the end (if existent)
			$body = preg_replace('/&[^;]*$/', '', $body);
		}
		
		$body .= '<span class="toolong">Post too long. Click <a href="' . $url . '">here</a> to view the full text.</span>';
	}
	
	return $body;
}

function bidi_cleanup($str){
	# Removes all embedded RTL and LTR unicode formatting blocks in a string so that
	# it can be used inside another without controlling its direction.
	# More info: http://www.iamcal.com/understanding-bidirectional-text/
	#
	# LRE - U+202A - 0xE2 0x80 0xAA
	# RLE - U+202B - 0xE2 0x80 0xAB
	# LRO - U+202D - 0xE2 0x80 0xAD
	# RLO - U+202E - 0xE2 0x80 0xAE
	#
	# PDF - U+202C - 0xE2 0x80 0xAC
	#
	$explicits	= '\xE2\x80\xAA|\xE2\x80\xAB|\xE2\x80\xAD|\xE2\x80\xAE';
	$pdf		= '\xE2\x80\xAC';

	$str = preg_replace("!(?<explicits>$explicits)|(?<pdf>$pdf)!", '', $str);
	return $str;
}

function secure_link_confirm($text, $title, $confirm_message, $href) {
	global $config;

	return '<a onclick="if (event.which==2) return true;if (confirm(\'' . htmlentities(addslashes($confirm_message)) . '\')) document.location=\'?/' . htmlentities(addslashes($href . '/' . make_secure_link_token($href))) . '\';return false;" title="' . htmlentities($title) . '" href="?/' . $href . '">' . $text . '</a>';
}
function secure_link($href) {
	return $href . '/' . make_secure_link_token($href);
}

class Post {
	public function __construct($id, $thread, $subject, $email, $name, $trip, $capcode, $body, $time, $thumb, $thumbx, $thumby, $file, $filex, $filey, $filesize, $filename, $ip, $embed, $root=null, $mod=false) {
		global $config;
		if (!isset($root))
			$root = &$config['root'];
		
		$this->id = $id;
		$this->thread = $thread;
		$this->subject = utf8tohtml($subject);
		$this->email = $email;
		$this->name = utf8tohtml($name);
		$this->trip = $trip;
		$this->capcode = $capcode;
		$this->body = $body;
		$this->time = $time;
		$this->thumb = $thumb;
		$this->thumbx = $thumbx;
		$this->thumby = $thumby;
		$this->file = $file;
		$this->filex = $filex;
		$this->filey = $filey;
		$this->filesize = $filesize;
		$this->filename = $filename;
		$this->ip = $ip;
		$this->embed = $embed;
		$this->root = $root;
		$this->mod = $mod;
		
		if ($this->mod)
			// Fix internal links
			// Very complicated regex
			$this->body = preg_replace(
				'/<a((([a-zA-Z]+="[^"]+")|[a-zA-Z]+=[a-zA-Z]+|\s)*)href="' . preg_quote($config['root'], '/') . '(' . sprintf(preg_quote($config['board_path'], '/'), '\w+') . ')/',
				'<a $1href="?/$4',
				$this->body
			);
	}
	public function link($pre = '') {
		global $config, $board;
		
		return $this->root . $board['dir'] . $config['dir']['res'] . sprintf($config['file_page'], $this->thread) . '#' . $pre . $this->id;
	}
	public function postControls() {
		global $board, $config;
		
		$built = '';
		if ($this->mod) {
			// Mod controls (on posts)
			
			// Delete
			if (hasPermission($config['mod']['delete'], $board['uri'], $this->mod))
				$built .= ' ' . secure_link_confirm($config['mod']['link_delete'], 'Delete', 'Are you sure you want to delete this?', $board['uri'] . '/delete/' . $this->id);
			
			// Delete all posts by IP
			if (hasPermission($config['mod']['deletebyip'], $board['uri'], $this->mod))
				$built .= ' ' . secure_link_confirm($config['mod']['link_deletebyip'], 'Delete all posts by IP', 'Are you sure you want to delete all posts by this IP address?', $board['uri'] . '/deletebyip/' . $this->id);
			
			// Delete all posts by IP (global)
			if (hasPermission($config['mod']['deletebyip_global'], $board['uri'], $this->mod))
				$built .= ' ' . secure_link_confirm($config['mod']['link_deletebyip_global'], 'Delete all posts by IP across all boards', 'Are you sure you want to delete all posts by this IP address, across all boards?', $board['uri'] . '/deletebyip/' . $this->id . '/global');
			
			// Ban
			if (hasPermission($config['mod']['ban'], $board['uri'], $this->mod))
				$built .= ' <a title="Ban" href="?/' . $board['uri'] . '/ban/' . $this->id . '">' . $config['mod']['link_ban'] . '</a>';
			
			// Ban & Delete
			if (hasPermission($config['mod']['bandelete'], $board['uri'], $this->mod))
				$built .= ' <a title="Ban & Delete" href="?/' . $board['uri'] . '/ban&amp;delete/' . $this->id . '">' . $config['mod']['link_bandelete'] . '</a>';
			
			// Delete file (keep post)
			if (!empty($this->file) && hasPermission($config['mod']['deletefile'], $board['uri'], $this->mod))
				$built .= ' ' . secure_link_confirm($config['mod']['link_deletefile'], 'Delete file', 'Are you sure you want to delete this file?', $board['uri'] . '/deletefile/' . $this->id);
			
			// Edit post
			if (hasPermission($config['mod']['editpost'], $board['uri'], $this->mod))
				$built .= ' <a title="Edit post" href="?/' . $board['uri'] . '/edit' . ($config['mod']['raw_html_default'] ? '_raw' : '') . '/' . $this->id . '">' . $config['mod']['link_editpost'] . '</a>';
			
			if (!empty($built))
				$built = '<span class="controls">' . $built . '</span>';
		}
		return $built;
	}
	
	public function build($index=false) {
		global $board, $config;
		
		return Element('post_reply.html', array('config' => $config, 'board' => $board, 'post' => &$this, 'index' => $index));
	}
};

class Thread {
	public function __construct($id, $subject, $email, $name, $trip, $capcode, $body, $time, $thumb, $thumbx, $thumby, $file, $filex, $filey, $filesize, $filename, $ip, $sticky, $locked, $bumplocked, $embed, $root=null, $mod=false, $hr=true) {
		global $config;
		if (!isset($root))
			$root = &$config['root'];
		
		$this->id = $id;
		$this->subject = utf8tohtml($subject);
		$this->email = $email;
		$this->name = utf8tohtml($name);
		$this->trip = $trip;
		$this->capcode = $capcode;
		$this->body = $body;
		$this->time = $time;
		$this->thumb = $thumb;
		$this->thumbx = $thumbx;
		$this->thumby = $thumby;
		$this->file = $file;
		$this->filex = $filex;
		$this->filey = $filey;
		$this->filesize = $filesize;
		$this->filename = $filename;
		$this->omitted = 0;
		$this->omitted_images = 0;
		$this->posts = array();
		$this->ip = $ip;
		$this->sticky = $sticky;
		$this->locked = $locked;
		$this->bumplocked = $bumplocked;
		$this->embed = $embed;
		$this->root = $root;
		$this->mod = $mod;
		$this->hr = $hr;
		
		if ($this->mod)
			// Fix internal links
			// Very complicated regex
			$this->body = preg_replace(
				'/<a((([a-zA-Z]+="[^"]+")|[a-zA-Z]+=[a-zA-Z]+|\s)*)href="' . preg_quote($config['root'], '/') . '(' . sprintf(preg_quote($config['board_path'], '/'), '\w+') . ')/',
				'<a $1href="?/$4',
				$this->body
			);
	}
	public function link($pre = '') {
		global $config, $board;
		
		return $this->root . $board['dir'] . $config['dir']['res'] . sprintf($config['file_page'], $this->id) . '#' . $pre . $this->id;
	}
	public function add(Post $post) {
		$this->posts[] = $post;
	}
	public function postControls() {
		global $board, $config;
		
		$built = '';
		if ($this->mod) {
			// Mod controls (on posts)
			// Delete
			if (hasPermission($config['mod']['delete'], $board['uri'], $this->mod))
				$built .= ' ' . secure_link_confirm($config['mod']['link_delete'], 'Delete', 'Are you sure you want to delete this?', $board['uri'] . '/delete/' . $this->id);
			
			// Delete all posts by IP
			if (hasPermission($config['mod']['deletebyip'], $board['uri'], $this->mod))
				$built .= ' ' . secure_link_confirm($config['mod']['link_deletebyip'], 'Delete all posts by IP', 'Are you sure you want to delete all posts by this IP address?', $board['uri'] . '/deletebyip/' . $this->id);
			
			// Delete all posts by IP (global)
			if (hasPermission($config['mod']['deletebyip_global'], $board['uri'], $this->mod))
				$built .= ' ' . secure_link_confirm($config['mod']['link_deletebyip_global'], 'Delete all posts by IP across all boards', 'Are you sure you want to delete all posts by this IP address, across all boards?', $board['uri'] . '/deletebyip/' . $this->id . '/global');
			
			// Ban
			if (hasPermission($config['mod']['ban'], $board['uri'], $this->mod))
				$built .= ' <a title="Ban" href="?/' . $board['uri'] . '/ban/' . $this->id . '">' . $config['mod']['link_ban'] . '</a>';
			
			// Ban & Delete
			if (hasPermission($config['mod']['bandelete'], $board['uri'], $this->mod))
				$built .= ' <a title="Ban & Delete" href="?/' . $board['uri'] . '/ban&amp;delete/' . $this->id . '">' . $config['mod']['link_bandelete'] . '</a>';
			
			// Delete file (keep post)
			if (!empty($this->file) && $this->file != 'deleted' && hasPermission($config['mod']['deletefile'], $board['uri'], $this->mod))
				$built .= ' ' . secure_link_confirm($config['mod']['link_deletefile'], 'Delete file', 'Are you sure you want to delete this file?', $board['uri'] . '/deletefile/' . $this->id);
			
			// Sticky
			if (hasPermission($config['mod']['sticky'], $board['uri'], $this->mod))
				if ($this->sticky)
					$built .= ' <a title="Make thread not sticky" href="?/' . secure_link($board['uri'] . '/unsticky/' . $this->id) . '">' . $config['mod']['link_desticky'] . '</a>';
				else
					$built .= ' <a title="Make thread sticky" href="?/' . secure_link($board['uri'] . '/sticky/' . $this->id) . '">' . $config['mod']['link_sticky'] . '</a>';
			
			if (hasPermission($config['mod']['bumplock'], $board['uri'], $this->mod))
				if ($this->bumplocked)
					$built .= ' <a title="Allow thread to be bumped" href="?/' . secure_link($board['uri'] . '/bumpunlock/' . $this->id) . '">' . $config['mod']['link_bumpunlock'] . '</a>';
				else
					$built .= ' <a title="Prevent thread from being bumped" href="?/' . secure_link($board['uri'] . '/bumplock/' . $this->id) . '">' . $config['mod']['link_bumplock'] . '</a>';
			
			// Lock
			if (hasPermission($config['mod']['lock'], $board['uri'], $this->mod))
				if ($this->locked)
					$built .= ' <a title="Unlock thread" href="?/' . secure_link($board['uri'] . '/unlock/' . $this->id) . '">' . $config['mod']['link_unlock'] . '</a>';
				else
					$built .= ' <a title="Lock thread" href="?/' . secure_link($board['uri'] . '/lock/' . $this->id) . '">' . $config['mod']['link_lock'] . '</a>';
			
			if (hasPermission($config['mod']['move'], $board['uri'], $this->mod))
				$built .= ' <a title="Move thread to another board" href="?/' . $board['uri'] . '/move/' . $this->id . '">' . $config['mod']['link_move'] . '</a>';
			
			// Edit post
			if (hasPermission($config['mod']['editpost'], $board['uri'], $this->mod))
				$built .= ' <a title="Edit post" href="?/' . $board['uri'] . '/edit' . ($config['mod']['raw_html_default'] ? '_raw' : '') . '/' . $this->id . '">' . $config['mod']['link_editpost'] . '</a>';
			
			if (!empty($built))
				$built = '<span class="controls op">' . $built . '</span>';
		}
		return $built;
	}
	
	public function ratio() {
		return fraction($this->filex, $this->filey, ':');
	}
	
	public function build($index=false) {
		global $board, $config, $debug;
		
		$built = Element('post_thread.html', array('config' => $config, 'board' => $board, 'post' => &$this, 'index' => $index));
		
		return $built;
	}
};

