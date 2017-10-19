import * as THREE from 'three'
import {loadTexture} from './loaders.js'

const textures = [
  'earthmap1k.jpg',
  'jupitermap.jpg',
  'mars_1k_color.jpg',
  'mercurymap.jpg',
  'plutomap1k.jpg'
]

export default class Planet {
  constructor (generator) {
    let x = generator.random() * 1000000000 - 500000000
    let y = generator.random() * 1000000000 - 500000000
    let z = generator.random() * 1000000000 - 500000000
    let size = generator.random() * 100000 + 2500

    let texture = textures[Math.floor(generator.random() * 5)]

    this.mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(size, 32, 32),
      new THREE.MeshPhongMaterial({map: loadTexture(texture)})
    );
    this.mesh.position.set(x,y,z).clampLength(58000000, 800000000)
  }
}
