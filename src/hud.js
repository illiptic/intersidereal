import _ from 'lodash'
// import {getState} from './stateManager.js'
const hud = document.getElementById('hud')
const moveVector = document.getElementById('moveVector')
const moveVectorY = document.getElementById('moveVectorY')
const accel = {
  x: document.getElementById('accelX'),
  y: document.getElementById('accelY'),
  z: document.getElementById('accelZ')
}
const pos = _.fromPairs(['x', 'y', 'z'].map(c => [c, document.getElementById('world' + c.toUpperCase())]))
const planetList = document.getElementById('planetList')

export function initHUD ( {planets, teleport} ) {
  listPlanets(planets, teleport)
}

export function updateHUD ( controls ) {
  setAccelerometer(controls.velocityVector, controls.thrustVector)
  setPosition(controls.object.getWorldPosition())
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
  planets.forEach(({x,y,z, distance}) => {
    let item = document.createElement('tr')
    let c1 = document.createElement('td')
    let c2 = document.createElement('td')
    item.onclick = teleport.bind(null, {x,y,z})
    c1.innerHTML = formatNumbers([x,y,z]).join('<br/>')
    c2.innerHTML = formatNumber(distance)
    item.appendChild(c1)
    item.appendChild(c2)
    planetList.appendChild(item)
  });
}

const formatNumbers = (nums) => nums.map(formatNumber)
const formatNumber = (num) => num.toPrecision(3).split(/e[\+\-]/).join(' e<sup>')+'</sup>'
