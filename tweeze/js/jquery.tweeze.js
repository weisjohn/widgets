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
			show_faces		: false,		// does nothing yet
			search_term		: null,
            usernames : {
            	'from' : [],
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
        	
        	var query_string = "";
        	
        	// if from or to are < 3, then the results are only filtered after the fact
        	// as the Search API has simplicity requirements
        	
        	// this is also probably one of the DRYest pieces of code i have written in a long time... 
			// loop through and build the @from and @to params
        	$.each(settings.usernames, function(k, set) {
        		if (set.length < 4) {
        			$.each(set , function(i, name){
    	        		if (i > 0 ) { query_string += "OR+"; }
    	        		query_string += k + ":" + name + "+";
    	        	});
        		}
        	});
        	
        	
        	if (settings.usernames.length < 3){
	        	$.each( settings.from_usernames, function(i, val){
	        		if (i > 0 ) {
	        			query_string += "OR+";
					}
	        		query_string += "from:" + val + "+";
	        	});
        	}
        	
        	if (typeof settings.hashtag_filter == 'string') {
				
				query_string += "#" + settings.hashtag_filter + '+';
			}
			
			if (typeof settings.search_term == 'string') {
				query_string += settings.search_term;
			}
        	
        	console.log(settings.base_url + escape(query_string));
        	return settings.base_url + escape(query_string); 
        }
        
		// in logic filter to avoid the complexity requirements from the Twitter Search API
		function _filter_from(tweet) {
			
			var matches = false;
			
			if (settings.usernames['from'].length > 0) {
				$.each(settings.usernames['from'], function(i, name) {
					if (tweet.from_user.toLowerCase() == name.toLowerCase()) {
						matches = true;	
					}
        		});
			} else {
				matches = true;
			}
			
			return matches;
		}


        // TODO: create functions such as update and destory - http://docs.jquery.com/Plugins/Authoring#Events
        //// returning a function with the .each maintains chainability - http://docs.jquery.com/Plugins/Authoring#Maintaining_Chainability 
        return this.each(function () {

            if (options) {
                $.extend(settings, options);
            }
            
            
            var request_url = _build_request_url();
            
			
			// TODO: eventually build in the ability to register and just update, keeping a copy of the current tweets
            
			// TODO: make the request and render the DOM
			
			// capture a reference for later attaching
			var _wrapper = $(this).addClass('tweeze');
			
			$.ajax({
				url : request_url,
				dataType : 'jsonp',
				statusCode : {
					404 : function() { console.log('file not found') },
					420 : function() { console.log('increase the chill') },  // TODO: do something with this 
				},
				success : function(data) {
					
					// when re-writing for the caching layer, pull out the tweets into local storage,
					// build / subscribe a jQuery custom event to listen to changes to localStorage
					// 
					
					if (data['results']) {
						
						$.each(data['results'], function(i, tweet) {
							
							
							// TODO: revisit this and remove if count is null
							if (i < settings.count) {
								
								if (_filter_from(tweet)) {
									
									console.log('tweet ');
									console.dir(tweet);
									
									// build and attach the tweet to the list
									var t = $("<li></li>");
									
									// add the sender to the li
									if (settings.show_senders) {
										$("<a></a>")
											.addClass('user')
											.attr('target', '_blank')
											.attr('href', 'http://twitter.com/' + tweet.from_user)
											.html(tweet.from_user)
											.appendTo(t);
									}
									
									// add the text to the li
									$("<span></span>")
										.addClass('text')
										.html( _linkify(tweet.text) )
										.appendTo(t);
										
									// add the time to the li
									$("<a></a>")
										.addClass('time')
										.attr('target', '_blank')
										.attr('href', 'http://twitter.com/' + tweet.from_user + '/statuses/' + tweet.id_str)
										.html( _prettyDate(tweet.created_at) )
										.appendTo(t);
										
									t.appendTo(_wrapper);
									
								}
								
								
								// 
							
							}
							
						});
						
					}
					
				}
			});
			
			
			
            
            //// we already have a copy of this - http://docs.jquery.com/Plugins/Authoring#Context
        });

    };

})(jQuery);
