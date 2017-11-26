import * as THREE from 'three'
import Stats from 'stats.js'
import MT from 'mersenne-twister'

// import {initHUD, updateHUD} from './hud.js'
import FlyControls from './FlyControls.js'

import Ship from './ship.js'
import System from './system.js'
import Dust from './dust.js'

import EffectComposer from '../vendor/EffectComposer.js'
import RenderPass from '../vendor/RenderPass.js'
import ShaderPass from '../vendor/ShaderPass.js'
import BlackholeShader from '../vendor/BlackholeShader.js'

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
}

let updateHUD

export function init (container, update) {
  updateHUD = update
  objects.stats = initStats()
  objects.scene = new THREE.Scene()
  objects.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000000000 )
  objects.ship = initShip(objects.scene, objects.camera)
  objects.dust = initDust(objects.scene)

  objects.controls = initControls(objects.ship, objects.camera, container)
  objects.renderer = initRenderer(objects.scene, objects.camera, container)

  objects.sector = makeSector(objects.scene, 236575)

  // objects.hud = initHUD({})

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
    updateHUD({system: sector.system, camera})
  	// updateHUD( sector.system, controls, camera, jump.inProgress )

  	renderer.render( delta );

    prevT = t
    stats.end()
  }

  requestAnimationFrame( animate )
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

function initRenderer (scene, camera, container) {
  const renderer = new THREE.WebGLRenderer({logarithmicDepthBuffer: true, alpha: true})
	renderer.setSize( window.innerWidth, window.innerHeight )
	container.appendChild( renderer.domElement )

  const composer = new EffectComposer( renderer );

  const renderPass = objects.renderPass = new RenderPass( scene, camera )
  renderPass.renderToScreen = true
  composer.addPass(renderPass)

  const warpPass = objects.warpPass = new ShaderPass( BlackholeShader )
  warpPass.enabled = false
  composer.addPass(warpPass)

  return composer
}

function makeSector (scene, seed, currentSector) {
  if (currentSector) {
		scene.remove(currentSector.system)
	}
	const newsector = new System(new MT(seed), scene)
	scene.add(newsector.system)
	return newsector
}

function initJump () {
  objects.renderPass.renderToScreen = false
  objects.warpPass.renderToScreen = true
  objects.warpPass.enabled = true
  objects.warpPass.uniforms[ 'u_mass' ].value = 0.0001
  objects.warpPass.uniforms[ 'u_clickedTime' ].value = 0.01
}

function endJump() {
  objects.renderPass.renderToScreen = true
  objects.warpPass.renderToScreen = false
  objects.warpPass.enabled = false
}

function animateJump (jumpState) {
  let mass = objects.warpPass.uniforms[ 'u_mass' ]
  if (mass.value < 0.0001) {
    jumpState.inProgress = false
    endJump()
  } else if (jumpState.inProgress === 'in' && mass.value > 0.7) {
    jumpState.inProgress = 'out'
    objects.sector = makeSector(objects.scene, jumpState.seed, objects.sector)
  } else {
    mass.value *= jumpState.inProgress === 'in' ? 1.1 : 0.9
    objects.warpPass.uniforms[ 'u_clickedTime' ].value += 0.037
  }
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
		state.jump.inProgress = 'in'
		initJump()
	} else if (event.keyCode >= 48 && event.keyCode <= 57) {
		state.jump.seed += (event.keyCode - 48)
	}
}

function attachEventListeners () {
  window.addEventListener( 'keypress', onKeyPress, false );
}
