//VIDEO VARIABLES
var elapsedTime = 0;
var vidWidth = 720;
var vidHeight = 405;
var isInitial = true;

//ANIMATING VARIABLES
var tweenSlow = 2000; //zoom time
var tweenFast = 500;
var frameHeight = '450px';

//CONTROL THE PARENT FRAME
var $frameContainer = $('#frameContainer', window.parent.document);
var $burnFrame = $frameContainer.children('#burnFrame');
var $jwPlayerContainer = $('#jwPlayerContainer');
var $sharepos = $('#sharepos', window.parent.document);
var $navpos = $('#navpos', window.parent.document);
$frameContainer.css({'height' : frameHeight});
$burnFrame.css({'height' : frameHeight});
$sharepos.css({'top' : '703px'});
$navpos.css({'top' : '465px'});

jwplayer('jwPlayer').setup({
	controlbar: 'over',
	modes: [
		{type: 'flash', src: "js/jw/player.swf"},
		{type: 'html5'},
		{type: 'download'}
	],
	width: vidWidth,
  	height: vidHeight,
	mediaid: 'build_c0',
	file: 'build/c0.mov',
	image: 'images/posters/build/c0.jpg' ,
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

//PRELOAD ALL THE VIDEO POSTER IMAGES
function preloadPosters(){
	$('.cameraLink').each(function(){
		var camID = $(this).attr('id');
		var camURL = 'images/posters/build/'+camID+'.jpg';
		$('<img/>')[0].src = camURL;
	});
}


$('.cameraLink').click(function(){
	var $cameraLink = $(this);
	var camID = $cameraLink.attr('id');
	var camFile = "build/" + camID + ".mov";
	elapsedTime = jwplayer().getPosition();
	jwplayer().load({
		streamer: 'rtmp://s250uka5zg5k26.cloudfront.net/cfx/st',
		file: camFile,
		image: 'images/posters/build/' + camID + '.jpg' ,
		mediaid: 'build_'+camID,
		provider: 'rtmp'
	});
	
	return false;
	
});

preloadPosters();