//SCENE VARIABLES
var scene, renderer, loader, mesh;
var camera, keyboard;
var animating = false;
var rotSpeed = .02;

//MODEL VARIABLES
var modelPos = { x: -5, y: -15, z: 0 }
var modelLoaded = false;

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
var centerX = -5;
var centerZ = -2.5;
var mpi = Math.PI/180;
var totalCams = 8;
var incrementAngle = 360/totalCams;
var incrementRadians = incrementAngle * mpi;

//TWEENING VARIABLES
var camTweenOut, camTweenIn; //will allow the camera to zoom in and out on the thumbnails
var currentPos = new THREE.Vector3(0,0,0); //the coordinates the camera will focus on
var currentFov; //will be used for holding the tweened value of the fov
var zoomInFov = 15; //fov for closeup
var zoomOutFov = 60; //fov for standard view
var tweenSlow = 2000; //zoom time
var tweenFast = 500;

var camObj; //stores the camera that has been clicked on
var camEase = TWEEN.Easing.Cubic.EaseInOut; //easing function
var camPos; //stores the position of the thumbnail before it moves to center
var camRot; //stores the rotation of the thumbnail before it moves to center
var currentRot; //stores the tweened rotation value
var camLoader; //loads the camera image
var camScaleSmall = .5;
var camScaleLarge = 2;
var currentCamID;

//CONTROL THE PARENT FRAME
var frameHeight = '450px';
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
	camera.position.set(0,5,35); 
	camera.lookAt(modelPos);
	scene.add(camera);
	
	//PROJECTOR
	projector = new THREE.Projector();

	//KEYBOARD CONTROLS
	keyboard = new THREEx.KeyboardState();
	
	//ORIGIN
	/*var origin = new THREE.AxisHelper(); //x = red, y = green, z = blue
	scene.add( origin );*/
	
	//LIGHTS
	var directionalLight1 = new THREE.DirectionalLight( 0xffffff, .9 );
	directionalLight1.position.set( 1, 7, 7 );
	scene.add( directionalLight1 );

	var directionalLight2 = new THREE.DirectionalLight( 0xffffff, .7 );
	directionalLight2.position.set( 9, 6, -7 );
	scene.add( directionalLight2 );

	var directionalLight3 = new THREE.DirectionalLight( 0xffffff, .3 );
	directionalLight3.position.set( -1, 5, 8 );
	scene.add( directionalLight3 );

	var directionalLight4 = new THREE.DirectionalLight( 0xffffff, .5 );
	directionalLight4.position.set( -14, 4, -10 );
	scene.add( directionalLight4 );

	//ADD MODEL
	
	loader = new THREE.JSONLoader();
	loader.load("https://s3.amazonaws.com/burn/models/build-o.js",function(geometry){
		mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial());
		scene.add( mesh );
		mesh.position.set(modelPos.x,modelPos.y,modelPos.z);
		modelLoaded = true;
		$model_loader.filter(":visible").fadeTo(500,0,function(){ //If the preloader was visible, we can hide it now
			$(this).hide();
		});
		//LOAD CAMERAS
		loadCams();
		preloadPosters();
	});
	
	//ADD LISTENERS
	activateListeners();
	
}


function loadCams(){
	camLoader = new THREE.JSONLoader();
	camLoader.load("model/cam.js",buildCams);
}

//BUILD CAMERA SPHERES
var buildCams = function(geometry){
	var startAngle = 0;
	var startRadians = startAngle + mpi;

	var phongMat = new THREE.MeshPhongMaterial( { ambient: 0x000000, color: 0xb81b1b, specular: 0x555555, shininess: 30 } )
	
	for ( var i = 0; i < totalCams; i ++ ) {
		
			
		var xp = centerX + Math.sin(startRadians) * circleRadius;
		var zp = centerZ + Math.cos(startRadians) * circleRadius;

		//var camObj = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial());
		var camObj = new THREE.Mesh( geometry, phongMat);

		camObj.name = "c"+i;
		camObj.position.x = xp;
		camObj.position.z = zp;
		camObj.position.y = 2.5;
		
		//camObj.doubleSided = true;
		
		//camObj.rotation.x = 90*mpi;
		camObj.rotation.y = i*incrementAngle*mpi; //MH - do this without degrees
		camObj.scale.set(camScaleSmall,camScaleSmall,camScaleSmall);
		startRadians += incrementRadians;
		scene.add( camObj );
		objects.push(camObj);
		
	}
}


function activateListeners(){
	document.getElementById('modelCanvas').addEventListener( 'mousedown', onDocumentMouseDown, false );
	$('#container').focus();
}


//ROTATION
function checkRotation(){
	
	var x = camera.position.x,
		y = camera.position.y,
		z = camera.position.z;

	if (keyboard.pressed("left")){ //MH - find a way to do this in a switch statement 
		camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
		camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
	} else if (keyboard.pressed("right")){
		camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
		camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);
	} else if(keyboard.pressed("up")){
		if (camera.fov >= zoomInFov){
			camera.fov = camera.fov -= .4;
			camera.updateProjectionMatrix();
		}
	} else if (keyboard.pressed("down")){
		if (camera.fov <=zoomOutFov){
			camera.fov = camera.fov += .4;
			camera.updateProjectionMatrix();
		}
	} 
	camera.lookAt(scene.position);
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
	file: 'build/c0.mov',
	autostart: false,
	provider: 'rtmp',
	mediaid: 'build_c0',
	image: 'images/posters/build/c0.jpg' ,
	skin: 'js/jw/skins/glow.zip',
	streamer: 'rtmp://s250uka5zg5k26.cloudfront.net/cfx/st',
	plugins: { 
		"js/jw/gapro-2.js": { //MH - Modified per request of Fitz
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
		if (isInitial == true){
			isInitial = false;
		} else {
			jwplayer().seek(elapsedTime);
		}
	})
});

//SEE IF WE'RE CLICKING A SPHERE
function onDocumentMouseDown( event ) {
	event.preventDefault();
	
	//INSTRUCTIONS
	
	$instructions.filter(":visible").fadeTo(tweenFast,0,function(){
		$instructions.css({'display' : 'none'});
		if (modelLoaded == false){
			//console.log('model has not been loaded');
			$model_loader.css({'display' : 'block'});
			$model_loader.fadeTo(tweenFast,1);
		}
	});
	
	var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
	projector.unprojectVector( vector, camera );
	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
	var intersects = ray.intersectObjects( objects );

	
	if ( intersects.length > 0 ) { //We've clicked one of the spheres
		
		camObj = intersects[0].object;
		camName = camObj.name;
		camID = parseInt(camName.slice(1,2));
		
		for ( var i = 0; i < totalCams; i ++ ) {
			var tempCamObj = objects[i];
			var tempCamName = tempCamObj.name;
			var tempCamID = parseInt(tempCamName.slice(1,2));
			if (tempCamID != camID){ //If we didn't click on the current camera
				if (tempCamObj.scale.x > 1){ //If it has been scaled up, scale it back down
					new TWEEN.Tween( tempCamObj.scale ).to({
						x: camScaleSmall,
						y: camScaleSmall,
						z: camScaleSmall
					}, tweenFast )
					.easing( camEase ).start();
				}
			}
		}
		
		var camRad = camID*incrementAngle*mpi;

		var targetX = centerX + Math.sin(camRad) * camRadius;
		var targetZ = centerZ + Math.cos(camRad) * camRadius;
		
		var sceneCamPos = camera.position; //for use in tweening the scene camera
		
		currentPos = camObj.position;
		camPos = new THREE.Vector3(currentPos.x, currentPos.y,currentPos.z);
		currentRot = camObj.rotation;
		camRot = new THREE.Vector3(currentRot.x,currentRot.y,currentRot.z);
		
		new TWEEN.Tween( sceneCamPos ).to({
			x: targetX,
			z: targetZ
		}, tweenSlow )
		.easing( camEase ).start();

		new TWEEN.Tween( camObj.scale ).to({
			x: camScaleLarge,
			y: camScaleLarge,
			z: camScaleLarge
		}, tweenSlow )
		.easing( camEase ).start();
		
		//camTweenIn.start();
		
	
		//PLAY THE VIDEO
		var objName = intersects[0].object.name;
		//var objSlice = objName.slice(1,2);
		var camFile = "build/" + objName + ".mov";
		elapsedTime = jwplayer().getPosition();
		
		$jwPlayerContainer.delay(tweenSlow).animate({'height' : vidHeight + 'px'}, tweenFast, function(){
			jwplayer().load({
				streamer: 'rtmp://s250uka5zg5k26.cloudfront.net/cfx/st',
				file: camFile,
				image: 'images/posters/build/' + objName + '.jpg' ,
				provider: 'rtmp',
				mediaid: 'build_'+camName
			});
		});
		return false;
	} else {
		
		if (camObj != undefined){
			new TWEEN.Tween( camObj.scale ).to({
				x: camScaleSmall,
				y: camScaleSmall,
				z: camScaleSmall
			}, tweenFast )
			.easing( camEase ).start();
			jwplayer().pause(true);
			$jwPlayerContainer.animate({'height' : '0px'});
		}
	}
}


$('.cameraLink').click(function(){
	
	var $cameraLink = $(this);
	var camID = $cameraLink.attr('id');
	var camIDInt = parseInt(camID.slice(1,2));
	var camFile = "build/" + camID + ".mov";
	var targetPos;
	
	if (camID != currentCamID){

		jwplayer().pause(true);
		$jwPlayerContainer.animate({'height' : '0px'});

		//Make all cams smaller
		for ( var i = 0; i < totalCams; i ++ ) {
			var tempCamObj = objects[i];
			var tempCamName = tempCamObj.name;
			var tempCamID = parseInt(tempCamName.slice(1,2));
			if (tempCamID != camID){ //If we didn't click on the current camera
				if (tempCamObj.scale.x > 1){ //If it has been scaled up, scale it back down
					new TWEEN.Tween( tempCamObj.scale ).to({
						x: camScaleSmall,
						y: camScaleSmall,
						z: camScaleSmall
					}, tweenFast )
					.easing( camEase ).start();
				}
			}
		}

		camObj = objects[camIDInt];
		var camRad = camIDInt*incrementAngle*mpi;

		var targetX = centerX + Math.sin(camRad) * camRadius;
		var targetZ = centerZ + Math.cos(camRad) * camRadius;
		
		var sceneCamPos = camera.position; //for use in tweening the scene camera
		
		currentPos = camObj.position;
		camPos = new THREE.Vector3(currentPos.x, currentPos.y,currentPos.z);
		currentRot = camObj.rotation;
		camRot = new THREE.Vector3(currentRot.x,currentRot.y,currentRot.z);
		
		new TWEEN.Tween( sceneCamPos ).to({
			x: targetX,
			z: targetZ
		}, tweenSlow )
		.easing( camEase ).start();

		new TWEEN.Tween( camObj.scale ).to({
			x: camScaleLarge,
			y: camScaleLarge,
			z: camScaleLarge
		}, tweenSlow )
		.easing( camEase ).start();

		//PLAY THE VIDEO
		elapsedTime = jwplayer().getPosition();
		$jwPlayerContainer.delay(tweenSlow).animate({'height' : vidHeight + 'px'}, tweenFast, function(){
			jwplayer().load({
				streamer: 'rtmp://s250uka5zg5k26.cloudfront.net/cfx/st',
				file: camFile,
				image: 'images/posters/build/'+camID+'.jpg',
				provider: 'rtmp',
				mediaid: 'build_'+camID
			});
		});

		
	}

	currentCamID = camID;
	
	return false;
	
});


//PRELOAD ALL THE VIDEO POSTER IMAGES
function preloadPosters(){
	$('.cameraLink').each(function(){
		var camID = $(this).attr('id');
		//console.log(camID);
		var camURL = 'images/posters/build/'+camID+'.jpg';
		$('<img/>')[0].src = camURL;
	});
}

// ANIMATE
function animate() {
	requestAnimationFrame( animate );
	checkRotation();
	render();
	TWEEN.update();
}

// RENDER
function render() {
	camera.updateProjectionMatrix();
	renderer.render( scene, camera );
}