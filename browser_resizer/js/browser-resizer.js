
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
		duration = (typeof duration == "undefined") ? 1000 : duration;
		var start = (new Date).getTime(), finish = start+duration;
		
		// create a new window
		var w = window.open(
			location.href.substring(0, location.href.lastIndexOf("#resize")), 
			random_string(), 
			"width=" + window.outerWidth + "," + "height=" + window.outerHeight
		);
		
		var init_width = window.outerWidth;
		
		// animation loop
		var interval = setInterval(function() { 
			var time = (new Date).getTime();
			var pos = (time > finish) ? 1 : (time-start)/duration;
			
			// calculate the new width
			
			
			// resize the new window
			w.resizeTo(init_width - (init_width * pos), w.outerHeight);
			if (time > finish) clearInterval(interval);
		}, 250);
	}

	listen("load", window, function() {

		if (location.href.lastIndexOf("#resize") > 0) {
			animator(window, 4250);			
		}


	});


})();