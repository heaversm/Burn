//SCENE VARIABLES
var scene, renderer, loader, mesh;
var camera, keyboard;
var animating = false;
var rotSpeed = .02;

//MODEL VARIABLES
var modelPos = { x: 0, y: -15, z: 0 }

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
var circleRadius = 18; //distance of cameras from center of model
var camRadius = 25; //distance of scene camera from center of model
var diameter = circleRadius*2;
var centerX = 0;
var centerZ = 0;
var mpi = Math.PI/180;
var totalCams = 1;
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

//CONTROL THE PARENT FRAME
var $sharepos = $('#sharepos', window.parent.document);
$sharepos.css({'top' : '657px'});

var $jwPlayerContainer = $('#jwPlayerContainer');
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
	camera.position.set(0,5,35); 
	camera.lookAt(modelPos);
	scene.add(camera);
	
	//PROJECTOR
	projector = new THREE.Projector();

	//KEYBOARD CONTROLS
	keyboard = new THREEx.KeyboardState();
	
	//ORIGIN
	//ORIGIN
	var origin = new THREE.AxisHelper(); //x = red, y = green, z = blue
	//scene.add( origin );
	
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
	
	var modelMat = new THREE.MeshPhongMaterial({
		color		: 0xffffff,
		shininess	: 5,
		reflectivity: 0, 
		specular	: 0xffffff,
		shading		: THREE.SmoothShading
	});
	
	//console.log (modelMat);
	
	loader = new THREE.JSONLoader();
	loader.load("http://d38sbyoqrn4u3p.cloudfront.net/models/shoot-o.js",function(geometry){
		mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial());
		scene.add( mesh );
		mesh.position.set(modelPos.x,modelPos.y,modelPos.z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		loadCams();
	});

}

function loadCams(){
	camLoader = new THREE.JSONLoader();
	camLoader.load("model/cam.js",buildCams);
}


//BUILD CAMERA SPHERES
var buildCams = function(geometry){
	var startAngle = 0;
	var camSize = 2;
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
		camObj.position.y = 0;
		camObj.doubleSided = true;
		//camObj.rotation.x = 90*mpi;
		//camObj.rotation.y = -i*incrementAngle*mpi; //MH - do this without degrees
		startRadians += incrementRadians;

		scene.add( camObj );
		objects.push(camObj);
		
	}
	
	activateListeners();
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
	file: 'studio/c0.mov',
	mediaid: 'studio_c0',
	autostart: false,
	image: 'images/posters/studio/c0.jpg',
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
	var $instructions = $('#instructions');
	$instructions.fadeTo(300,0,function(){
		$instructions.css({'display' : 'none'});
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
						x: 1,
						y: 1,
						z: 1
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
			x: 3,
			y: 3,
			z: 3
		}, tweenSlow )
		.easing( camEase ).start();
		
		//camTweenIn.start();
		
	
		//PLAY THE VIDEO
		var objName = intersects[0].object.name;
		var camFile = "studio/c" + camID + ".mov";
		elapsedTime = jwplayer().getPosition();
		
		$('#jwPlayerContainer').delay(tweenSlow).animate({'height' : vidHeight + 'px'}, tweenFast, function(){
			jwplayer().load({
				streamer: 'rtmp://s250uka5zg5k26.cloudfront.net/cfx/st',
				file: camFile,
				image: 'images/posters/studio/c' + camID + '.jpg' ,
				provider: 'rtmp',
				mediaid: camName
			});
		});
		return false;
	} else {
		
		if (camObj != undefined){
			new TWEEN.Tween( camObj.scale ).to({
				x: 1,
				y: 1,
				z: 1
			}, tweenFast )
			.easing( camEase ).start();
			jwplayer().pause(true);
			$('#jwPlayerContainer').animate({'height' : '0px'});
		}
	}
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