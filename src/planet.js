import * as THREE from 'three'
import {loadTexture} from './loaders.js'

const path = 'planets/'

const maps = [
  { texture: 'earthmap.jpg', bump: 'earthbump.jpg'},
  { texture: 'jupitermap.jpg', bump: 'jupitermap.jpg'},
  { texture: 'marsmap.jpg', bump: 'marsbump.jpg'},
  { texture: 'mercurymap.jpg', bump: 'mercurybump.jpg'},
  { texture: 'plutomap.jpg', bump: 'plutobump.jpg'},
  { texture: 'saturnmap.jpg', bump: 'saturnmap.jpg'},
  { texture: 'uranusmap.jpg', bump: 'uranusmap.jpg'},
  { texture: 'venusmap.jpg', bump: 'venusbump.jpg'}
]

export default class Planet {
  constructor (generator) {
    this.orbitRadius = generator.random() * 742000000 + 58000000
    this.orbitAngle = generator.random() * 2 * Math.PI
    this.orbitSpeed = 0.00000001
    this.orbitPlane = this.generateOrbit(generator)
    this.radius = generator.random() * 100000 + 2500
    this.rotation = Math.PI / 720 / 60 // ~1 deg/s

    this.createMesh(generator, this.radius)
  }

  createMesh (generator, size) {
    let i = Math.floor(generator.random() * 8)
    let {texture, bump} = maps[i]

    this.mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(size, 32, 32),
      new THREE.MeshPhongMaterial({
        map: loadTexture(path+texture),
        bumpMap: loadTexture(path+bump),
        shininess: 30
      })
    );

    this.mesh.name = 'planet'
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
    this.orbitAngle = (this.orbitAngle + this.orbitSpeed)%(2 * Math.PI)
    this.mesh.position.copy(this.getPosition(this.orbitAngle, this.orbitPlane.a, this.orbitPlane.b, this.orbitRadius))
  }
}
