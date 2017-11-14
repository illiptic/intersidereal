import * as THREE from 'three'
import {loadTexture, loadModel} from './loaders.js'

const path = 'ships/'

export default class Ship {
  constructor (model) {
    this.mesh = new THREE.Group()
    this.createMesh('spaceship')
  }

  createMesh (model) {
    loadModel(path + model).then(ship => {
  		ship.scale.set(10, 10, 10)
      ship.rotation.set(0, -Math.PI/2, 0)
      this.mesh.add(ship)
  	})
  }

  // createThruster () {
  //   let material = new THREE.SpriteMaterial({
  // 		map: loadTexture('ships/thruster.png'),
  // 		transparent: true, blending: THREE.AdditiveBlending
  // 	})
  // 	let thruster = new THREE.Sprite( material )
  //   thruster.position.set(0, 0, 0)
  //   thruster.scale.set(50,100,100)
  //   return thruster
  // }
}
