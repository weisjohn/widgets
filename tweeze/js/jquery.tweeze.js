/*
	Author : John Weis
	Plugin : Tweeze
	Purpose: Uses the Search API at Twitter - https://dev.twitter.com/docs/using-search
	Version: 0.1
	
	TODO: 
		implement a since_id store via $.data 
		handle error messaging
		handle rate limiting (via a cookie, so the user doesn't Ctrl + R and freak out

*/
;(function ($) {

    $.fn.tweeze = function (options) {

        var settings = {
        	base_url		: "http://search.twitter.com/search.json?q=",
            count			: '15',
            hashtag_filter	: null,

            linkify			: true,
            max_attempts	: 3,
            min_size		: 0,
            show_senders	: false,
			show_faces		: false,		// does nothing yet
			search_term		: null,
			rpp				: null,
            usernames : {
            	'from' : [],
            	'to'   : []
        	},
        	
        	on_complete : null

        };
        
        var _wrapper = null;
        
        var attempts = 0;
        
        var data_collection = {
        	
        	results : []	
        	
        };
        

        // courtesy of Jeremy Parrish (rrish.org)
        function _linkify(text) {

            return text.replace(/(https?:\/\/\S+)/gi, '<a target="_blank" href="$1">$1</a>').replace(/(^|\s)@(\w+)/g, '$1<a target="_blank" href="http://twitter.com/$2">@$2</a>').replace(/(^|\s)#(\w+)/g, ' <a target="_blank" href="http://search.twitter.com/search?q=%23$2">#$2</a>');
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
        	
        	var url = "";
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
				query_string += settings.search_term + '+';
			}
			
			
        	
			url = settings.base_url + escape(query_string);
			
			if (typeof settings.rpp == 'number') {
				url += '&rpp=' + settings.rpp;
			}
			
        	return url; 
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
		
		
		function _push_tweet(tweet) {
			
			var duplicate = false;
			$.each(data_collection.results, function(i, t){
				
				if (tweet.id_str == t.id_str) {
					duplicate = true;
				}

			});
			
			if (!duplicate) {
				data_collection.results.push(tweet);	
			}
			
		}

		// this retrieves the data from the Twitter Search API 
		function _retrieve_data(search_string) {
			
			attempts++;
			
			$.ajax({
				url : search_string,
				dataType : 'jsonp',
				statusCode : {
					404 : function() { console.log('file not found'); },
					420 : function() { console.log('increase the chill'); }  // TODO: do something with this 
				},
				success : function(data) {
					
					
					if (data['results']) {
					
						console.dir(data['results']);
						
						$.each(data['results'], function(i, tweet) {
						
							// if this tweet is in the list of from users,
							// or the list of from users isn't specified
							// then we'll add it to the collection
							if (_filter_from(tweet)) {
								
								// TODO: make sure we're not duplicating the tweet in the list
								_push_tweet(tweet);
							}
							
						});
						
						// if we still need more, let's call again, going further back in time
						if ((data_collection.results.length < settings.min_size) && (attempts < settings.max_attempts)) {
					
							// TODO: go grab more tweets
							console.log('i need more tweets!');
							_retrieve_data(search_string);
							
						} else {
							
							// if we have an adequate # of tweets, let's render
							_render_data();
						}
					
					} else {
						
						// for some reason, the response from twitter didn't have any ['results']
						// so let's call render just in case
						_render_data();
						
					}
					
				}
			});
		}
		
		// this handles the DOM manipulation
		function _render_data() {
			
			$.each(data_collection.results, function(i, tweet) {
				
				// only show the number that we need to see
				if (i < settings.count) {
					
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
				
			});
			
			
			if (typeof settings.on_complete == 'function') {
				
				settings.on_complete();
			}
			
		}
		

        // TODO: create functions such as update and destroy - http://docs.jquery.com/Plugins/Authoring#Events
        //// returning a function with the .each maintains chainability - http://docs.jquery.com/Plugins/Authoring#Maintaining_Chainability 
        return this.each(function () {

            if (options) {
                $.extend(settings, options);
            }
                        
			// TODO: eventually build in the ability to register and just update, keeping a copy of the current tweets
			
			// set the reference for later 
			_wrapper = $(this).addClass('tweeze');
			
			// grab the data with the default request URL
				// once the data has been retrieved, the retriever calls the renderer
			_retrieve_data(_build_request_url());

            //// we already have a copy of this - http://docs.jquery.com/Plugins/Authoring#Context
        });

    };

})(jQuery);
