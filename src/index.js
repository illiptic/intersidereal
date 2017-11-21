require('./main.less')

import * as THREE from 'three'
import Stats from 'stats.js'
import MT from 'mersenne-twister'

import {getState, setState} from './stateManager.js'
import {initHUD, updateHUD, pingHUD} from './hud.js'
import FlyControls from './FlyControls.js'
import {loadSprite, loadCubeTexture} from './loaders.js'

import Ship from './ship.js'
import System from './system.js'
import Dust from './dust.js'

function initStats () {
	const stats = new Stats();
	stats.showPanel( 0 )
	document.body.appendChild( stats.dom )
	return stats
}

function init (background) {
	let container = document.getElementById('container')
	let scene = new THREE.Scene()

	scene.background = loadCubeTexture('stars.png')

	// Attach camera to ship
	let camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000000000 )
	let ship = new Ship()
	ship.mesh.position.set(5000000,0,1999900)
	ship.mesh.add(camera)
	scene.add(ship.mesh)

	let controls = new FlyControls( ship.mesh, camera )
	controls.movementSpeed = 1000;
	controls.domElement = container
	controls.rollSpeed = Math.PI / 12;
	controls.autoForward = false;
	controls.dragToLook = true;

	const dust = new Dust()
	scene.add(dust.object)

	let renderer = new THREE.WebGLRenderer({logarithmicDepthBuffer: true, alpha: true})
	renderer.setSize( window.innerWidth, window.innerHeight )

	container.appendChild( renderer.domElement )

	return {renderer, scene, camera, controls, dust, ship}
}

function makeSector (scene, seed) {
	let {currentSector} = getState()
	if (currentSector) {
		scene.remove(currentSector.system)
	}
	currentSector = new System(new MT(seed))
	scene.add(currentSector.system)
	setState({currentSector})
	return currentSector
}

let stats = initStats()
let {renderer, scene, camera, controls, dust, ship} = init()
let sector = makeSector(scene, 236575)
initHUD({planets: sector.planets, teleport})
requestAnimationFrame( animate )

// jumping vars
let listening = false
let seed = ''
let jumping = false
let effect

let prevT = 0

function animate(t) {
  requestAnimationFrame( animate )
  stats.begin()

  let delta = (t-prevT)/1000

	if (jumping) {
		if (effect.scale.length() > 100) {
			jumping = false
			sector = makeSector(scene, seed)
			scene.remove(effect)
		}
		effect.scale.multiplyScalar(1.25)
	}

	controls.update( delta );
	sector.update()
	dust.update(controls, camera)
	ship.update(controls)
	updateHUD( sector.system, controls, camera )

	renderer.render( scene, camera );

  prevT = t
  stats.end()
}

function teleport ({x,y,z}) {
	camera.position.set(x,y,z - 250000)
	camera.lookAt({x,y,z})
}

function initJump () {
	effect = new THREE.Mesh( new THREE.SphereBufferGeometry( 10, 32, 32 ), new THREE.MeshBasicMaterial({color: 0, side: THREE.DoubleSide}) );
	effect.position.copy(controls.object.position)
	scene.add(effect)
}


window.addEventListener( 'keypress', event => {
	if ( event.altKey ) {
		return;
	}
	if(event.keyCode === 106) {
		listening = true
		seed = ''
	} else if (event.keyCode === 13) {
		listening = false
		jumping = true
		initJump()
	} else if (event.keyCode >= 48 && event.keyCode <= 57) {
		seed += (event.keyCode - 48)
	}
}, false );
