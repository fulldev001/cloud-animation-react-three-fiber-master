// import * as THREE from "three"
import { THREE, SpriteAlignment } from 'three'

// Creating our globals.
var container;
var camera, scene, renderer;
var mesh, geometry, material;

init();

function init() {
	// First, create a container to put our canvas in.
	container = document.createElement('div');
	document.body.appendChild(container);

	// Create a canvas.
	var canvas = document.createElement('canvas');
	canvas.width = 32;
	canvas.height = window.innerHeight;

	// Draw the sky gradient.
	var context = canvas.getContext('2d');
	var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop(0, "#094b86");
	gradient.addColorStop(0.5, "#016ece");
	context.fillStyle = gradient;
	context.fillRect(0, 0, canvas.width, canvas.height);
	container.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
	container.style.backgroundSize = '32px 100%';

	// Create a new THREE camera - POV of 30, aspect ratio of window's dimensions, and near/far frustum.
	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 3000);

	// Initialize the camera's position in the center of the clouds.
	camera.position.x = 1000;
	camera.position.y = 250;
	camera.position.z = 1000;

	// Randomize the camera rotation.
	camera.rotation.y += Math.random()*-720;
	camera.rotation.z -= Math.random()*720;
	
	// Create a scene object.
	scene = new THREE.Scene();
	// Create a geoemtry object.
	geometry = new THREE.Geometry();

	// Create a texture for the shader material.
	var texture = THREE.ImageUtils.loadTexture('cloud.png', null, animate);
	texture.magFilter = THREE.LinearMipMapLinearFilter;
	texture.minFilter = THREE.LinearMipMapLinearFilter;
	
	// Create a blue fog.
	var fog = new THREE.Fog(0x3390ed, -100, 5000);

	material = new THREE.ShaderMaterial({
		uniforms: {
			"map": { type: "t", value: texture },
			"fogColor" : { type: "c", value: fog.color },
			"fogNear" : { type: "f", value: fog.near },
			"fogFar" : { type: "f", value: fog.far },
		},
		depthWrite: false,
		depthTest: false,
		transparent: true
	});
	
	// Create a 3d plane.
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(64,64));
	
	// Returns random position value which does not get too close to the camera.
	function ranCloud() {
		val = Math.random()*2000-100;
		while(val > 900 && val < 1100){
			ranCloud();
		}
		return val;
	}

	// Randomly generate clouds.
	for (var i = 0; i < 600; i++) {
		// Load texture.
		var cloudTex = THREE.ImageUtils.loadTexture('cloud.png');
		// Create material.
		var cloudMat = new THREE.SpriteMaterial({
			map: cloudTex,
			useScreenCoordinates: false,
			alignment: THREE.SpriteAlignment.topLeft,
			transparent:true,
			opacity:Math.random()*.9+.1
		});
		// Create sprite.
		var sprite = new THREE.Sprite(cloudMat);
		
		// Randomize sprite position.
		sprite.position.set(ranCloud(), ranCloud()*.4, ranCloud());

		// Randomize sprite scale.
		var scale = Math.random()*500;
		sprite.scale.set(scale, scale, scale);
		
		// Randomize sprite rotation.
		sprite.rotation = Math.random()*360;
		
		// Add the sprite to the scene.
		scene.add(sprite);
	}
	
	// Create a mesh
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.z = 1000;
	scene.add(mesh);

	// Lastly, create a renderer to display our scene.
	renderer = new THREE.WebGLRenderer({ antialias: false });
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	// Create a resize listener.
	window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize(event) {
	// On resize, the camera's aspect ratio should be updated.
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	// Update the renderer's size.
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	// Animate the frame.
	requestAnimationFrame(animate);
	// Apply constant rotation to the camera.
	camera.rotation.y += .0004;
	camera.rotation.z -= .0001;
	// Render the scene.
	renderer.render(scene, camera);
}