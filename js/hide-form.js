/*
 * Adds 4chan-like [Start a New Thread] and [Post a Reply] buttons to pages.
 *
 * Usage:
 * $config['additional_javascript'][] = 'js/jquery.min.js';
 * $config['additional_javascript'][] = 'js/hide-form.js';
 *
 */

$(document).ready(() => {
 if (active_page !== 'index' && active_page !== 'thread')
 return;

 let form_el = $('form[name="post"]');
 let form_msg = active_page === 'index' ? 'Start a New Thread' : 'Post a Reply';

 form_el.hide();
 form_el.after(`<div id="show-post-form" style="font-size:175%;text-align:center;font-weight:bold">[<a href="#" style="text-decoration:none">${_(form_msg)}</a>]</div>`);
 $('div#show-post-form').click(() => {
 $('div#show-post-form').hide();
 form_el.show();
 });
});
