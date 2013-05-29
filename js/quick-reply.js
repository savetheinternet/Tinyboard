/*
 * quick-reply.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/quick-reply.js
 *
 * Released under the MIT license
 * Copyright (c) 2012 Michael Save <savetheinternet@tinyboard.org>
 *
 * Usage:
 *   $config['quick_reply'] = true;
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/quick-reply.js';
 *
 */

$(document).ready(function(){
	if($('div.banner').length != 0)
		return; // not index
	
	txt_new_topic = $('form[name=post] input[type=submit]').val();
	txt_new_reply = txt_new_topic == 'Submit' ? txt_new_topic : new_reply_string;
	
	undo_quick_reply = function() {
		$('div.banner').remove();
		$('form[name=post] input[type=submit]').val(txt_new_topic);
		$('form[name=post] input[name=quick-reply]').remove();
	}
	
	$('div.post.op').each(function() {
		var id = $(this).children('p.intro').children('a.post_no:eq(1)').text();
		$('<a href="?/b/res/69.html">[Quick reply]</a>').insertAfter($(this).children('p.intro').children('a:last')).click(function() {
			$('div.banner').remove();
			$('<div class="banner">Posting mode: Replying to <small>&gt;&gt;' + id + '</small> <a class="unimportant" onclick="undo_quick_reply()" href="javascript:void(0)">[Return]</a></div>')
				.insertBefore('form[name=post]');
			$('form[name=post] input[type=submit]').val(txt_new_reply);
			
			$('<input type="hidden" name="quick-reply" value="' + id + '">').appendTo($('form[name=post]'));
			
			$('form[name=post] textarea').select();
			
			window.scrollTo(0, 0);
			
			return false;
		});		
	});
});

