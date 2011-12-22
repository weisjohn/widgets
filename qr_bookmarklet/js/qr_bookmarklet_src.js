
// SEAF
(function() {
	
	// very crude script loader
	function load_script(src, test, on_asset_load){
	
		if (!test() ){
			
			var s=document.createElement('script');
			s.setAttribute('src',src);
			document.getElementsByTagName('body')[0].appendChild(s);

			(function wait_timer() {

				setTimeout(function(){

					if (test()) {
						on_asset_load();
					} else {
						wait_timer();
					}

				}, 10);

			})();
			
		}

	}
	
	load_script("http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js", function(){

		return window.jQuery;
		
	}, function(){
		
		load_script("file:///Users/jweis/mysrc/widgets/qr_bookmarklet/js/jquery.qrcode.js/qrcode.js", function() {
			
			return window.QR8bitByte;
			
		}, function() {
			
			load_script("file:///Users/jweis/mysrc/widgets/qr_bookmarklet/js/jquery.qrcode.js/jquery.qrcode.js", function(){
			
				return $.fn.qrcode;
				
			}, function() {
			
				console.log('all assetts loaded');
				
			});
			
		});
		
 	});
		
})();
