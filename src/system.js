import * as THREE from 'three'
import {loadCubeTexture} from './loaders.js'

import Star from './star.js'
import Planet from './planet.js'

export default class System {
  constructor (generator, scene) {
    let system = new THREE.Group()

    let star = new Star()
  	system.add(star.mesh)

  	let planetCount = (generator.random() * 10) + 1
  	let planets = []
  	for ( var i = 0; i < planetCount; i ++ ) {
  		let planet = new Planet(generator)
  		system.add( planet.mesh )
  		planets.push({update: planet.update.bind(planet), position: planet.mesh.position.clone(), distance: planet.mesh.position.length(), ...planet})
  	}

  	this.system = system
    this.planets = planets

    //TODO: vary with generator
    scene.background = loadCubeTexture('stars.png')
  }

  update () {
    this.planets.forEach(p => p.update && p.update())
  }
}
