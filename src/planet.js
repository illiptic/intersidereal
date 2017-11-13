import * as THREE from 'three'
import {loadTexture} from './loaders.js'

const path = 'planets/'

const textures = [
  'earthmap.jpg',
  'jupitermap.jpg',
  'marsmap.jpg',
  'mercurymap.jpg',
  'plutomap.jpg',
  'saturnmap.jpg',
  'uranusmap.jpg',
  'venusmap.jpg',
]

const bumpmaps = [
  'earthbump.jpg',
  'jupitermap.jpg',
  'marsbump.jpg',
  'mercurybump.jpg',
  'plutobump.jpg',
  'saturnmap.jpg',
  'uranusmap.jpg',
  'venusbump.jpg'
]

export default class Planet {
  constructor (generator) {
    // let x = generator.random() * 1000000000 - 500000000
    // let y = generator.random() * 1000000000 - 500000000
    // let z = generator.random() * 1000000000 - 500000000
    this.orbitRadius = generator.random() * 742000000 + 58000000
    this.orbitAngle = generator.random() * 2 * Math.PI
    this.orbitPlane = this.generateOrbit(generator)
    let size = this.radius = generator.random() * 100000 + 2500

    let i = Math.floor(generator.random() * 8)
    let texture = textures[i]
    let bumpmap = bumpmaps[i]

    this.mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(size, 32, 32),
      new THREE.MeshPhongMaterial({
        map: loadTexture(path+texture),
        bumpMap: loadTexture(path+bumpmap),
        shininess: 30
      })
    );
    this.mesh.name = 'planet'

    this.mesh.position.copy(this.getPosition(this.orbitAngle, this.orbitPlane.a, this.orbitPlane.b, this.orbitRadius))
    this.rotation = Math.PI / 720 / 60 // ~1 deg/s
  }

  /*
   * Source: http://mathworld.wolfram.com/SpherePointPicking.html
   */
  generateOrbit (generator) {
    const bound = Math.PI / 8
    const	t	= generator.random() * (2 * bound) - bound
  	const	c = generator.random() * (2 * bound) - bound / (Math.PI/2)

  	const	sf	= Math.sqrt( 1.0 - c*c );
    const st = Math.sin(t)
    const ct = Math.cos(t)

  	const normal = new THREE.Vector3( c * ct, sf, c * st )

    const plane = new THREE.Plane(normal)
    const a = new THREE.Vector3(1,0,0) // any, just to get a perpendicular
    a.cross(normal)
    const b = new THREE.Vector3()
    b.crossVectors(a, normal)

    return {
      a,
      b
    }
  }

  getPosition (theta, a, b, radius) {
    let direction = a.clone().multiplyScalar(Math.cos(theta)).add(b.clone().multiplyScalar(Math.sin(theta)))
    return direction.multiplyScalar(radius)
  }

  update () {
    this.mesh.rotation.y += this.rotation
    this.orbitAngle = (this.orbitAngle + 0.0001)%(2 * Math.PI)
    this.mesh.position.copy(this.getPosition(this.orbitAngle, this.orbitPlane.a, this.orbitPlane.b, this.orbitRadius))
  }
}
