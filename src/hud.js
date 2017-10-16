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
  setAccelerometer(controls.velocityVector, controls.maxMovementSpeed)
  setPosition(controls.object.getWorldPosition())
}

function setAccelerometer(aV, max) {
  moveVector.setAttribute('x2', parseInt(moveVector.x1.baseVal.value) + Math.round(aV.x/max*40))
  moveVector.setAttribute('y2', parseInt(moveVector.y1.baseVal.value) + Math.round(aV.z/max*15))
  moveVectorY.setAttribute('y2', parseInt(moveVector.y1.baseVal.value) + Math.round(-aV.y/max*50))

  _.forEach(aV, (v, k) => accel[k].innerText = Math.round(k === 'z' ? -v : v))
}

function setPosition(position) {
  _.forEach(position, (v, k) => pos[k].innerText = v.toPrecision(2))
}

function listPlanets (planets, teleport) {
  planets.forEach(({x,y,z, distance}) => {
    let item = document.createElement('tr')
    let c1 = document.createElement('td')
    let c2 = document.createElement('td')
    item.onclick = teleport.bind(null, {x,y,z})
    c1.innerHTML = [x.toPrecision(2), y.toPrecision(2), z.toPrecision(2)].join('<br/>')
    c2.innerHTML = distance.toPrecision(2)
    item.appendChild(c1)
    item.appendChild(c2)
    planetList.appendChild(item)
  });
}
