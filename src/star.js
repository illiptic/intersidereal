import * as THREE from 'three'
import {loadTexture} from './loaders.js'

export default class Star {
  constructor (position) {
    let starSize = 700000 // make random?
  	this.mesh = new THREE.Mesh( new THREE.SphereBufferGeometry( starSize, 16, 16 ), new THREE.MeshBasicMaterial({wireframe: false, depthWrite: false, opacity: 1, transparent: true}) );
    this.mesh.position.set(0,0,0)

    this.light = new THREE.PointLight( 0xFDFDFD, 1.5 )
    this.mesh.add(this.light);

    let glowMaterial = new THREE.SpriteMaterial({
  		map: loadTexture('lensflare0centered.png'),
  		color: 0xffffff, transparent: false, blending: THREE.AdditiveBlending
  	})
  	let glow = new THREE.Sprite( glowMaterial )
  	glow.scale.set(30*starSize, 30*starSize, 1) // find relationship with star size?
  	this.mesh.add(glow)
    this.mesh.name = 'star'
  }
}
