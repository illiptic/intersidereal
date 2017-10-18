require('./main.less')

import * as THREE from 'three'
import Stats from 'stats.js'
import MT from 'mersenne-twister'

import {getState, setState} from './stateManager.js'
import {initHUD, updateHUD, pingHUD} from './hud.js'
import FlyControls from './FlyControls.js'
import loadTextures, {loadSprite} from './textureLoader.js'

const generator = new MT(236575)

function initStats () {
	const stats = new Stats();
	stats.showPanel( 0 )
	document.body.appendChild( stats.dom )
	return stats
}

function init (background) {
	let container = document.getElementById('container')
	let scene = new THREE.Scene()

	scene.background = new THREE.CubeTextureLoader().load( ['/assets/stars.png','/assets/stars.png','/assets/stars.png','/assets/stars.png','/assets/stars.png','/assets/stars.png'] )

	let camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000000000 )
	camera.position.set(0,0,2000000)

	let controls = new FlyControls( camera )
	controls.movementSpeed = 1000;
	controls.domElement = container
	controls.rollSpeed = Math.PI / 12;
	controls.autoForward = false;
	controls.dragToLook = true;

	let renderer = new THREE.WebGLRenderer({logarithmicDepthBuffer: true, alpha: true})
	renderer.setSize( window.innerWidth, window.innerHeight )

	container.appendChild( renderer.domElement )

	return {renderer, scene, camera, controls}
}

function makeSector (scene, textures, sprite) {
	let system = new THREE.Group()

	let starSize = 700000
	let star = new THREE.Mesh( new THREE.SphereBufferGeometry( starSize, 16, 16 ), new THREE.MeshBasicMaterial({wireframe: false, depthWrite: false, opacity: 1, transparent: true}) );
	star.position.set(0,0,0)
	star.opacity = 0
  star.add(new THREE.PointLight( 0xFDFDFD, 2 ));
	system.add(star)

	let glowMaterial = new THREE.SpriteMaterial({
		map: sprite, //new THREE.TextureLoader().load( '/assets/glow.png' ),
		//useScreenCoordinates: false, alignment: THREE.SpriteAlignment.center,
		color: 0xffffff, transparent: false, blending: THREE.AdditiveBlending
	})
	let glow = new THREE.Sprite( glowMaterial )
	glow.scale.set(30*starSize, 30*starSize, 1)
	star.add(glow)

	let planetCount = (generator.random() * 10) + 1
	let planets = []
	for ( var i = 0; i < planetCount; i ++ ) {
		let x = generator.random() * 1000000000 - 500000000
		let y = generator.random() * 1000000000 - 500000000
		let z = generator.random() * 1000000000 - 500000000
		let planet = new THREE.Mesh( new THREE.SphereBufferGeometry( generator.random() * 100000 + 2500, 16, 16 ), new THREE.MeshPhongMaterial({map: textures[i % textures.length]}) );
		planet.position.set(x,y,z).clampLength(58000000, 800000000)
		system.add( planet )
		planets.push({x, y, z, distance: planet.position.length()})
	}

	scene.add( system )
	return planets
}

let stats = initStats()
let renderer, scene, camera, controls
loadSprite('stars')
	.then(background => {
		return {renderer, scene, camera, controls} = init(background)
	}).then(loadTextures)
	.then(textures => {
		return loadSprite('lensflare0centered').then(sprite => {
			return {textures, sprite}
		})
	})
	.then(({textures, sprite}) => {
		initHUD({planets: makeSector(scene, textures, sprite), teleport})
		requestAnimationFrame( animate )
	})


// var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// var skybox = new THREE.Mesh( new THREE.BoxGeometry(2000, 2000, 2000, 1, 1, 1 ), material );
// skybox.scale.set(-1,1,1)
// scene.add( skybox );

let prevT = 0

let frustum = new THREE.Frustum()
let cameraViewProjectionMatrix = new THREE.Matrix4()

function animate(t) {
  requestAnimationFrame( animate )
  stats.begin()

  let delta = (t-prevT)/1000

	controls.update( delta );

	updateHUD( controls )

	// frustum
	camera.updateMatrixWorld(); // make sure the camera matrix is updated
	camera.matrixWorldInverse.getInverse( camera.matrixWorld );
	frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
	scene.children.forEach(c => {
		if (c.type === 'Group') {
			let projs = c.children.map(o => {
				if (frustum.intersectsObject( o )) {
					let d = o.position.distanceTo(camera.position)
					return {d, coords: o.position.clone().project(camera), id: o.uuid}
				}
			}).filter(o => !!o)

			pingHUD( projs )
		}
	})

	// let close = false
	// for (let i in starField.geometry.vertices) {
	// 	let v = starField.geometry.vertices[i]
	// 	let dist = v.distanceTo(camera.position)
	// 	if (dist < 100) {
	// 		setSphere(v)
	// 		close = true
	// 		break;
	// 	}
	// }
	// if (!close) {
	// 	hideSphere()
	// }
	renderer.render( scene, camera );

  prevT = t
  stats.end()
}

function teleport ({x,y,z}) {
	camera.position.set(x,y,z - 200000)
	camera.lookAt({x,y,z})
}
