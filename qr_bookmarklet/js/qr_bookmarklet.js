

(function() {
	
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
			
		} else {
			on_asset_load();
		}

	}
	
	load_script("http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js", function(){

		return window.jQuery;
		
	}, function(){
		
		load_script("http://weisjohn.github.com/widgets/qr_bookmarklet/js/jquery.qrcode.js/qrcode.js", function() {
			
			return window.QR8bitByte;
			
		}, function() {
			
			load_script("http://weisjohn.github.com/widgets/qr_bookmarklet/js/jquery.qrcode.js/jquery.qrcode.js", function(){
			
				return jQuery.fn.qrcode;
				
			}, function() {
				
				window.gencode = function() {
					
				jQuery("<div></div>")
					.appendTo("body")
					.css({ 
						"position": "fixed", 
						"top" : "0",
						"left" : "0",
						"border" : "18px solid #FFFFFF"
					}).qrcode({
						width: 256,
						height: 256,
						text : location.href,
						correctLevel : QRErrorCorrectLevel.L
					}).append(

						jQuery("<a></a>")
							.html("close")
							.attr("href", "#")
							.css({ 
								"background" : "#CCCCCC",
								"display" : "block",
								"textAlign" : "center",
								"textDecoration" : "none",
								"fontSize" : "24px",
								"color" : "black",
								"padding" : "6px",
								"height" : "28px"
							}).click(function(){
								jQuery(this).parent().remove();
							})
					);
				
				}
				
				gencode();
				
			});
			
		});
		
 	});
		
})();
