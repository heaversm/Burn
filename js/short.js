$(document).ready(function() {
    
	var vidWidth = 720, vidHeight = 405;

	jwplayer('film_container').setup({
		controlbar: 'over',
		modes: [
			{type: 'flash', src: "js/jw/player.swf"},
			{type: 'html5'},
			{type: 'download'}
		],
		image: 'images/poster451_720.jpg',
		mediaid: 'Film',
		width: vidWidth,
	  	height: vidHeight,
		levels: [
		            { file: 'video/bulwark_burn.mp4' },    // H.264 version
		            { file: "video/bulwark_burn.ogv" }    // OGG Theora
		        ]
		,
		autostart: false,
		skin: 'js/jw/skins/glow.zip',
		plugins: { 
			"gapro-2": {
				"trackstarts" : true,
				"trackpercentage" : false,
				"trackseconds" : true,
				"idstring": "||mediaid||"
			} 
		}
	 });

	
        
});