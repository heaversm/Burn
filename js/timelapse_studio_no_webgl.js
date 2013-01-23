//VIDEO VARIABLES
var elapsedTime = 0;
var vidWidth = 720;
var vidHeight = 405;
var elapsedTime = 0;
var isInitial = true;

//ANIMATING VARIABLES
var tweenSlow = 2000; //zoom time
var tweenFast = 500;

//CONTROL THE PARENT FRAME

var $jwPlayerContainer = $('#jwPlayerContainer');
var $sharepos = $('#sharepos', window.parent.document);
$sharepos.css({'top' : '657px'});

jwplayer('jwPlayer').setup({
	controlbar: 'over',
	modes: [
		{type: 'flash', src: "js/jw/player.swf"},
		{type: 'html5'},
		{type: 'download'}
	],
	width: vidWidth,
  	height: vidHeight,
	file: 'studio/c0.mov',
	image: 'images/posters/studio/c0.jpg',
	mediaid: 'studio_c0',
	autostart: false,
	provider: 'rtmp',
	skin: 'js/jw/skins/glow.zip',
	streamer: 'rtmp://s250uka5zg5k26.cloudfront.net/cfx/st',
	plugins: { 
		"js/jw/gapro-2.js": {
			"trackingobject" : _gaq,
			"trackstarts" : true,
			"trackpercentage" : false,
			"trackseconds" : true,
			"idstring": "||mediaid||"
		} 
	}
 });

jwplayer().onReady(function(){
	jwplayer().onPlaylist(function(e){
			jwplayer().seek(elapsedTime);
	})
});