import * as THREE from 'three'
import {loadTexture, loadModel} from './loaders.js'

const path = 'ships/'

const thrusterParams = [
  [8.2, 0.05, 3.75], // left
  [8.2, 0.05, -3.75] // right
]

export default class Ship {
  constructor (model) {
    this.mesh = new THREE.Group()
    this.thrusters = []
    this.createMesh('spaceship')
  }

  createMesh (model) {
    loadModel(path + model).then(ship => {
  		// ship.scale.set(10, 10, 10)
      ship.rotation.set(0, -Math.PI/2, 0)
      this.mesh.add(ship)

      this.thrusters = thrusterParams.map(pos => this.createThruster(pos))
      ship.add(...this.thrusters)
  	})
  }

  // create reactor effect
  createThruster (position) {
    let geometry = new THREE.ConeGeometry( 0.5, 6, 32 );
    let texture = loadTexture(path + 'thruster.png')
    texture.flipY = false
    // texture.premultiplyAlpha = true
    let material = new THREE.MeshBasicMaterial( {map: texture, transparent: true, alphaTest: 0.5} );
    let thruster = new THREE.Mesh( geometry, material );
    thruster.position.set(...position)
    thruster.rotation.set(0, 0, -Math.PI/2)
    let light = new THREE.PointLight( 0xAAAAFF, 0.7, 200 )
    light.position.y = 5
    thruster.add(light)
    return thruster
  }

  update({thrustVector}) {
    this.thrusters.forEach(r => {
      r.visible = thrustVector.z < 0
    })
  }
}
