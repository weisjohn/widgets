
;(function() {
	
	// event listener for browsers
	function listen(evnt, elem, func) {

		if (elem.addEventListener) {
	    	elem.addEventListener(evnt,func,false);
		} else if (elem.attachEvent) { // IE DOM
			elem.attachEvent("on"+evnt, func);
	    }
	}
	
	function random_string() {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 8;
		var randomstring = '';
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}
	}
	
	function animator(elem, duration, property, callback) {

		// this line could be better...
		duration = (typeof duration == "undefined") ? duration : 1000;
		var start = (new Date).getTime(), finish = start+duration;
		
		// create a new window
		var w = window.open(
			location.href.substring(0, location.href.lastIndexOf("#resize")), 
			random_string(), 
			"width=" + window.outerWidth + "," + "height=" + window.outerHeight
		);
		
		// animation loop
		var interval = setInterval(function() { 
			var time = (new Date).getTime();
			var pos = (time > finish) ? 1 : (time-start)/duration;
			
			// resize the new window
			w.resizeTo(window.outerWidth - (window.outerWidth * pos), w.outerHeight);
			if (time > finish) clearInterval(interval);
		}, 1);
	}

	listen("load", window, function() {

		if (location.href.lastIndexOf("#resize") > 0) {
			animator(window, 8000);			
		}


	});


})();