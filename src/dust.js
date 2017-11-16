import _ from 'lodash'
import * as THREE from 'three'

export default class Dust {
  constructor () {
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff
    });
    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push(
    	new THREE.Vector3(),
    	new THREE.Vector3()
    );

    this.particles = _.range(30).map(() => {
      let s = new THREE.Line( this.geometry, material );
      s.position.set(1000,1000,1000)
      return s
    })

    this.object = new THREE.Group()
    this.object.add(...this.particles)
  }

  update(controls, camera) {
    if (controls.velocityVector.length() === 0) {
      this.object.visible = false
    } else {
      this.object.visible = true
      this.object.position.copy(controls.object.getWorldPosition())
      this.updateEffect(controls.velocityVector)
    }
  }

  rand () {
    return Math.random()*300-150
  }

  updateEffect(velocity) {
    let speed = THREE.Math.clamp(Math.log10(velocity.length()), 5, 10)
    let delta = velocity.clone().normalize().multiplyScalar(-speed)
    let plane = new THREE.Plane(delta.clone().normalize(), 200)

    let sp = THREE.Math.clamp(Math.log10(velocity.length()) * 2, 1, 20)
    let dl = velocity.clone().normalize().multiplyScalar(-sp)
    if (!this.geometry.vertices[1].equals(dl)) {
      this.geometry.vertices[1].copy(dl)
      this.geometry.verticesNeedUpdate = true
    }

    this.particles.forEach(particle => {
      if (Math.abs(plane.distanceToPoint(particle.position)) > 500) {
        particle.position.copy(plane.projectPoint(new THREE.Vector3(this.rand(),this.rand(),this.rand())))
        particle.position.sub(delta.multiplyScalar(Math.random()*10))
      } else {
        particle.position.add(delta)
      }
    })
  }
}
