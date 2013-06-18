{% raw %}

var saved = {};


var selectedstyle = '{% endraw %}{{ config.default_stylesheet.0|addslashes }}{% raw %}';
var styles = {
	{% endraw %}
	{% for stylesheet in stylesheets %}{% raw %}'{% endraw %}{{ stylesheet.name|addslashes }}{% raw %}' : '{% endraw %}{{ stylesheet.uri|addslashes }}{% raw %}',
	{% endraw %}{% endfor %}{% raw %}
};

function changeStyle(styleName, link) {
	localStorage.stylesheet = styleName;
	
	if (!document.getElementById('stylesheet')) {
		var s = document.createElement('link');
		s.rel = 'stylesheet';
		s.type = 'text/css';
		s.id = 'stylesheet';
		var x = document.getElementsByTagName('head')[0];
		x.appendChild(s);
	}
	
	document.getElementById('stylesheet').href = styles[styleName];
	selectedstyle = styleName;
	
	if (document.getElementsByClassName('styles').length != 0) {
		var styleLinks = document.getElementsByClassName('styles')[0].childNodes;
		for (i = 0; i < styleLinks.length; i++) {
			styleLinks[i].className = '';
		}
	}
	
	if (link) {
		link.className = 'selected';
	}
}

if (localStorage.stylesheet) {
	for (styleName in styles) {
		if (styleName == localStorage.stylesheet) {
			changeStyle(styleName);
			break;
		}
	}
}

function init_stylechooser() {
	var newElement = document.createElement('div');
	newElement.className = 'styles';
	
	for (styleName in styles) {
		var style = document.createElement('a');
		style.innerHTML = '[' + styleName + ']';
		style.onclick = function() {
			changeStyle(this.innerHTML.substring(1, this.innerHTML.length - 1), this);
		};
		if (styleName == selectedstyle) {
			style.className = 'selected';
		}
		style.href = 'javascript:void(0);';
		newElement.appendChild(style);
	}	
	
	document.getElementsByTagName('body')[0].insertBefore(newElement, document.getElementsByTagName('body')[0].lastChild.nextSibling);
}

function get_cookie(cookie_name) {
	var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
	if (results)
		return (unescape(results[2]));
	else
		return null;
}

function highlightReply(id) {
	if (typeof window.event != "undefined" && event.which == 2) {
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
		var post = document.getElementById('reply_'+id);
		if (post)
			post.className += ' highlighted';
	}
}

function generatePassword() {
	var pass = '';
	var chars = '{% endraw %}{{ config.genpassword_chars }}{% raw %}';
	for (var i = 0; i < 8; i++) {
		var rnd = Math.floor(Math.random() * chars.length);
		pass += chars.substring(rnd, rnd + 1);
	}
	return pass;
}

function dopost(form) {
	if (form.elements['name']) {
		localStorage.name = form.elements['name'].value.replace(/( |^)## .+$/, '');
	}
	if (form.elements['email'] && form.elements['email'].value != 'sage') {
		localStorage.email = form.elements['email'].value;
	}
	
	saved[document.location] = form.elements['body'].value;
	sessionStorage.body = JSON.stringify(saved);
	
	return form.elements['body'].value != "" || form.elements['file'].value != "";
}

function citeReply(id) {
	var body = document.getElementById('body');
	
	if (document.selection) {
		// IE
		body.focus();
		var sel = document.selection.createRange();
		sel.text = '>>' + id + '\n';
	} else if (body.selectionStart || body.selectionStart == '0') {
		// Mozilla
		var start = body.selectionStart;
		var end = body.selectionEnd;
		body.value = body.value.substring(0, start) + '>>' + id + '\n' + body.value.substring(end, body.value.length);
	} else {
		// ???
		body.value += '>>' + id + '\n';
	}
}

function rememberStuff() {
	if (document.forms.post) {
		if (document.forms.post.password) {
			if (!localStorage.password)
				localStorage.password = generatePassword();
			document.forms.post.password.value = localStorage.password;
		}
		
		if (localStorage.name && document.forms.post.elements['name'])
			document.forms.post.elements['name'].value = localStorage.name;
		if (localStorage.email && document.forms.post.elements['email'])
			document.forms.post.elements['email'].value = localStorage.email;
		
		if (window.location.hash.indexOf('q') == 1)
			citeReply(window.location.hash.substring(2));
		
		if (sessionStorage.body) {
			var saved = JSON.parse(sessionStorage.body);
			if (get_cookie('{% endraw %}{{ config.cookies.js }}{% raw %}')) {
				// Remove successful posts
				var successful = JSON.parse(get_cookie('{% endraw %}{{ config.cookies.js }}{% raw %}'));
				for (var url in successful) {
					saved[url] = null;
				}
				sessionStorage.body = JSON.stringify(saved);
				
				document.cookie = '{% endraw %}{{ config.cookies.js }}{% raw %}={};expires=0;path=/;';
			}
			if (saved[document.location]) {
				document.forms.post.body.value = saved[document.location];
			}
		}
		
		if (localStorage.body) {
			document.forms.post.body.value = localStorage.body;
			localStorage.body = '';
		}
	}
}

function init() {
	init_stylechooser();
	
	if (document.forms.postcontrols) {
		document.forms.postcontrols.password.value = localStorage.password;
	}
	
	if (window.location.hash.indexOf('q') != 1 && window.location.hash.substring(1))
		highlightReply(window.location.hash.substring(1));
}

var RecaptchaOptions = {
	theme : 'clean'
};

onready_callbacks = [];
function onready(fnc) {
	onready_callbacks.push(fnc);
}

function ready() {
	for (var i = 0; i < onready_callbacks.length; i++) {
		onready_callbacks[i]();
	}
}

onready(init);

{% endraw %}{% if config.google_analytics %}{% raw %}

var _gaq = _gaq || [];_gaq.push(['_setAccount', '{% endraw %}{{ config.google_analytics }}{% raw %}']);{% endraw %}{% if config.google_analytics_domain %}{% raw %}_gaq.push(['_setDomainName', '{% endraw %}{{ config.google_analytics_domain }}{% raw %}']){% endraw %}{% endif %}{% if not config.google_analytics_domain %}{% raw %}_gaq.push(['_setDomainName', 'none']){% endraw %}{% endif %}{% raw %};_gaq.push(['_trackPageview']);(function() {var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);})();{% endraw %}{% endif %}

