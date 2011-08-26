/*
	Author : John Weis
	Plugin : Tweeze
	Purpose: Uses the Search API at Twitter - https://dev.twitter.com/docs/using-search

	TODO: 
		implement a since_id store via $.data 
		handle error messaging
		handle rate limiting (via a cookie, so the user doesn't Ctrl + R and freak out

*/
;(function ($) {

    $.fn.tweeze = function (options) {

        var settings = {
        	base_url		: "http://search.twitter.com/search.json?q=",
            count			: '10',
            hashtag_filter	: null,

            linkify			: true,
            show_senders	: false,
            usernames : {
            	'from' : ['weisjohn'],
            	'to'   : []
        	}

        };

        // courtesy of Jeremy Parrish (rrish.org)
        function _linkify(text) {

            return text.replace(/(https?:\/\/\S+)/gi, '<a target="_blank" href="$1">$1</a>').replace(/(^|\s)@(\w+)/g, '$1<a target="_blank" href="http://twitter.com/$2">@$2</a>').replace(/(^|\s)#(\w+)/g, '$1#<a target="_blank" href="http://search.twitter.com/search?q=%23$2">$2</a>');
        };

        /* 
         * Copyright (c) 2008 John Resig (jquery.com)
         * Licensed under the MIT license.
         * 
         * 
         * based on the JavaScript Pretty Date from John Resig
         * http://ejohn.org/blog/javascript-pretty-date/ 
         * his code used ISO 8601, I modified it to use RFC 822 dates
         * 
         * ISO 8601 - 2008-01-28T20:24:17Z
         * RFC 822 - 
         * 
         */
        function _prettyDate(time) {
            // var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
            var date = new Date(time),
                diff = (((new Date()).getTime() - date.getTime()) / 1000),
                day_diff = Math.floor(diff / 86400);

            if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return "undefined";

            return  day_diff == 0 && ( diff < 60 && "just now" || 
            		diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || 
            		diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago") || 
            		day_diff == 1 && "Yesterday" || day_diff < 7 && day_diff + " days ago" || 
            		day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
        }
        
        
        function _build_request_url() {
        	
        	var request_URI = settings.base_url;
        	
        	// if from or to are < 3, then the results are only filtered after the fact
        	// as the Search API has simplicity requirements
        	
        	// this is also problably one of the driest pieces of code i have written in a long time... 
        	$.each(settings.usernames, function(k, set) {
        		
        		if (set.length < 3) {
        			
        			$.each(set , function(i, name){
    	        		
    	        		if (i > 0 ) {
    	        			request_URI += "OR+";
    					}
    	        		request_URI += k + ":" + name + "+";
    	        		
    	        	});
        		}
        		
        	});
        	
        	
        	if (settings.usernames.length < 3){
        		
	        	$.each( settings.from_usernames, function(i, val){
	        		
	        		if (i > 0 ) {
	        			request_URI += "OR+";
					}
	        		request_URI += "from:" + val + "+";
	        		
	        	});
        	}
        	
        	
        	
        	console.log('request_URI: ' + request_URI);
        	return escape(request_URI); 
        }
        

        function contains(a, obj) {
            for (var i = 0; i < a.length; i++) {
                if (a[i] === obj) {
                    return true;
                }
            }
            return false;
        }


        // TODO: create functions such as update and destory - http://docs.jquery.com/Plugins/Authoring#Events
        //// returning a function with the .each maintains chainability - http://docs.jquery.com/Plugins/Authoring#Maintaining_Chainability 
        return this.each(function () {

            if (options) {
                $.extend(settings, options);
            }
            
            
            _build_request_url();
            // TODO: eventually build in the ability to register and just update, keeping a copy of the current tweets
            
            
            //// we already have a copy of this - http://docs.jquery.com/Plugins/Authoring#Context
        });

    };

})(jQuery);
