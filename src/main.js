import * as THREE from 'three'
import Stats from 'stats.js'
import MT from 'mersenne-twister'

import {initHUD, updateHUD} from './hud.js'
import FlyControls from './FlyControls.js'

import Ship from './ship.js'
import System from './system.js'
import Dust from './dust.js'

export default {
  init,
  run
}

const state = {
  jump : {
    listening: false,
    seed: '',
    inProgress: false
  }
}

const objects = {
  jumpEffect: null
}

export function init () {
  objects.stats = initStats()
  objects.scene = new THREE.Scene()
  objects.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000000000 )
  objects.ship = initShip(objects.scene, objects.camera)
  objects.dust = initDust(objects.scene)

  let container = document.getElementById('container')
  objects.controls = initControls(objects.ship, objects.camera, container)
  objects.renderer = initRenderer(container)

  objects.sector = makeSector(objects.scene, 236575)

  objects.hud = initHUD({})

  attachEventListeners()
}

export function run () {
  let prevT = 0

  function animate(t) {
    let { jump } = state
    let { scene, stats, controls, camera, dust, ship, sector, renderer } = objects

    requestAnimationFrame( animate )
    stats.begin()

    let delta = (t-prevT)/1000

  	if (jump.inProgress) {
  		animateJump(jump)
  	}

  	controls.update( delta )
  	dust.update(controls, camera)
  	ship.update(controls)
    sector.update()
  	updateHUD( sector.system, controls, camera )

  	renderer.render( scene, camera );

    prevT = t
    stats.end()
  }

  requestAnimationFrame( animate )
}

function animateJump (jumpState) {
  if (objects.jumpEffect.scale.length() > 500) {
    jumpState.inProgress = false
    objects.sector = makeSector(objects.scene, jumpState.seed, objects.sector)
    objects.jumpEffect.parent.remove(objects.jumpEffect)
  } else {
    objects.jumpEffect.scale.multiplyScalar(1.25)
  }
}

function initStats () {
	const stats = new Stats();
	stats.showPanel( 0 )
	document.body.appendChild( stats.dom )
	return stats
}

function initShip (scene, camera) {
	const ship = new Ship()
	ship.mesh.position.set(5000000,0,1999900)
	ship.mesh.add(camera)
	scene.add(ship.mesh)
  return ship
}

function initDust (scene) {
  const dust = new Dust()
	scene.add(dust.object)
  return dust
}

function initControls (ship, camera, container) {
  const controls = new FlyControls( ship.mesh, camera )
	controls.movementSpeed = 1000;
	controls.domElement = container
	controls.rollSpeed = Math.PI / 12;
	controls.autoForward = false;
	controls.dragToLook = true;
  return controls
}

function initRenderer (container) {
  const renderer = new THREE.WebGLRenderer({logarithmicDepthBuffer: true, alpha: true})
	renderer.setSize( window.innerWidth, window.innerHeight )
	container.appendChild( renderer.domElement )
  return renderer
}

function makeSector (scene, seed, currentSector) {
  if (currentSector) {
		scene.remove(currentSector.system)
	}
	const newsector = new System(new MT(seed), scene)
	scene.add(newsector.system)
	return newsector
}

function initJump (controls) {
	const effect = new THREE.Mesh( new THREE.SphereBufferGeometry( 10, 32, 32 ), new THREE.MeshBasicMaterial({color: 0, side: THREE.DoubleSide}) );
	controls.object.add(effect)
  return effect
}

const onKeyPress = event => {
  if ( event.altKey ) {
		return;
	}

  // Jump order
	if(event.keyCode === 106) {
		state.jump.listening = !state.jump.listening
		state.jump.seed = ''
	} else if (event.keyCode === 13) {
		state.jump.listening = false
		state.jump.inProgress = true
		objects.jumpEffect = initJump(objects.controls)
	} else if (event.keyCode >= 48 && event.keyCode <= 57) {
		state.jump.seed += (event.keyCode - 48)
	}
}

function attachEventListeners () {
  window.addEventListener( 'keypress', onKeyPress, false );
}
