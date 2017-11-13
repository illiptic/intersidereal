require('./main.less')

import * as THREE from 'three'
import Stats from 'stats.js'
import MT from 'mersenne-twister'

import {getState, setState} from './stateManager.js'
import {initHUD, updateHUD, pingHUD} from './hud.js'
import FlyControls from './FlyControls.js'
import {loadSprite, loadCubeTexture} from './loaders.js'

import System from './system.js'

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

	scene.background = loadCubeTexture('stars.png')

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

function makeSector (scene) {
	let system = new System(generator)
	scene.add(system.system)
	return system
}

let stats = initStats()
let {renderer, scene, camera, controls} = init()
let sector = makeSector(scene)
initHUD({planets: sector.planets, teleport})
requestAnimationFrame( animate )

let prevT = 0

function animate(t) {
  requestAnimationFrame( animate )
  stats.begin()

  let delta = (t-prevT)/1000

	controls.update( delta );
	sector.update()
	updateHUD( scene, controls )

	renderer.render( scene, camera );

  prevT = t
  stats.end()
}

function teleport ({x,y,z}) {
	camera.position.set(x,y,z - 250000)
	camera.lookAt({x,y,z})
}
