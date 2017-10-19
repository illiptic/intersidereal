import * as THREE from 'three'
import Star from './star.js'
import Planet from './planet.js'

export default class System {
  constructor (generator) {
    this.generator = generator
  }

  create ({scene}) {
    let {generator} = this

    let system = new THREE.Group()

    let star = new Star()
  	system.add(star.mesh)

  	let planetCount = (generator.random() * 10) + 1
  	let planets = []
  	for ( var i = 0; i < planetCount; i ++ ) {
  		let planet = new Planet(generator)
  		system.add( planet.mesh )
  		planets.push({position: planet.mesh.position.clone(), distance: planet.mesh.position.length()})
  	}

  	scene.add( system )
  	return planets
  }

  update () {
    // nothing yet
  }
}
