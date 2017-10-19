import _ from 'lodash'
import {Frustum, Matrix4} from 'three'
import {getContainerDimensions} from './utils.js'
// import {getState} from './stateManager.js'

// domNodes
const hud = document.getElementById('hud')
const moveVector = document.getElementById('moveVector')
const moveVectorY = document.getElementById('moveVectorY')
const accel = _.fromPairs(['x', 'y', 'z'].map(c => [c, document.getElementById('accel' + c.toUpperCase())]))
const pos = _.fromPairs(['x', 'y', 'z'].map(c => [c, document.getElementById('world' + c.toUpperCase())]))
const planetList = document.getElementById('planetList')

const pings = {}
const frustum = new Frustum()

export function initHUD ( {planets, teleport} ) {
  listPlanets(planets, teleport)
}

export function updateHUD ( scene, controls ) {
  setAccelerometer(controls.velocityVector, controls.thrustVector)
  setPosition(controls.object.getWorldPosition())
  setPings(getVisibleObjects(scene.children[0], controls.object))
}

export function setPings ( projections ) {
  _.forEach(pings, p => {p.visible = false})

  projections.forEach(({id, coords, d}) => {
    if (!pings[id]) {
      pings[id] = { id, ...createPing(id) }
    }
    pings[id].visible = true
    pings[id].dist.innerHTML = formatNumber(d)
    var container = getContainerDimensions()
    var halfWidth  = container.size[ 0 ] / 2
    var halfHeight = container.size[ 1 ] / 2

    pings[id].el.style.left = Math.round(coords.x * halfWidth + halfWidth) + 'px'
    pings[id].el.style.top = Math.round(- coords.y * halfHeight + halfHeight) + 'px'
  })

  let rejects = _.reject(pings, 'visible')
  rejects.map(p => {
    if (p.el.parentNode) { hud.removeChild(p.el) }
    else {debugger}
    return p.id
  }).forEach(id => { delete pings[id] })
}

function getVisibleObjects (system, camera) {
  camera.updateMatrixWorld(); // make sure the camera matrix is updated
	camera.matrixWorldInverse.getInverse( camera.matrixWorld );
	frustum.setFromMatrix( new Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
	// scene.children.forEach(c => {
	// 	if (c.type === 'Group') {
			return system.children.map(o => {
				if (frustum.intersectsObject( o )) {
					let d = o.position.distanceTo(camera.position)
					return {d, coords: o.position.clone().project(camera), id: o.uuid}
				}
			}).filter(o => !!o)
	// })
}

function createPing (id) {
  let el = document.createElement('div')
  let dist = document.createElement('div')
  dist.className = 'distance'
  el.appendChild(dist)
  el.className = 'ping ' + id
  hud.appendChild(el)
  return {el, dist}
}

function setAccelerometer(velocity, thrust) {
  let x2,y2
  if (thrust.x && thrust.z) {
    x2 = thrust.x * 25
    y2 = thrust.z * 12
  } else {
    x2 = thrust.x * 42
    y2 = thrust.z * 15
  }
  moveVector.setAttribute('x2', parseInt(moveVector.x1.baseVal.value) + x2)
  moveVector.setAttribute('y2', parseInt(moveVector.y1.baseVal.value) + y2)
  moveVectorY.setAttribute('y2', parseInt(moveVector.y1.baseVal.value) - thrust.y * 50)

  _.forEach(velocity, (v, k) => accel[k].innerHTML = formatNumber(k === 'z' ? -v : v))
}

function setPosition(position) {
  _.forEach(position, (v, k) => pos[k].innerHTML = formatNumber(v))
}

function listPlanets (planets, teleport) {
  planets.forEach(({position, distance}) => {
    let item = document.createElement('tr')
    let c1 = document.createElement('td')
    let c2 = document.createElement('td')
    item.onclick = teleport.bind(null, position)
    let {x,y,z} = position
    c1.innerHTML = formatNumbers([x,y,z]).join('<br/>')
    c2.innerHTML = formatNumber(distance)
    item.appendChild(c1)
    item.appendChild(c2)
    planetList.appendChild(item)
  });
}

const formatNumbers = (nums) => nums.map(formatNumber)
const formatNumber = (num) => num.toPrecision(3).split(/e[\+\-]/).join(' e<sup>')+'</sup>'
