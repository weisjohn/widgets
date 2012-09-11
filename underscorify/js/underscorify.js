javascript: (function () {
	var el = document.createElement('div'),
		b = document.getElementsByTagName('body')[0];
	otherlib = false, msg = '';
	el.style.position = 'fixed';
	el.style.width = '50%';
	el.style.marginLeft = '-25%';
	el.style.top = '0';
	el.style.left = '50%';
	el.style.padding = '1em';
	el.style.zIndex = 1000001;
	el.style.fontSize = '1em';
	el.style.color = '#222';
	el.style.backgroundColor = '#f99';
    el.style.fontFamily = 'Helvetica, Arial';
	if (typeof _ === 'function') {
		msg = 'This page already using Underscore v' + _.VERSION;
		return showMsg();
	} else if (typeof _ !== 'undefined') {
		otherlib = true;
	}
	function getScript(url, success) {
		var script = document.createElement('script');
		script.src = url;
		var head = document.getElementsByTagName('head')[0],
			done = false;
		script.onload = script.onreadystatechange = function () {
			if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
				done = true;
				success();
			}
		};
		head.appendChild(script);
	}
	getScript('http://documentcloud.github.com/underscore/underscore-min.js', function () {
		if (typeof _ == 'undefined') {
			msg = 'Sorry, but Underscore wasn\'t able to load';
		} else {
			msg = 'This page is now Underscorified with v' + _.VERSION;
			if (otherlib) {
				msg += ' and using noConflict().<br /><br /> Use <code>underscore</code>, not <code>_</code>';
				msg += ' or something like <pre>(function(_) { <br /> /* _.each() ... */ <br />})(underscore); ';
				underscore = _.noConflict();
			}
		}
		return showMsg();
	});
	function showMsg() {
		el.innerHTML = msg;
		b.appendChild(el);
		window.setTimeout(function () {
			b.removeChild(el);
		}, 25000);
	}
})();