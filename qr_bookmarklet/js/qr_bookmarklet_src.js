
// SEAF
(function() {
	
	// very crude script loader
	function load_script(src, test, on_asset_load){
	
		if (!test() ){
			
			var s = document.createElement('script');
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
				
			
				// create DOM element for jQuery plugin authoring and position it on the screen
					// 
				$("<div></div>")
					.appendTo("body")
					.css({ 
						position: "absolute", 
						"top" : "0",
						"border" : "20px solid #FFFFFF"
					}).qrcode({
						width: 280,
						height: 280,
						text : location.href,
						correctLevel : QRErrorCorrectLevel.L
					}).append(
						$("<a></a>")
							.html("close")
							.attr("href", "#")
							.css({ 
								"background" : "#CCCCCC",
								"display" : "block",
								"textAlign" : "center",
								"textDecoration" : "none",
								"fontSize" : "24px",
								"color" : "black",
								"padding" : "6px"
							}).on("click", function(){
								$(this).parent().remove();
							})
					);
					
				// TODO: add a close button
				
			});
			
		});
		
 	});
		
})();
