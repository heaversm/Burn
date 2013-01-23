//SCENE VARIABLES
var scene, renderer, loader, mesh;
var camera, keyboard;
var animating = false;
var rotSpeed = .02;

//MODEL VARIABLES
var modelPos = { x: 20, y: 20, z: 0 }

//THUMBNAIL VARIABLES
var objects = [];

//VIDEO VARIABLES
var vidRatio = .8; //size of video in relation to window size
var windowWidth = window.innerWidth;
var vidWidth = Math.round(windowWidth*vidRatio);
var vidHeight = (vidWidth/16)*9;
var elapsedTime = 0;
var isInitial = true;

//CIRCLE VARIABLES
var circleRadius = 12; //distance of cameras from center of model
var camRadius = 25; //distance of scene camera from center of model
var diameter = circleRadius*2;
var centerX = 0;
var centerZ = 20;
var mpi = Math.PI/180;
var totalCams = 3;
var incrementAngle = 360/totalCams;
var incrementRadians = incrementAngle * mpi;

//TWEENING VARIABLES
var camTweenOut, camTweenIn; //will allow the camera to zoom in and out on the thumbnails
var currentPos = new THREE.Vector3(0,0,0); //the coordinates the camera will focus on
var camStartPos = new THREE.Vector3(0,300,1050)
var currentFov; //will be used for holding the tweened value of the fov
var zoomInFov = 1	; //fov for closeup
var zoomOutFov = 60; //fov for standard view
var tweenSlow = 2000; //zoom time
var tweenFast = 500;

//CAMERA VARIABLES
var currentCamID; //stores the camera that has been clicked on
var camEase = TWEEN.Easing.Cubic.EaseInOut; //easing function
var camPos; //stores the position of the thumbnail before it moves to center
var camRot; //stores the rotation of the thumbnail before it moves to center
var currentRot; //stores the tweened rotation value
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
$('#cameras').css({'visible':true});

//PRELOADER VARIABLES
var modelLoaded = false;

//SELECTION VARIABLES
var $instructions = $('#instructions');
var $model_loader = $('#model_loader');

$jwPlayerContainer.css({'margin-left' : -vidWidth/2 })

if( !init() )	animate();

function init(){
	
	//CONFIGURATION
	if( Detector.webgl ){
		renderer = new THREE.WebGLRenderer({
			shadowMapSoft : true,
			antialias		: true,	// to get smoother output
			preserveDrawingBuffer	: true	// to allow screenshot
		});
		//renderer.setClearColorHex( 0xFFFFFF, 1 );
	// uncomment if webgl is required
	} /* else{
		Detector.addGetWebGLMessage();
		return true;
	} */ else{
		renderer	= new THREE.CanvasRenderer();
	}
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById('container').appendChild(renderer.domElement);
	$('canvas').attr({'id' : 'modelCanvas' });


	//SCENE
	scene = new THREE.Scene();


	//CAMERA
	camera = new THREE.PerspectiveCamera(zoomOutFov, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set(0,300,1050); 
	camera.lookAt(modelPos);
	scene.add(camera);
	
	//PROJECTOR
	projector = new THREE.Projector();

	//KEYBOARD CONTROLS
	keyboard = new THREEx.KeyboardState();
	
	//ORIGIN
	//var origin = new THREE.AxisHelper(); //x = red, y = green, z = blue
	//scene.add( origin );
	
	//LIGHTS
	var directionalLight1 = new THREE.DirectionalLight( 0xffffff, .9 );
	directionalLight1.position.set( -9, 7, 5 );
	scene.add( directionalLight1 );

	var directionalLight2 = new THREE.DirectionalLight( 0xffffff, .7 );
	directionalLight2.position.set( 8, 6, -13 );
	scene.add( directionalLight2 );

	var directionalLight3 = new THREE.DirectionalLight( 0xffffff, .5 );
	directionalLight3.position.set( -3, 5, 3 );
	scene.add( directionalLight3 );

	var directionalLight4 = new THREE.DirectionalLight( 0xffffff, .4 );
	directionalLight4.position.set( -6, 1, -1 );
	scene.add( directionalLight4 );


	//ADD MODEL
	loader = new THREE.JSONLoader();
	loader.load("https://s3.amazonaws.com/burn/models/quarry-o.js",function(geometry){
		//mesh = new THREE.Mesh( geometry, modelMat);
		mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial());
		scene.add( mesh );
		mesh.position.set(modelPos.x,modelPos.y,modelPos.z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		
		modelLoaded = true;
		$model_loader.fadeTo(500,0,function(){ //If the preloader was visible, we can hide it now
			$(this).hide();
		});
		loadCams();
		activateListeners();
		preloadPosters();
	});

}

function loadCams(){
	camLoader = new THREE.JSONLoader();
	camLoader.load("model/cam.js",buildCams);
}


//BUILD CAMERA SPHERES
var buildCams = function(geometry){
	var camSize = 2;
	var camCount = 0;
	var zStep = 30; //distance to move the camera each time
	var yStep = 20;
	
	var phongMat = new THREE.MeshPhongMaterial( { ambient: 0x000000, color: 0xb81b1b, specular: 0x555555, shininess: 30 } )

	for ( var i = 0; i < totalCams; i ++ ) {
		
		var zp = centerZ + camCount*zStep;
		var yp = -(camCount*yStep);
		
		var camObj = new THREE.Mesh( geometry, phongMat);
		
		camObj.name = "s"+i;
		camObj.position.x = 0;
		
		if (camCount == 0){
			camObj.position.set(0,-10,20);
		} else if (camCount == 1){
			camObj.position.set(0,0,60);
		} else if (camCount == 2){
			camObj.position.set(0,200,800);
		}
		
		camObj.doubleSided = true;
		//camObj.scale.set(10,10,10)
		//camObj.rotation.x = 90*mpi;
		//camObj.rotation.z = -i*incrementAngle*mpi; //MH - do this without degrees

		scene.add( camObj );
		objects.push(camObj);
		camCount++;
		
	}

}


function activateListeners(){
	document.getElementById('modelCanvas').addEventListener( 'mousedown', onDocumentMouseDown, false );
}


jwplayer('jwPlayer').setup({
	controlbar: 'over',
	modes: [
		{type: 'flash', src: "js/jw/player.swf"},
		{type: 'html5'},
		{type: 'download'}
	],
	width: vidWidth,
  	height: vidHeight,
	mediaid: 'quarry_c0',
	file: 'quarry/c0.mov',
	image: 'images/posters/quarry/c0.jpg' ,
	autostart: false,
	provider: 'rtmp',
	skin: 'js/jw/skins/glow.zip',
	streamer: 'rtmp://s250uka5zg5k26.cloudfront.net/cfx/st',
	plugins: { 
		"js/jw/gapro-2.js": {
			"trackstarts" : true,
			"trackpercentage" : false,
			"trackseconds" : true,
			"idstring": "||mediaid||"
		} 
	}
 });

jwplayer().onReady(function(){
	jwplayer().onPlaylist(function(e){
		if (isInitial == true){
			isInitial = false;
		} else {
			jwplayer().seek(elapsedTime);
		}
	})
});

function onDocumentMouseDown( event ) {
	event.preventDefault();
	
	var sceneCamPos = camera.position;
	
	new TWEEN.Tween( sceneCamPos ).to({
		x: 0,
		y: 300,
		z: 1050
	}, tweenFast )
	.easing( camEase ).start();
	jwplayer().pause(true);
	$jwPlayerContainer.animate({'height' : '0px'});
	
}


$('.cameraLink').click(function(){
	
	var $cameraLink = $(this);
	var camID = $cameraLink.attr('id');
	var camFile = "quarry/" + camID + ".mov";
	var targetPos;
	
	if (camID != currentCamID){
		jwplayer().pause(true);
		$jwPlayerContainer.animate({'height' : '0px'});
		
		if (camID == "c0"){
			targetPos = new THREE.Vector3(0,-10,30);
			currentPos = new THREE.Vector3(0,-10,30);
		} else if (camID == "c1"){
			targetPos = new THREE.Vector3(0,0,60);
			currentPos = new THREE.Vector3(0,0,60);
		} else if (camID == "c2"){
			targetPos = new THREE.Vector3(0,200,800);
			currentPos = new THREE.Vector3(0,200,800);
		}

		var sceneCamPos = camera.position; //for use in tweening the scene camera
		camPos = new THREE.Vector3(currentPos.x, currentPos.y,currentPos.z);

		//currentRot = camObj.rotation;
		//camRot = new THREE.Vector3(currentRot.x,currentRot.y,currentRot.z);

		camera.fov = zoomOutFov;

		new TWEEN.Tween( sceneCamPos ).to({
			x: targetPos.x,
			y: targetPos.y + 1,
			z: targetPos.z + 5
		}, tweenSlow )
		.easing( camEase ).start();

		//PLAY THE VIDEO

		$jwPlayerContainer.delay(tweenSlow).animate({'height' : vidHeight + 'px'}, tweenFast, function(){
			jwplayer().load({
				streamer: 'rtmp://s250uka5zg5k26.cloudfront.net/cfx/st',
				file: camFile,
				image: 'images/posters/quarry/'+camID+'.jpg',
				provider: 'rtmp',
				mediaid: 'quarry_'+camID
			});
		});

		
	}
	
	return false;
	
});

//PRELOAD ALL THE VIDEO POSTER IMAGES
function preloadPosters(){
	$('.cameraLink').each(function(){
		var camID = $(this).attr('id');
		var camURL = 'images/posters/quarry/'+camID+'.jpg';
		$('<img/>')[0].src = camURL;
	});
}

// ANIMATE
function animate() {
	requestAnimationFrame( animate );
	render();
	TWEEN.update();
}

// RENDER
function render() {
	camera.updateProjectionMatrix();
	renderer.render( scene, camera );
}