{% raw %}function get_cookie(cookie_name)
{
	var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
	if(results)
		return (unescape(results[2]));
	else
		return null;
}

function highlightReply(id)
{
	if(window.event !== undefined && event.which == 2) {
		// don't highlight on middle click
		return true;
	}
	
	var divs = document.getElementsByTagName('div');
	for (var i = 0; i < divs.length; i++)
	{
		if (divs[i].className.indexOf('post') != -1)
			divs[i].className = divs[i].className.replace(/highlighted/, '');
	}
	if (id) {
		post = document.getElementById('reply_'+id);
		if(post)
			post.className += ' highlighted';
	}
}
function focusId(id)
{
	document.getElementById(id).focus();
	init();
}

function generatePassword() {
	pass = '';
	chars = '{% endraw %}{{ config.genpassword_chars }}{% raw %}';
	for(i=0;i<8;i++) {
		rnd = Math.floor(Math.random() * chars.length);
		pass += chars.substring(rnd,rnd + 1);
	}
	return pass;
}

function dopost(form) {
	if(form.elements['name']) {
		localStorage.name = form.elements['name'].value.replace(/ ##.+$/, '');
	}
	if(form.elements['email'] && form.elements['email'].value != 'sage') {
		localStorage.email = form.elements['email'].value;
	}
	
	saved[document.location] = form.elements['body'].value;
	sessionStorage.body = JSON.stringify(saved);
	
	return form.elements['body'].value != "" || form.elements['file'].value != "";
}
function citeReply(id) {
	body = document.getElementById('body');
	
	if (document.selection) {
		// IE
		body.focus();
		sel = document.selection.createRange();
		sel.text = '>>' + id + '\n';
	} else if (body.selectionStart || body.selectionStart == '0') {
		// Mozilla
		start = body.selectionStart;
		end = body.selectionEnd;
		body.value = body.value.substring(0, start) + '>>' + id + '\n' + body.value.substring(end, body.value.length);
	} else {
		// ???
		body.value += '>>' + id + '\n';
	}
}

var selectedstyle = '{% endraw %}{{ config.default_stylesheet.0 }}{% raw %}';
var styles = [
	{% endraw %}{% for stylesheet in stylesheets %}{% raw %}['{% endraw %}{{ stylesheet.name }}{% raw %}', '{% endraw %}{{ stylesheet.uri }}{% raw %}']{% endraw %}{% if not loop.last %}{% raw %},
	{% endraw %}{% endif %}{% endfor %}{% raw %}
];
var saved = {};

function changeStyle(x) {
	localStorage.stylesheet = styles[x][1];
	document.getElementById('stylesheet').href = styles[x][1];
	selectedstyle = styles[x][0];
}

if(localStorage.stylesheet) {
	for(x=0;x<styles.length;x++) {
		if(styles[x][1] == localStorage.stylesheet) {
			changeStyle(x);
			break;
		}
	}
}

function rememberStuff() {
	if(document.forms.post) {
		if(document.forms.post.password) {
			if(!localStorage.password)
				localStorage.password = generatePassword();
			document.forms.post.password.value = localStorage.password;
		}
		
		if(localStorage.name && document.forms.post.elements['name'])
			document.forms.post.elements['name'].value = localStorage.name;
		if(localStorage.email && document.forms.post.elements['email'])
			document.forms.post.elements['email'].value = localStorage.email;
		
		if (window.location.hash.indexOf('q') == 1)
			citeReply(window.location.hash.substring(2));
		
		if(sessionStorage.body) {
			saved = JSON.parse(sessionStorage.body);
			if(get_cookie('{% endraw %}{{ config.cookies.js }}{% raw %}')) {
				// Remove successful posts
				successful = JSON.parse(get_cookie('{% endraw %}{{ config.cookies.js }}{% raw %}'));
				for (var url in successful) {
					saved[url] = null;
				}
				sessionStorage.body = JSON.stringify(saved);
				
				document.cookie = '{% endraw %}{{ config.cookies.js }}{% raw %}={};expires=0;path=/;';
			}
			if(saved[document.location]) {
				document.forms.post.body.value = saved[document.location];
			}
		}
		
		if(localStorage.body) {
			document.forms.post.body.value = localStorage.body;
			localStorage.body = '';
		}
	}
}

{% endraw %}
{% if config.javascript_local_time %}
{% raw %}
function init_localtime(){
	var iso8601 = function iso8601(s) {
		s = s.replace(/\.\d\d\d+/,""); // remove milliseconds
		s = s.replace(/-/,"/").replace(/-/,"/");
		s = s.replace(/T/," ").replace(/Z/," UTC");
		s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
		return new Date(s);
	};
	var zeropad = function(num, count) {
		return [Math.pow(10, count - num.toString().length), num].join('').substr(1);
	};
	
	var times = document.getElementsByTagName('time');
	for (var i = 0; i < times.length ; i++) {
		if(!times[i].textContent.match(/^\d+\/\d+\/\d+ \(\w+\) \d+:\d+:\d+$/)) {
			continue;
		}
		
		var t = iso8601(times[i].getAttribute('datetime'));
		
		times[i].textContent =
			// date
			zeropad(t.getMonth() + 1, 2) + "/" + zeropad(t.getDate(), 2) + "/" + t.getFullYear().toString().substring(2) +
			" (" + ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][t.getDay()]  + ") " +
			// time
			zeropad(t.getHours(), 2) + ":" + zeropad(t.getMinutes(), 2) + ":" + zeropad(t.getSeconds(), 2);
	}
};
{% endraw %}
{% endif %}
{% raw %}

function init() {
	newElement = document.createElement('div');
	newElement.className = 'styles';
	
	for(x=0;x<styles.length;x++) {
		style = document.createElement('a');
		style.innerHTML = '[' + styles[x][0] + ']';
		style.href = 'javascript:changeStyle(' + x + ');';
		if(selectedstyle == styles[x][0])
			style.className = 'selected';
		newElement.appendChild(style);
	}	
	
	document.getElementsByTagName('body')[0].insertBefore(newElement, document.getElementsByTagName('body')[0].lastChild.nextSibling)
	
	if(document.forms.postcontrols) {
		document.forms.postcontrols.password.value = localStorage.password;
	}
	
	if(window.location.hash.indexOf('q') != 1 && window.location.hash.substring(1))
		highlightReply(window.location.hash.substring(1));
}

var RecaptchaOptions = {
	theme : 'clean'
};

(function($) { // jquery code follows
  expand_thread = function(thread_url, post_id) {
    $.ajax({
      url: thread_url,
      dataType: "html",
      success: function(data) {
        /* when we get the thread from server... */
	var html = $(data);
	
	var oldheight = $("#thread_"+post_id).css({"height": "auto"}).height();
	var oldposts = $("#thread_"+post_id+" .post.reply").map (function() { return "#"+$(this).attr("id"); });

	$("#thread_"+post_id)
          .html ($("#thread_"+post_id, html).html());
                /* replace the thread with the thread on the recvd page */

	var newposts = $("#thread_"+post_id+" .post.reply").map (function() { return "#"+$(this).attr("id"); });
	var newheight = $("#thread_"+post_id).css({"height": "auto"}).height();

	var changes = [];
	for (var key = 0; key < newposts.length; key++) {
	  if ($.inArray(newposts[key], oldposts) < 0) {
	    changes.push(newposts[key]);
	  }
	}
	changes = changes.join(", ");

	$(changes).hide().delay(50).slideDown(1200);

  	$("#thread_"+post_id)
	  .css({"height": oldheight, "overflow": "hidden"})
	  .animate({"height": newheight}, {
	    "duration": 1400,
            "complete": function() {
	      $(this).css({"height": "auto", "overflow": "inherit"});
	    }
	  });


          /* not ready for the prime time
          .mouseover (function() { expand_thread(thread_url, post_id); })
          .mouseout (function() { expand_thread(thread_url, post_id); });
		/* when mouse gets over or out a thread
		 * (that means a thread has been scrolled over or out)
                 * the thread expands - this should enhance user experience */

	$("#thread_"+post_id+" .shown_when_thread_expanded").show();
             /* then let's show the [Reply] button and maybe some other fields
              * hidden from the thread page in a regular view */

	if (typeof inline_exp[post_id] != "undefined") {
	  for (key in inline_exp[post_id]) {
 	    if (inline_exp[post_id][key]) {
	      toggle_inline_expansion(key, true);
            } /* we're doing inline expansion for all images */
          }   /* already expanded in this session */
	}
      }
    });
    return false;
  };

  inline_exp = {};

  var get_threadid_and_postid = function(elem){
    var threadid = $(elem).parents('[id^="thread_"]').attr("id").split(/_/)[1];

    var postid = $(elem).parents('[id^="reply_"]');
    postid = (postid.size() <= 0) ? threadid : postid.attr("id").split(/_/)[1];

    return {"threadid": threadid, "postid": postid};
  };

  var toggle_inline_expansion = function(elem, fast){
    var fast = (typeof fast == 'undefined'); /* fast => without animation */

    if (typeof elem == 'number' || typeof elem == 'string') { /* searching by postid */
      elem = $("div#reply_"+elem+" a:has(img[src]:not(.file)), "
              +"div#thread_"+elem+" a:has(img[src]:not(.file))").first();
    }
    var dat = get_threadid_and_postid(elem);

    if (typeof inline_exp[dat.threadid] == "undefined") {
      inline_exp[dat.threadid] = {};
    }
    inline_exp[dat.threadid][dat.postid] = !$(elem).hasClass("image_expanded");

    if(!$(elem).hasClass("image_expanded")) {
      $(elem).data("miniature_url", $(elem).find("img").attr("src"));

      $(elem).find("img")
	.attr("src", $(elem).attr("href"))
        .css({"width": "auto", "height": "auto"});
      
      if (!fast) {
        $(elem).find("img")
	  .css({"opacity": 0.4})
          .load(function(){
            $(elem).find("img").css({"opacity": 1.0});
          });
      }
    }
    else {
      $(elem).find("img")
        .attr("src", $(elem).data("miniature_url"))
        .css({"width": "auto", "height": "auto"});
    }
    $(elem).toggleClass("image_expanded");    
  }

  var init_inline_expanding = function(){
    $('div[id^="thread_"] div.post, div[id^="thread_"]')
      .on("click", "a:has(img[src]:not(.file))", function(e) {
        if(e.which == 2) {
          return true;
        }
	toggle_inline_expansion(this);

	return false;
      });
  };



  $(function(){ // onload
    init();
    {% endraw %}{% if config.inline_expanding %}{% raw %}
    init_inline_expanding();
    {% endraw %}{% endif %}{% raw %}
  });
})(jQuery);

{% endraw %}{% if config.google_analytics %}{% raw %}

var _gaq = _gaq || [];_gaq.push(['_setAccount', '{% endraw %}{{ config.google_analytics }}{% raw %}']);{% endraw %}{% if config.google_analytics_domain %}{% raw %}_gaq.push(['_setDomainName', '{% endraw %}{{ config.google_analytics_domain }}{% raw %}']){% endraw %}{% endif %}{% if not config.google_analytics_domain %}{% raw %}_gaq.push(['_setDomainName', 'none']){% endraw %}{% endif %}{% raw %};_gaq.push(['_trackPageview']);(function() {var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);})();{% endraw %}{% endif %}
