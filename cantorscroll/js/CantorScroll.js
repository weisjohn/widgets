/*
 Cantor Scroll
 
 */
(function(window, $, undefined){

	var instances = 0;

    $.cantorscroll = function canscr(options, callback, element){
    
        this.element = $(element);
        this._create(options, callback, instances++);
        
    };
    
    $.cantorscroll.defaults = {        
   
		/* default options */
		can_id : 0, // instance id, helps eventing
		binder : $(window), // used to cache the selector
		buffer_px : 0,
		debug : false,
		
		sort_types : [],
		categories : [],
		paging_frame_size : 15, // the number of elements that are within a page
		
		view_state: {
			
			during_ajax : false,
			invalid_page : false,
			destroyed : false,
			done : false, // For when it goes all the way through the archive.
			paused : false,
			
			page_cursor : 0,
			sort_type : "",
			category : ""
		},
		
		url : ""
    };
    
	$.cantorscroll.prototype = {        


        /* --------------
         * private methods
         * -------------- 
		 */
		
		_binding : function canscr_binding(binding) {
			
			var instance = this,
				opts = instance.options;

			
			if (binding == 'unbind') {

                (opts.binder).unbind('smartscroll.canscr.' + opts.can_id);

            } else {

                (opts.binder)[binding]('smartscroll.canscr.' + opts.can_id, function () {
                    instance.scroll();
                });

            };

            this._debug('binding', binding);
			
		},
		
		
		_create: function canscr_create(options, callback, instance_id){ 
		
			// Define options and shorthand
            var opts = this.options = $.extend(true, {}, $.cantorscroll.defaults, options);
		
			// recore which instance we have, helps separate out the eventing
			this.options.can_id = instance_id;

			// create and build the pages_visited tree
			opts.pages_visited = {};
			for (var i = 0; i < opts.sort_types.length; i++) {
				opts.pages_visited[opts.sort_types[i]] = [];
				// categories 
				for (var j = 0; j < opts.categories.length; j++) {
					opts.pages_visited[opts.sort_types[i]][opts.categories[j]] = []; 
				}
			}
			
			
			this._binding('bind');
		},
		
		
		// Console log wrapper
        _debug: function canscr_debug() {

			if (this.options && this.options.debug) {
                return window.console && console.log.apply(console, arguments);
            }
        },
		
		
		_near_last_retrieved_page : function canscr_near_last_retrieved_page() {
			
			var opts = this.options;
			var state = opts.view_state;
			
			
			// TODO: if the trigger position is beyond the trigger point, trigger
				
				// calculate trigger position
				var trigger_position = $(window).scrollTop() + $(window).height() + opts.buffer_px;
					
				// calculate page_cursor value
				var children_visible = 0;
					
					// find the number of elements that have tops above the trigger_position
					this.element.children().each(function() { 
					
						if ( $(this).offset()['top'] < trigger_position ) {
							
							$(this).css('border', '2px solid yellow');
							children_visible++;
						}
					});
				
					this._debug('children visible:', children_visible);
				
					// opts.page_visited[state.sort_type][state.category]
					this._debug('current page:', state.page_cursor);
				
					var visited_current_page = false;
					for (var i = 0; i < opts.pages_visited[state.sort_type][state.category].length; i++) {
						if ( state.page_cursor == opts.pages_visited[state.sort_type][state.category][i] ) 
							visited_current_page = true;	
					}
				
				this._debug('current page visited?', visited_current_page);
				this._debug('opts.pages_visited[state.sort_type][state.category]', opts.pages_visited[state.sort_type][state.category]);
				
				// if we haven't visited this page, we need to retrieve elements
				// TODO: do this after the ajax call to retrieve more elements
				// set the current page_visited to be the page we're on
				// TODO: uncomment this once the page_cursor value is calculated correctly
				// opts.pages_visited[state.sort_type][state.category] = [state.page_cursor];
			
			
			// logic from the infinite scroll... 
			// pixelsFromWindowBottomToBottom = 0 + $(document).height() - (opts.binder.scrollTop()) - $(window).height();
			
			// TODO: find how many items are currently visible, minus the 
			
			// TODO: find the current bottom 

			this._debug('scroll math:');
			this._debug('trigger position:', trigger_position);

            // logic from the infinite scroll
			// 
			// if distance remaining in the scroll (including buffer) is less than the orignal nav to bottom....
            // 
			// return (pixelsFromWindowBottomToBottom - opts.bufferPx < opts.pixelsFromNavToBottom);
		},
    
	
	
        /* --------------
         * public methods
         * -------------- 
		 */
		bind : function canscr_bind() {
			this._binding('bind');
		},
		
		filter : function canscr_filter(c) {
			
			var opts = this.options,
				state = opts.view_state;
			
			// make sure this is a valid category		
			for (var i = 0; i < opts.categories.length; i++) {
				
				if (c == opts.categories[i]) {
					this._debug('changing category from:', state.category, 'to:', c);
					
					state.category = c;
				}
			}
		},
		
		
		// based on current categories / sorts, retrieve the next page 
		retrieve : function canscr_retrieve() {
			
			var opts = this.options,
				state = opts.state;
			
			// TODO: mark current filter/sort/page as visited
			
			// TODO: add dummy foo objects?
			
		},
		
		
		// Check to see next page is needed
        scroll : function canscr_scroll() {
			
			console.log('scroll');

            var opts = this.options,
				state = opts.view_state;

			if (state.during_ajax || state.invalid_page || state.done || state.destroyed || state.paused) return;

            if (!this._near_last_retrieved_page()) return;

            this.retrieve();

        },
		
		// change
		sort : function canscr_sort(s) {
			
			var opts = this.options,
				state = opts.view_state;
			
			// make sure this is a valid sort_type
			for (var i = 0; i < opts.sort_types.length; i++) {
				if (s == opts.sort_types[i]) {
					
					this._debug('changing sort from:', state.sort_type, 'to:', s);
					
					state.sort_type = s;
				}
			}
		},
	
		unbind : function canscr_unbind() {
			this._binding('unbind');
		}
		
		
    };
    
    
	
	// this is a beautiful pattern! allows invoke or execute
    $.fn.cantorscroll = function canscr_init(options, callback){
    
        var thisCall = typeof options;
        
        switch (thisCall) {
        
            // method 
            case 'string':
			
                var args = Array.prototype.slice.call(arguments, 1);
                
                this.each(function(){
                
                    var instance = $.data(this, 'cantorscroll');
					
                    if (!instance) {
											
                        // not setup yet
                        // return $.error('Method ' + options + ' cannot be called until Infinite Scroll is setup');
                        return false;
                    }
                    if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                        // return $.error('No such method ' + options + ' for Infinite Scroll');
                        return false;
                    }
                    
                    // no errors!
                    instance[options].apply(instance, args);
                    
                });
                
                break;
                
            // creation 
            case 'object':
                
                this.each(function(){
                
                    var instance = $.data(this, 'cantorscroll');
                    
                    if (instance) {
                    
                        // update options of current instance
                        instance.update(options);
                        
                    } else {
                    
                        // initialize new instance
                        $.data(this, 'cantorscroll', new $.cantorscroll(options, callback, this));
                        
                    }
                    
                });
                
                break;
                
        }
        
        return this;
        
    }
    
    
    /* 
     * smartscroll: debounced scroll event for jQuery *
     * https://github.com/lukeshumard/smartscroll
     * Based on smartresize by @louis_remi: https://github.com/lrbabe/jquery.smartresize.js *
     * Copyright 2011 Louis-Remi & Luke Shumard * Licensed under the MIT license. *
     */
    var event = $.event, scrollTimeout;
    
    event.special.smartscroll = {
        setup: function(){
            $(this).bind("scroll", event.special.smartscroll.handler);
        },
        teardown: function(){
            $(this).unbind("scroll", event.special.smartscroll.handler);
        },
        handler: function(event, execAsap){
            // Save the context
            var context = this, args = arguments;
            
            // set correct event type
            event.type = "smartscroll";
            
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(function(){
                $.event.handle.apply(context, args);
            }, execAsap === "execAsap" ? 0 : 100);
        }
    };
    
    $.fn.smartscroll = function(fn){
        return fn ? this.bind("smartscroll", fn) : this.trigger("smartscroll", ["execAsap"]);
    };
    
    
})(window, jQuery);
